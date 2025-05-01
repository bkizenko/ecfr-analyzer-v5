package main

import (
	"context"
	"fmt"
	"github.com/gofiber/fiber/v2"
	_ "github.com/lib/pq"
	"github.com/sam-berry/ecfr-analyzer/server/api"
	"github.com/sam-berry/ecfr-analyzer/server/config"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/httpclient"
	"github.com/sam-berry/ecfr-analyzer/server/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	masterCtx, masterCancel := context.WithCancel(context.Background())
	defer masterCancel()

	var sigs = make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	db := config.ConnectToDatabase("ecfr-service")
	defer db.Close()
	config.ConfigureDB(db)

	app := config.InitHTTPApp()
	router := app.Group("/ecfr-service")

	httpClient := &httpclient.Client{HttpClient: http.DefaultClient}
	ecfrAPIClient := &httpclient.ECFRAPIClient{
		APIRoot:    "https://www.ecfr.gov/api",
		HttpClient: httpClient,
	}
	ecfrBulkDataClient := &httpclient.ECFRBulkDataClient{
		APIRoot:    "https://www.govinfo.gov/bulkdata/json/ECFR",
		HttpClient: httpClient,
	}

	agencyDAO := &dao.AgencyDAO{Db: db}
	titleDAO := &dao.TitleDAO{Db: db}
	titleImportDAO := &dao.TitleImportDAO{Db: db}
	computedValueDAO := &dao.ComputedValueDAO{Db: db}

	agencyService := &service.AgencyService{AgencyDAO: agencyDAO}
	agencyMetricService := &service.AgencyMetricService{AgencyDAO: agencyDAO, TitleDAO: titleDAO}
	agencyImportService := &service.AgencyImportService{
		HttpClient: ecfrAPIClient,
		AgencyDAO:  agencyDAO,
	}
	titleMetricService := &service.TitleMetricService{TitleDAO: titleDAO}
	titleImportService := &service.TitleImportService{
		HttpClient:     ecfrBulkDataClient,
		TitleImportDAO: titleImportDAO,
	}
	computedValueService := &service.ComputedValueService{
		TitleMetricService:  titleMetricService,
		AgencyMetricService: agencyMetricService,
		ComputedValueDAO:    computedValueDAO,
		AgencyDAO:           agencyDAO,
	}
	metricService := &service.MetricService{
		AgencyDAO:        agencyDAO,
		ComputedValueDAO: computedValueDAO,
	}

	registerAPIs(
		[]api.API{
			&api.AgencyAPI{
				Router:        router,
				AgencyService: agencyService,
			},
			&api.MetricAPI{
				Router:        router,
				MetricService: metricService,
			},
		},
	)

	router.Use(config.AdminAuthHandler)
	registerAPIs(
		[]api.API{
			&api.MetricCalculatorAPI{
				Router:              router,
				AgencyMetricService: agencyMetricService,
				TitleMetricService:  titleMetricService,
			},
			&api.ComputedValueAPI{
				Router:               router,
				ComputedValueService: computedValueService,
			},
			&api.AgencyImportAPI{
				Router:              router,
				AgencyImportService: agencyImportService,
			},
			&api.TitleImportAPI{
				Router:             router,
				TitleImportService: titleImportService,
			},
		},
	)

	go func() {
		startApp(app)
	}()

	go func() {
		sig := <-sigs
		log.Printf("Received signal %s, initiating graceful shutdown...", sig)
		masterCancel()
	}()

	<-masterCtx.Done()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Printf("HTTP server Shutdown: %v", err)
	}

	if err := db.Close(); err != nil {
		log.Printf("Error closing database: %v", err)
	}

	log.Println("Graceful shutdown complete.")
}

func startApp(router *fiber.App) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}
	log.Println(fmt.Sprintf("Starting app on :%v", port))
	err := router.Listen(":" + port)
	if err != nil {
		log.Fatal(err)
	}
}

func registerAPIs(apis []api.API) {
	for _, a := range apis {
		a.Register()
	}
}
