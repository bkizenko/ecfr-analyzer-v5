package service

import (
	"context"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/data"
)

type AgencyService struct {
	AgencyDAO *dao.AgencyDAO
}

func (s *AgencyService) GetAgencyBySlug(
	ctx context.Context,
	slug string,
) (*data.Agency, error) {
	return s.AgencyDAO.FindBySlug(ctx, slug)
}
