package data

import (
	"encoding/json"
	"strings"
	"unicode"
)

type ComputedValue struct {
	InternalId int             `json:"-"`
	Id         string          `json:"valueId"`
	Key        string          `json:"key"`
	Data       json.RawMessage `json:"data"`
}

var delimiter = "__"

func CreateComputedValueKey(parts ...string) string {
	return strings.Join(parts, delimiter)
}

func ParseComputedValueKey(key string) []string {
	return strings.Split(key, delimiter)
}

func sanitize(s string) string {
	var result []rune
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			result = append(result, r)
		} else if unicode.IsSpace(r) {
			result = append(result, '-')
		}
	}
	return string(result)
}

func ComputedValueKeyGlobalTitleMetrics() string {
	return "global-title-metrics"
}

var ComputedValueKeyAgencyMetricPrefix = "agency-metrics"

func ComputedValueKeyAgencyMetric(agencyId string) string {
	return CreateComputedValueKey(ComputedValueKeyAgencyMetricPrefix, agencyId)
}

var ComputedValueKeySubAgencyMetricPrefix = "sub-agency-metrics"

func ComputedValueKeySubAgencyMetric(parentId string, agencyName string) string {
	agencyId := strings.ToLower(agencyName)
	return CreateComputedValueKey(
		ComputedValueKeySubAgencyMetricPrefix,
		parentId,
		sanitize(agencyId),
	)
}
