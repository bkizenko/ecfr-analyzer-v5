package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"github.com/sam-berry/ecfr-analyzer/server/dao"
	"github.com/sam-berry/ecfr-analyzer/server/ecfrdata"
	"github.com/sam-berry/ecfr-analyzer/server/httpclient"
	"io"
	"strconv"
	"strings"
	"sync"
)

type TitleImportService struct {
	HttpClient     *httpclient.ECFRBulkDataClient
	TitleImportDAO *dao.TitleImportDAO
}

func (s *TitleImportService) ImportTitles(ctx context.Context, titlesFilter []string) error {
	s.logInfo("Start")

	allFiles, err := s.getAllFiles(ctx, titlesFilter)
	if err != nil {
		return fmt.Errorf("failed to get all files, %w", err)
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

	successes := make(chan int)
	var successTitles []string
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for it := range successes {
			successTitles = append(successTitles, strconv.Itoa(it))
		}
	}()

	failures := make(chan int)
	var failedTitles []string
	messagesWG.Add(1)
	go func() {
		defer messagesWG.Done()
		for it := range failures {
			failedTitles = append(failedTitles, strconv.Itoa(it))
		}
	}()

	var filesWg sync.WaitGroup

	for _, file := range allFiles {
		filesWg.Add(1)
		go s.processTitleFile(
			ctx,
			file,
			&filesWg,
			messages,
			successes,
			failures,
		)
	}

	filesWg.Wait()

	close(messages)
	close(successes)
	close(failures)

	messagesWG.Wait()

	s.logInfo(fmt.Sprintf("Successfully imported titles: %v", strings.Join(successTitles, ", ")))
	s.logInfo(fmt.Sprintf("Failed to import titles: %v", strings.Join(failedTitles, ", ")))
	s.logInfo("Complete")

	return nil
}

func (s *TitleImportService) processTitleFile(
	ctx context.Context,
	file ecfrdata.AllFilesItem,
	wg *sync.WaitGroup,
	messages chan<- string,
	successes chan<- int,
	failures chan<- int,
) {
	defer wg.Done()

	titleNumber := file.CFRTitle

	messages <- fmt.Sprintf("Fetching: %v", titleNumber)

	titleFile, err := s.getTitleFile(ctx, file.Link)
	if err != nil {
		messages <- fmt.Sprintf("failed to get title file, %v, %v", titleNumber, err)
		failures <- titleNumber
		return
	}

	messages <- fmt.Sprintf("Downloading: %v", titleNumber)

	err = s.downloadTitleFile(ctx, titleNumber, titleFile.Link)
	if err != nil {
		messages <- fmt.Sprintf("failed to download title file, %v, %v", titleNumber, err)
		failures <- titleNumber
		return
	}

	messages <- fmt.Sprintf("Success: %v", titleNumber)
	successes <- titleNumber
}

func (s *TitleImportService) getAllFiles(
	ctx context.Context,
	titlesFilter []string,
) ([]ecfrdata.AllFilesItem, error) {
	allFiles, err := s.HttpClient.GetAllFiles(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch all files, %w", err)
	}

	defer allFiles.Body.Close()
	var allFilesResp ecfrdata.AllFilesResponse
	decoder := json.NewDecoder(allFiles.Body)
	if err := decoder.Decode(&allFilesResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal all files response, %w", err)
	}

	filterMap := make(map[string]bool, len(titlesFilter))
	for _, title := range titlesFilter {
		filterMap[title] = true
	}
	hasFilter := len(titlesFilter) > 0

	var finalFiles []ecfrdata.AllFilesItem
	for _, file := range allFilesResp.Files {
		if file.CFRTitle > 0 && (!hasFilter || filterMap[fmt.Sprintf("%d", file.CFRTitle)]) {
			finalFiles = append(finalFiles, file)
		}
	}

	return finalFiles, nil
}

func (s *TitleImportService) getTitleFile(ctx context.Context, url string) (
	*ecfrdata.TitleFileItem,
	error,
) {
	titleFiles, err := s.HttpClient.GetJSON(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch files for title, %v, %w", url, err)
	}

	defer titleFiles.Body.Close()
	var titleFilesResp ecfrdata.TitleFilesResponse
	decoder := json.NewDecoder(titleFiles.Body)
	if err := decoder.Decode(&titleFilesResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal title files response, %w", err)
	}

	var titleXML *ecfrdata.TitleFileItem
	for _, titleFile := range titleFilesResp.Files {
		if titleFile.FileExtension == "xml" {
			titleXML = &titleFile
			break
		}
	}

	return titleXML, nil
}

func (s *TitleImportService) downloadTitleFile(
	ctx context.Context,
	name int,
	url string,
) error {
	resp, err := s.HttpClient.GetXML(ctx, url)
	if err != nil {
		return fmt.Errorf("failed to fetch title XML, %v, %w", url, err)
	}

	defer resp.Body.Close()
	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read title content, %w", err)
	}

	err = s.TitleImportDAO.Insert(ctx, name, content)
	if err != nil {
		return fmt.Errorf("failed to insert title, %w", err)
	}

	return nil
}

func (s *TitleImportService) logInfo(message string) {
	log.Info(fmt.Sprintf("Title Import Process: %v", message))
}
