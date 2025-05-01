import { Agency } from "ecfr-analyzer/data/Agency";
import { AgencyMetricResponse } from "ecfr-analyzer/data/AgencyMetricResponse";

export interface AgencyMetrics {
  agency: Agency;
  metrics: AgencyMetricResponse;
}
