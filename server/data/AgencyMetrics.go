package data

type AgencyMetrics struct {
	Agency  *Agency               `json:"agency"`
	Metrics *AgencyMetricResponse `json:"metrics"`
}
