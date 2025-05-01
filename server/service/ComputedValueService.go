package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/data"
	"strings"
	"sync"
)

var MaxConcurrentAgencyMetricProcesses = 3

type ComputedValueService struct {
	TitleMetricService  *TitleMetricService
	AgencyMetricService *AgencyMetricService
	ComputedValueDAO    *dao.ComputedValueDAO
	AgencyDAO           *dao.AgencyDAO
}

func (s *ComputedValueService) ProcessTitleMetrics(
	ctx context.Context,
) error {
	result, err := s.TitleMetricService.CountAllWordsAndSections(ctx)
	if err != nil {
		return fmt.Errorf("failed to count title metrics, %w", err)
	}

	rBytes, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal title metrics, %w", err)
	}

	cv := &data.ComputedValue{
		Key:  data.ComputedValueKeyGlobalTitleMetrics(),
		Data: rBytes,
	}

	err = s.ComputedValueDAO.Insert(ctx, cv)
	if err != nil {
		return fmt.Errorf("failed to insert computed value, %w", err)
	}

	return nil
}

func (s *ComputedValueService) ProcessAgencyMetrics(
	ctx context.Context,
	onlySubAgencies bool,
	agenciesFilter []string,
) error {
	agencies, err := s.AgencyDAO.FindAll(ctx)
	if err != nil {
		return fmt.Errorf("failed to find agencies, %w", err)
	}

	filterMap := make(map[string]bool, len(agenciesFilter))
	for _, agency := range agenciesFilter {
		filterMap[agency] = true
	}

	if len(agenciesFilter) > 0 {
		var filteredAgencies []*data.Agency
		for _, agency := range agencies {
			if filterMap[agency.Slug] {
				filteredAgencies = append(filteredAgencies, agency)
			}
		}
		agencies = filteredAgencies
	}

	if onlySubAgencies {
		var subAgencies []*data.Agency
		for _, agency := range agencies {
			for _, child := range agency.Children {
				child.Parent = agency
				subAgencies = append(subAgencies, child)
			}
		}
		agencies = subAgencies
	}

	var messagesWG sync.WaitGroup

	messages := make(chan string)
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for message := range messages {
			s.logInfo(message)
		}
	}()

	successes := make(chan string)
	var successAgencies []string
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for it := range successes {
			successAgencies = append(successAgencies, it)
		}
	}()

	failures := make(chan string)
	var failedAgencies []string
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for it := range failures {
			failedAgencies = append(failedAgencies, it)
		}
	}()

	var agencyWg sync.WaitGroup

	throttle := make(chan int, MaxConcurrentAgencyMetricProcesses)

	for _, agency := range agencies {
		agencyWg.Add(1)
		throttle <- 1
		go func(agency *data.Agency) {
			defer agencyWg.Done()
			defer func() { <-throttle }()

			var slug string
			var subAgencyFilter string
			if onlySubAgencies {
				slug = agency.Parent.Slug
				subAgencyFilter = agency.Name
			} else {
				slug = agency.Slug
				subAgencyFilter = ""
			}

			messages <- fmt.Sprintf("Processing: %v", slug)

			result, err := s.AgencyMetricService.CountWordsAndSections(ctx, slug, subAgencyFilter)
			if err != nil {
				messages <- fmt.Sprintf("failed to count agency metrics, %v, %v", slug, err)
				failures <- slug
				return
			}

			rBytes, err := json.Marshal(result)
			if err != nil {
				messages <- fmt.Sprintf("failed to marshall agency metrics, %v, %v", slug, err)
				failures <- slug
				return
			}

			var key string
			if onlySubAgencies {
				key = data.ComputedValueKeySubAgencyMetric(agency.Parent.Id, agency.Name)
			} else {
				key = data.ComputedValueKeyAgencyMetric(agency.Id)
			}

			cv := &data.ComputedValue{
				Key:  key,
				Data: rBytes,
			}

			err = s.ComputedValueDAO.Insert(ctx, cv)
			if err != nil {
				messages <- fmt.Sprintf("failed to insert agency metrics, %v, %v", slug, err)
				failures <- slug
				return
			}

			messages <- fmt.Sprintf("Success: %v", slug)
			successes <- slug
		}(agency)
	}

	agencyWg.Wait()

	close(messages)
	close(successes)
	close(failures)

	messagesWG.Wait()
	s.logInfo(fmt.Sprintf("Successfully imported: %v", strings.Join(successAgencies, ", ")))
	s.logInfo(fmt.Sprintf("Failed to import: %v", strings.Join(failedAgencies, ", ")))
	s.logInfo("Complete")

	return nil
}

func (s *ComputedValueService) logInfo(message string) {
	log.Info(fmt.Sprintf("Computed Value Process: %v", message))
}
