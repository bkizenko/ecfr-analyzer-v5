package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/data"
)

type MetricService struct {
	AgencyDAO        *dao.AgencyDAO
	ComputedValueDAO *dao.ComputedValueDAO
}

func (s *MetricService) GetTitleMetrics(
	ctx context.Context,
) (*data.TitleMetricResponse, error) {
	titleMetrics, err := s.ComputedValueDAO.FindByKey(
		ctx,
		data.ComputedValueKeyGlobalTitleMetrics(),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to find title metrics, %w", err)
	}

	var m data.TitleMetricResponse
	if err = json.Unmarshal(titleMetrics.Data, &m); err != nil {
		return nil, fmt.Errorf("failed to unmarshal title metrics, %w", err)
	}

	return &m, nil
}

func (s *MetricService) GetAgencyMetrics(
	ctx context.Context,
) ([]*data.AgencyMetrics, error) {
	agencies, err := s.AgencyDAO.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to find agencies, %w", err)
	}

	agencyMetrics, err := s.ComputedValueDAO.FindByKeyPrefix(
		ctx,
		data.ComputedValueKeyAgencyMetricPrefix,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find agency metrics, %w", err)
	}

	var metricsMap = make(map[string]*data.ComputedValue, len(agencyMetrics))
	for _, metric := range agencyMetrics {
		agencyId := data.ParseComputedValueKey(metric.Key)[1]
		metricsMap[agencyId] = metric
	}

	var results = make([]*data.AgencyMetrics, len(agencies))
	for i, agency := range agencies {
		metric, ok := metricsMap[agency.Id]
		var metricResponse data.AgencyMetricResponse
		if ok {
			err := json.Unmarshal(metric.Data, &metricResponse)
			if err != nil {
				return nil, fmt.Errorf(
					"failed to unmarshal agency metrics, %v, %w",
					agency.Name,
					err,
				)
			}
		} else {
			metricResponse = data.DefaultAgencyMetrics()
		}

		results[i] = &data.AgencyMetrics{
			Agency:  agency,
			Metrics: &metricResponse,
		}
	}

	return results, nil
}

func (s *MetricService) GetMetricsForAgency(
	ctx context.Context,
	slug string,
) (*data.AgencyMetrics, error) {
	agency, err := s.AgencyDAO.FindBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("failed to find agency, %v, %w", slug, err)
	}

	agencyMetrics, err := s.ComputedValueDAO.FindByKey(
		ctx,
		data.ComputedValueKeyAgencyMetric(agency.Id),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find agency metrics, %v, %w", agency.Id, err)
	}

	var metricResponse data.AgencyMetricResponse
	if agencyMetrics == nil {
		metricResponse = data.DefaultAgencyMetrics()
	} else {
		err := json.Unmarshal(agencyMetrics.Data, &metricResponse)
		if err != nil {
			return nil, fmt.Errorf(
				"failed to unmarshal agency metrics, %v, %w",
				agency.Name,
				err,
			)
		}
	}

	return &data.AgencyMetrics{
		Agency:  agency,
		Metrics: &metricResponse,
	}, nil

}

func (s *MetricService) GetSubAgencyMetrics(
	ctx context.Context,
	slug string,
) ([]*data.AgencyMetrics, error) {
	agency, err := s.AgencyDAO.FindBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("failed to find agency, %v, %w", slug, err)
	}

	agencyMetrics, err := s.ComputedValueDAO.FindByKeyPrefix(
		ctx,
		data.CreateComputedValueKey(data.ComputedValueKeySubAgencyMetricPrefix, agency.Id),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find sub agency metrics, %v, %w", agency.Id, err)
	}

	var metricsMap = make(map[string]*data.ComputedValue, len(agencyMetrics))
	for _, metric := range agencyMetrics {
		metricsMap[metric.Key] = metric
	}

	var results = make([]*data.AgencyMetrics, len(agency.Children))
	for i, subAgency := range agency.Children {
		metric, ok := metricsMap[data.ComputedValueKeySubAgencyMetric(agency.Id, subAgency.Name)]
		var metricResponse data.AgencyMetricResponse
		if ok {
			err := json.Unmarshal(metric.Data, &metricResponse)
			if err != nil {
				return nil, fmt.Errorf(
					"failed to unmarshal agency metrics, %v, %w",
					subAgency.Name,
					err,
				)
			}
		} else {
			metricResponse = data.DefaultAgencyMetrics()
		}

		results[i] = &data.AgencyMetrics{
			Agency:  subAgency,
			Metrics: &metricResponse,
		}
	}

	return results, nil
}
