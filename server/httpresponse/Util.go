package httpresponse

import (
	"github.com/gofiber/fiber/v2"
	"log"
)

func ApplyErrorToResponse(c *fiber.Ctx, message string, err error) error {
	log.Println(err.Error())
	return c.Status(500).JSON(ErrorResponse(message))
}

func ApplySuccessToResponse(c *fiber.Ctx, body any) error {
	return c.Status(200).JSON(SuccessResponse(body))
}
