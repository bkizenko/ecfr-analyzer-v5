package data

type AgencyMetricResponse struct {
	WordCount    int `json:"wordCount"`
	SectionCount int `json:"sectionCount"`
}

func DefaultAgencyMetrics() AgencyMetricResponse {
	return AgencyMetricResponse{
		WordCount:    0,
		SectionCount: 0,
	}
}
