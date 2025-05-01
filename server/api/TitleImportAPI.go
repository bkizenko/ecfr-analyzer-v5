package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sam-berry/ecfr-analyzer/server/httpresponse"
	"github.com/sam-berry/ecfr-analyzer/server/service"
	"strings"
)

type TitleImportAPI struct {
	Router             fiber.Router
	TitleImportService *service.TitleImportService
}

func (api *TitleImportAPI) Register() {
	api.Router.Post(
		"/import-titles", func(c *fiber.Ctx) error {
			ctx := c.UserContext()
			titles := c.Query("titles")
			var titlesFilter []string
			if len(titles) > 0 {
				titlesFilter = strings.Split(titles, ",")
			} else {
				titlesFilter = []string{}
			}

			err := api.TitleImportService.ImportTitles(ctx, titlesFilter)

			if err != nil {
				return httpresponse.ApplyErrorToResponse(c, "Unexpected error", err)
			}

			return httpresponse.ApplySuccessToResponse(c, nil)
		},
	)
}
