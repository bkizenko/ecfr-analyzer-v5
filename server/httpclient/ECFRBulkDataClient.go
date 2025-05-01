package httpclient

import (
	"context"
	"net/http"
)

type ECFRBulkDataClient struct {
	APIRoot    string
	HttpClient *Client
}

func (s *ECFRBulkDataClient) GetAllFiles(
	ctx context.Context,
) (*http.Response, error) {
	return s.HttpClient.GetJSON(ctx, s.APIRoot)
}

func (s *ECFRBulkDataClient) GetJSON(
	ctx context.Context,
	url string,
) (*http.Response, error) {
	return s.HttpClient.GetJSON(ctx, url)
}

func (s *ECFRBulkDataClient) GetXML(
	ctx context.Context,
	url string,
) (*http.Response, error) {
	return s.HttpClient.GetXML(ctx, url)
}
