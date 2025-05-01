package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sam-berry/ecfr-analyzer/server/httpresponse"
	"github.com/sam-berry/ecfr-analyzer/server/service"
)

type AgencyImportAPI struct {
	Router              fiber.Router
	AgencyImportService *service.AgencyImportService
}

func (api *AgencyImportAPI) Register() {
	api.Router.Post(
		"/import-agencies", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			err := api.AgencyImportService.ImportAgencies(ctx)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, nil)
		},
	)
}
