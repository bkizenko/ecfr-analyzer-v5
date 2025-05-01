package service

import (
	"context"
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/data"
	"sync"
)

type AgencyResult struct {
	Name   string
	Titles []int
}

var MaxConcurrentAgencyLookups = 10

type AgencyMetricService struct {
	AgencyDAO *dao.AgencyDAO
	TitleDAO  *dao.TitleDAO
}

func (s *AgencyMetricService) CountWordsAndSections(
	ctx context.Context,
	slug string,
	subAgencyNameFilter string,
) (*data.AgencyMetricResponse, error) {
	agency, err := s.AgencyDAO.FindBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("failed to find agency, %v, %w", slug, err)
	}

	var agencyResults []*AgencyResult
	if subAgencyNameFilter == "" {
		agencyResults = append(agencyResults, s.buildAgencyResult(agency))
		for _, childAgency := range agency.Children {
			agencyResults = append(agencyResults, s.buildAgencyResult(childAgency))
		}
	} else {
		for _, childAgency := range agency.Children {
			if childAgency.Name == subAgencyNameFilter {
				agencyResults = append(agencyResults, s.buildAgencyResult(childAgency))
				break
			}
		}
	}

	var messagesWG sync.WaitGroup

	messages := make(chan string)
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for message := range messages {
			log.Info(fmt.Sprintf("Agency Metrics Process: %v", message))
		}
	}()

	var agencyWg sync.WaitGroup
	var mu sync.Mutex
	var totalWordCount int
	var totalSectionCount int

	throttle := make(chan int, MaxConcurrentAgencyLookups)

	for _, agencyResult := range agencyResults {
		agencyWg.Add(1)
		throttle <- 1

		go func(agencyResult *AgencyResult) {
			defer agencyWg.Done()
			defer func() { <-throttle }()

			name := agencyResult.Name

			wordCount, err := s.TitleDAO.CountAgencyWords(ctx, name, agencyResult.Titles)
			if err != nil {
				messages <- fmt.Sprintf(
					"failed to count words for agency, %v, %v",
					name,
					err,
				)
				return
			}

			mu.Lock()
			totalWordCount += wordCount
			mu.Unlock()

			sectionCount, err := s.TitleDAO.CountAgencySections(ctx, name, agencyResult.Titles)
			if err != nil {
				messages <- fmt.Sprintf(
					"failed to count sections for agency, %v, %v",
					name,
					err,
				)
				return
			}

			mu.Lock()
			totalSectionCount += sectionCount
			mu.Unlock()
		}(agencyResult)
	}

	agencyWg.Wait()

	close(messages)
	messagesWG.Wait()

	return &data.AgencyMetricResponse{
		WordCount:    totalWordCount,
		SectionCount: totalSectionCount,
	}, nil
}

func (s *AgencyMetricService) buildAgencyResult(agency *data.Agency) *AgencyResult {
	var titles []int
	for _, ref := range agency.AgencyReferences {
		titles = append(titles, ref.Title)
	}
	return &AgencyResult{
		Name:   agency.Name,
		Titles: titles,
	}
}
