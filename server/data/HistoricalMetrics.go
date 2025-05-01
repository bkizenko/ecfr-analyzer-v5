package data

import (
	"time"
)

// MetricsSnapshot represents a point-in-time snapshot of metrics
type MetricsSnapshot struct {
	Id               int       `json:"-"`
	SnapshotId       string    `json:"snapshotId"`
	SnapshotDate     time.Time `json:"snapshotDate"`
	Description      string    `json:"description"`
	CreatedTimestamp time.Time `json:"createdTimestamp"`
}

// HistoricalAgencyMetricResponse builds on AgencyMetricResponse with timestamp info
type HistoricalAgencyMetricResponse struct {
	AgencyMetricResponse
	SnapshotDate time.Time `json:"snapshotDate"`
}

// HistoricalTitleMetricResponse builds on TitleMetricResponse with timestamp info
type HistoricalTitleMetricResponse struct {
	TitleMetricResponse
	SnapshotDate time.Time `json:"snapshotDate"`
}

// AgencyHistoricalMetrics holds all historical data for an agency
type AgencyHistoricalMetrics struct {
	Agency  *Agency                           `json:"agency"`
	Metrics []*HistoricalAgencyMetricResponse `json:"metrics"`
}

// TitleHistoricalMetrics holds all historical title data
type TitleHistoricalMetrics struct {
	Metrics []*HistoricalTitleMetricResponse `json:"metrics"`
}

// YearlyAgencyMetrics represents metrics for a specific year for all agencies
type YearlyAgencyMetrics struct {
	Year     int            `json:"year"`
	Agencies map[string]int `json:"agencies"` // Map of agency name to word count
}

// HistoricalMetricsResponse is the top-level response for historical data
type HistoricalMetricsResponse struct {
	TitleMetrics  []YearlyTitleMetrics  `json:"titleMetrics"`  // Total metrics per year
	AgencyMetrics []YearlyAgencyMetrics `json:"agencyMetrics"` // Agency metrics per year
}

// YearlyTitleMetrics represents total metrics for a specific year
type YearlyTitleMetrics struct {
	Year         int `json:"year"`
	WordCount    int `json:"wordCount"`
	SectionCount int `json:"sectionCount"`
}

func CreateHistoricalKey(baseKey string, date time.Time) string {
	return CreateComputedValueKey(baseKey, date.Format("2006_01_02"))
}

func ComputedValueKeyHistoricalGlobalTitleMetrics(date time.Time) string {
	return CreateHistoricalKey("global-title-metrics", date)
}

func ComputedValueKeyHistoricalAgencyMetric(agencyId string, date time.Time) string {
	return CreateHistoricalKey(ComputedValueKeyAgencyMetric(agencyId), date)
}
