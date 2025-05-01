package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"
)

var (
	dbUser                 = os.Getenv("ECFR_DB_USER")
	dbPwd                  = os.Getenv("ECFR_DB_PASS")
	dbTCPHost              = os.Getenv("ECFR_DB_HOST")
	dbPort                 = os.Getenv("ECFR_DB_PORT")
	dbName                 = os.Getenv("ECFR_DB_NAME")
	instanceConnectionName = os.Getenv("ECFR_DB_INSTANCE_CONNECTION_NAME")
	isDevelopment          = os.Getenv("ECFR_DEVELOPMENT")
)

func getLocalDBURI(appName string) string {
	return fmt.Sprintf(
		"application_name=%v host=%s user=%s password=%s port=%s database=%s sslmode=disable",
		appName,
		dbTCPHost,
		dbUser,
		dbPwd,
		dbPort,
		dbName,
	)
}

func getProdDBURI(appName string) string {
	socketDir, isSet := os.LookupEnv("DB_SOCKET_DIR")
	if !isSet {
		socketDir = "/cloudsql"
	}

	return fmt.Sprintf(
		"application_name=%s user=%s password=%s database=%s host=%s/%s",
		appName,
		dbUser,
		dbPwd,
		dbName,
		socketDir,
		instanceConnectionName,
	)
}

func ConnectToDatabase(appName string) *sql.DB {
	var dbURI string
	if isDevelopment == "true" {
		dbURI = getLocalDBURI(appName)
	} else {
		dbURI = getProdDBURI(appName)
	}

	db, err := sql.Open("postgres", dbURI)
	if err != nil {
		log.Fatal("Failed to open DB connection", err)
	}
	log.Println("Database connected.")
	return db
}

func ConfigureDB(db *sql.DB) {
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)
}
