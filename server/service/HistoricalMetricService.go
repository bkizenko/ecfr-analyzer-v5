package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/data"
)

type HistoricalMetricService struct {
	ComputedValueDAO    *dao.ComputedValueDAO
	AgencyDAO           *dao.AgencyDAO
	MetricsSnapshotDAO  *dao.MetricsSnapshotDAO
	TitleMetricService  *TitleMetricService
	AgencyMetricService *AgencyMetricService
}

// CreateSnapshot creates a new snapshot of current metrics
func (s *HistoricalMetricService) CreateSnapshot(
	ctx context.Context,
	description string,
	snapshotDate time.Time,
) (*data.MetricsSnapshot, error) {
	// Create snapshot record
	snapshot, err := s.MetricsSnapshotDAO.CreateSnapshot(ctx, description, snapshotDate)
	if err != nil {
		return nil, fmt.Errorf("failed to create snapshot: %w", err)
	}

	// Get current title metrics
	titleMetrics, err := s.TitleMetricService.CountAllWordsAndSections(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to compute title metrics: %w", err)
	}

	// Save historical title metrics
	titleMetricsBytes, err := json.Marshal(titleMetrics)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal title metrics: %w", err)
	}

	historicalTitleKey := data.ComputedValueKeyHistoricalGlobalTitleMetrics(snapshot.SnapshotDate)
	err = s.ComputedValueDAO.Insert(ctx, &data.ComputedValue{
		Key:  historicalTitleKey,
		Data: titleMetricsBytes,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to save historical title metrics: %w", err)
	}

	// Get all agencies
	agencies, err := s.AgencyDAO.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get agencies: %w", err)
	}

	// Save metrics for each agency
	for _, agency := range agencies {
		agencyMetrics, err := s.AgencyMetricService.CountWordsAndSections(ctx, agency.Slug, "")
		if err != nil {
			// Log error but continue with other agencies
			fmt.Printf("Error computing metrics for agency %s: %v\n", agency.Name, err)
			continue
		}

		agencyMetricsBytes, err := json.Marshal(agencyMetrics)
		if err != nil {
			fmt.Printf("Error marshaling metrics for agency %s: %v\n", agency.Name, err)
			continue
		}

		historicalAgencyKey := data.ComputedValueKeyHistoricalAgencyMetric(agency.Id, snapshot.SnapshotDate)
		err = s.ComputedValueDAO.Insert(ctx, &data.ComputedValue{
			Key:  historicalAgencyKey,
			Data: agencyMetricsBytes,
		})
		if err != nil {
			fmt.Printf("Error saving historical metrics for agency %s: %v\n", agency.Name, err)
			continue
		}
	}

	return snapshot, nil
}

// GetHistoricalMetrics gets historical metrics for all years
func (s *HistoricalMetricService) GetHistoricalMetrics(
	ctx context.Context,
) (*data.HistoricalMetricsResponse, error) {
	// Get yearly snapshots
	snapshots, err := s.MetricsSnapshotDAO.GetYearlySnapshots(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get yearly snapshots: %w", err)
	}

	// Get agencies
	agencies, err := s.AgencyDAO.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get agencies: %w", err)
	}

	var titleMetrics []data.YearlyTitleMetrics
	var agencyMetrics []data.YearlyAgencyMetrics

	// Process each snapshot
	for _, snapshot := range snapshots {
		year := snapshot.SnapshotDate.Year()

		// Get title metrics for this snapshot
		historicalTitleKey := data.ComputedValueKeyHistoricalGlobalTitleMetrics(snapshot.SnapshotDate)
		titleMetric, err := s.ComputedValueDAO.FindByKey(ctx, historicalTitleKey)
		if err != nil {
			return nil, fmt.Errorf("failed to get title metrics for %d: %w", year, err)
		}

		if titleMetric != nil {
			var metric data.TitleMetricResponse
			if err := json.Unmarshal(titleMetric.Data, &metric); err != nil {
				return nil, fmt.Errorf("failed to unmarshal title metrics for %d: %w", year, err)
			}

			titleMetrics = append(titleMetrics, data.YearlyTitleMetrics{
				Year:         year,
				WordCount:    metric.WordCount,
				SectionCount: metric.SectionCount,
			})
		}

		// Get agency metrics for this snapshot
		yearlyAgencyMetric := data.YearlyAgencyMetrics{
			Year:     year,
			Agencies: make(map[string]int),
		}

		for _, agency := range agencies {
			historicalAgencyKey := data.ComputedValueKeyHistoricalAgencyMetric(agency.Id, snapshot.SnapshotDate)
			agencyMetric, err := s.ComputedValueDAO.FindByKey(ctx, historicalAgencyKey)
			if err != nil {
				fmt.Printf("Error getting metrics for agency %s in %d: %v\n", agency.Name, year, err)
				continue
			}

			if agencyMetric != nil {
				var metric data.AgencyMetricResponse
				if err := json.Unmarshal(agencyMetric.Data, &metric); err != nil {
					fmt.Printf("Error unmarshaling metrics for agency %s in %d: %v\n", agency.Name, year, err)
					continue
				}

				yearlyAgencyMetric.Agencies[agency.Name] = metric.WordCount
			}
		}

		agencyMetrics = append(agencyMetrics, yearlyAgencyMetric)
	}

	return &data.HistoricalMetricsResponse{
		TitleMetrics:  titleMetrics,
		AgencyMetrics: agencyMetrics,
	}, nil
}

// GetAgencyHistoricalMetrics gets historical metrics for a specific agency
func (s *HistoricalMetricService) GetAgencyHistoricalMetrics(
	ctx context.Context,
	slug string,
) (*data.AgencyHistoricalMetrics, error) {
	// Get the agency
	agency, err := s.AgencyDAO.FindBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("failed to find agency: %w", err)
	}

	// Get all snapshots
	snapshots, err := s.MetricsSnapshotDAO.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get snapshots: %w", err)
	}

	var metrics []*data.HistoricalAgencyMetricResponse

	// Get metrics for each snapshot
	for _, snapshot := range snapshots {
		historicalAgencyKey := data.ComputedValueKeyHistoricalAgencyMetric(agency.Id, snapshot.SnapshotDate)
		agencyMetric, err := s.ComputedValueDAO.FindByKey(ctx, historicalAgencyKey)
		if err != nil {
			return nil, fmt.Errorf("failed to get metrics for snapshot: %w", err)
		}

		if agencyMetric != nil {
			var metric data.AgencyMetricResponse
			if err := json.Unmarshal(agencyMetric.Data, &metric); err != nil {
				return nil, fmt.Errorf("failed to unmarshal metrics: %w", err)
			}

			metrics = append(metrics, &data.HistoricalAgencyMetricResponse{
				AgencyMetricResponse: metric,
				SnapshotDate:         snapshot.SnapshotDate,
			})
		}
	}

	return &data.AgencyHistoricalMetrics{
		Agency:  agency,
		Metrics: metrics,
	}, nil
}
