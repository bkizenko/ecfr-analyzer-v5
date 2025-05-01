package httpclient

import (
	"context"
	"net/http"
)

type ECFRAPIClient struct {
	APIRoot    string
	HttpClient *Client
}

func (s *ECFRAPIClient) Get(
	ctx context.Context,
	path string,
) (*http.Response, error) {
	return s.HttpClient.GetJSON(ctx, s.APIRoot+path)
}
