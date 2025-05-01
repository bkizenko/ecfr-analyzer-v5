package service

import (
	"context"
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/data"
	"sync"
)

var MaxConcurrentTitleLookups = 10

type TitleMetricService struct {
	TitleDAO *dao.TitleDAO
}

func (s *TitleMetricService) CountAllWordsAndSections(
	ctx context.Context,
) (*data.TitleMetricResponse, error) {
	titles, err := s.TitleDAO.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to find titles, %w", err)
	}

	var messagesWG sync.WaitGroup

	messages := make(chan string)
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for message := range messages {
			log.Info(fmt.Sprintf("Title Metrics Process: %v", message))
		}
	}()

	var titleWg sync.WaitGroup
	var mu sync.Mutex
	var totalWordCount int
	var totalSectionCount int

	throttle := make(chan int, MaxConcurrentTitleLookups)

	for _, title := range titles {
		titleWg.Add(1)
		throttle <- 1

		go func(title *data.Title) {
			defer titleWg.Done()
			defer func() { <-throttle }()

			name := title.Name

			wordCount, err := s.TitleDAO.CountAllWords(ctx, name)
			if err != nil {
				messages <- fmt.Sprintf(
					"failed to count words for title, %v, %v",
					name,
					err,
				)
				return
			}

			mu.Lock()
			totalWordCount += wordCount
			mu.Unlock()

			sectionCount, err := s.TitleDAO.CountAllSections(ctx, name)
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
		}(title)
	}

	titleWg.Wait()

	close(messages)
	messagesWG.Wait()

	return &data.TitleMetricResponse{
		WordCount:    totalWordCount,
		SectionCount: totalSectionCount,
	}, nil
}
