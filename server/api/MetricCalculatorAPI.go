package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sam-berry/ecfr-analyzer/server/httpresponse"
	"github.com/sam-berry/ecfr-analyzer/server/service"
)

// Read only API for testing internal metric calculation

type MetricCalculatorAPI struct {
	Router              fiber.Router
	AgencyMetricService *service.AgencyMetricService
	TitleMetricService  *service.TitleMetricService
}

func (api *MetricCalculatorAPI) Register() {
	api.Router.Get(
		"/calculate/agency-metrics/:slug", func(c *fiber.Ctx) error {
			ctx := c.UserContext()
			slug := c.Params("slug")

			r, err := api.AgencyMetricService.CountWordsAndSections(ctx, slug, "")

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, r)
		},
	)

	api.Router.Get(
		"/calculate/title-metrics", func(c *fiber.Ctx) error {
			ctx := c.UserContext()

			r, err := api.TitleMetricService.CountAllWordsAndSections(ctx)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, r)
		},
	)
}
