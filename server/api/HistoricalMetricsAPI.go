package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sam-berry/ecfr-analyzer/server/httpresponse"
	"github.com/sam-berry/ecfr-analyzer/server/service"
)

type HistoricalMetricsAPI struct {
	Router                  fiber.Router
	HistoricalMetricService *service.HistoricalMetricService
}

func (api *HistoricalMetricsAPI) Register() {
	// Public endpoint to get historical metrics data
	api.Router.Get(
		"/metrics/historical", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			data, err := api.HistoricalMetricService.GetHistoricalMetrics(ctx)
			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Failed to get historical metrics", err)
			}

			return httpresponse.ApplySuccessToResponse(c, data)
		},
	)

	// Public endpoint to get historical metrics for a specific agency
	api.Router.Get(
		"/metrics/historical/agencies/:slug", func(c *fiber.Ctx) error {
			ctx := c.UserContext()
			slug := c.Params("slug")

			data, err := api.HistoricalMetricService.GetAgencyHistoricalMetrics(ctx, slug)
			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Failed to get historical metrics for agency", err)
			}

			return httpresponse.ApplySuccessToResponse(c, data)
		},
	)

	// Admin endpoint to create a new snapshot
	api.Router.Post(
		"/metrics/historical/snapshots", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			description := c.Query("description", "Scheduled Snapshot")
			dateStr := c.Query("date", "")

			var snapshotDate time.Time
			var err error

			if dateStr == "" {
				snapshotDate = time.Now()
			} else {
				snapshotDate, err = time.Parse("2006-01-02", dateStr)
				if err != nil {
					return httpresponse.ApplyErrorToResponse(c, "Invalid date format. Use YYYY-MM-DD", err)
				}
			}

			snapshot, err := api.HistoricalMetricService.CreateSnapshot(ctx, description, snapshotDate)
			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Failed to create snapshot", err)
			}

			return httpresponse.ApplySuccessToResponse(c, snapshot)
		},
	)
}
