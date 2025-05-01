package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sam-berry/ecfr-analyzer/server/httpresponse"
	"github.com/sam-berry/ecfr-analyzer/server/service"
)

type AgencyAPI struct {
	Router        fiber.Router
	AgencyService *service.AgencyService
}

func (api *AgencyAPI) Register() {
	api.Router.Get(
		"/agencies/:slug", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			slug := c.Params("slug")

			data, err := api.AgencyService.GetAgencyBySlug(ctx, slug)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, data)
		},
	)
}
