package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sam-berry/ecfr-analyzer/server/httpresponse"
	"github.com/sam-berry/ecfr-analyzer/server/service"
)

type MetricAPI struct {
	Router        fiber.Router
	MetricService *service.MetricService
}

func (api *MetricAPI) Register() {
	api.Router.Get(
		"/metrics/titles", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			r, err := api.MetricService.GetTitleMetrics(ctx)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, r)
		},
	)

	api.Router.Get(
		"/metrics/agencies", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			r, err := api.MetricService.GetAgencyMetrics(ctx)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, r)
		},
	)

	api.Router.Get(
		"/metrics/agencies/:slug", func(c *fiber.Ctx) error {
			ctx := c.UserContext()
			slug := c.Params("slug")

			r, err := api.MetricService.GetMetricsForAgency(ctx, slug)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, r)
		},
	)

	api.Router.Get(
		"/metrics/agencies/:slug/sub-agencies", func(c *fiber.Ctx) error {
			ctx := c.UserContext()
			slug := c.Params("slug")

			r, err := api.MetricService.GetSubAgencyMetrics(ctx, slug)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, r)
		},
	)
}
