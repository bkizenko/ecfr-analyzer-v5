package config

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"log"
)

func InitHTTPApp() *fiber.App {
	application := fiber.New(
		fiber.Config{
			BodyLimit:      1 * 1024 * 1024,
			ReadBufferSize: 4096 * 5,
		},
	)

	application.Use(logger.New(
		logger.Config{
			TimeZone: "UTC",
			Format:   "[${time}] ${ip} ${status} - ${latency} ${method} ${path} ${queryParams}\n",
			Output:   log.Writer(),
		},
	))

	application.Use(cors.New())

	application.Use(
		recover.New(
			recover.Config{
				EnableStackTrace: true,
			},
		),
	)

	application.Use(compress.New())

	return application
}
