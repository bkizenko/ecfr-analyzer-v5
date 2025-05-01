package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/ecfrdata"
	"github.com/sam-berry/ecfr-analyzer/server/httpclient"
)

type AgencyImportService struct {
	HttpClient *httpclient.ECFRAPIClient
	AgencyDAO  *dao.AgencyDAO
}

func (s *AgencyImportService) ImportAgencies(
	ctx context.Context,
) error {
	resp, err := s.HttpClient.Get(ctx, "/admin/v1/agencies.json")
	if err != nil {
		return fmt.Errorf("agencies list HTTP request failed, %w", err)
	}

	defer resp.Body.Close()
	var agenciesResp ecfrdata.AgenciesResponse
	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(&agenciesResp); err != nil {
		return fmt.Errorf("failed to unmarshal agencies list, %w", err)
	}

	for _, agency := range agenciesResp.Agencies {
		err = s.AgencyDAO.Insert(ctx, &agency)
		if err != nil {
			return fmt.Errorf("failed to insert agency, %v, %w", agency.Name, err)
		}
	}

	return nil
}
