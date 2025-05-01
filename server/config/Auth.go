package config

import (
	"github.com/gofiber/fiber/v2"
	"os"
	"strings"
)

var AuthToken = os.Getenv("ECFR_ADMIN_TOKEN")

var AdminAuthHandler = func(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")

	token := strings.Split(authHeader, "Bearer ")
	if len(token) != 2 || token[1] != AuthToken {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	return c.Next()
}
