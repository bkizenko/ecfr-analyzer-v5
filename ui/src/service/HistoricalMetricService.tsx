import { ResponseContainer, errorResponse } from "ecfr-analyzer/data/ResponseContainer";

const apiRoot = process.env.NEXT_PUBLIC_ECFR_SERVICE_API_URL;
const defaultRevalidate = 60 * 60; // seconds

// Types for historical metrics data
export interface HistoricalTitleMetric {
  year: number;
  wordCount: number;
  sectionCount: number;
}

export interface HistoricalAgencyMetric {
  year: number;
  agencies: { [key: string]: number }; // Agency name to word count map
}

export interface HistoricalMetricsData {
  titleMetrics: HistoricalTitleMetric[];
  agencyMetrics: HistoricalAgencyMetric[];
}

export interface AgencyHistoricalData {
  agency: {
    name: string;
    displayName: string;
    slug: string;
  };
  metrics: {
    wordCount: number;
    sectionCount: number;
    snapshotDate: string;
  }[];
}

// Fetch historical metrics data
export async function fetchHistoricalMetrics(): Promise<
  ResponseContainer<HistoricalMetricsData>
> {
  try {
    const res = await fetch(`${apiRoot}/metrics/historical`, {
      next: { revalidate: defaultRevalidate },
    });

    if (!res.ok) {
      return errorResponse({
        code: res.status,
        message: "An error occurred fetching historical metrics",
      });
    }

    const response = await res.json();
    return response;
  } catch (error) {
    return errorResponse({
      code: 500,
      message: `Failed to fetch historical metrics: ${error}`,
    });
  }
}

// Fetch historical metrics for a specific agency
export async function fetchAgencyHistoricalMetrics(
  slug: string
): Promise<ResponseContainer<AgencyHistoricalData>> {
  try {
    const res = await fetch(`${apiRoot}/metrics/historical/agencies/${slug}`, {
      next: { revalidate: defaultRevalidate },
    });

    if (!res.ok) {
      return errorResponse({
        code: res.status,
        message: `An error occurred fetching historical metrics for agency ${slug}`,
      });
    }

    const response = await res.json();
    return response;
  } catch (error) {
    return errorResponse({
      code: 500,
      message: `Failed to fetch historical metrics for agency ${slug}: ${error}`,
    });
  }
} 