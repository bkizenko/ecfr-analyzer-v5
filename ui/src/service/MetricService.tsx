import {
  errorResponse,
  ResponseContainer,
} from "ecfr-analyzer/data/ResponseContainer";
import { TitleMetricResponse } from "ecfr-analyzer/data/TitleMetricResponse";
import { AgencyMetrics } from "ecfr-analyzer/data/AgencyMetrics";

const apiRoot = process.env.NEXT_PUBLIC_ECFR_SERVICE_API_URL;
const defaultRevalidate = 60 * 60; // seconds

export async function fetchTitleMetrics(): Promise<
  ResponseContainer<TitleMetricResponse>
> {
  const res = await fetch(`${apiRoot}/metrics/titles`, {
    next: { revalidate: defaultRevalidate },
  });

  if (!res.ok) {
    return errorResponse({
      code: res.status,
      message: "An error occurred fetching title metrics",
    });
  }

  return await res.json();
}

export async function fetchAgencyMetrics(): Promise<
  ResponseContainer<AgencyMetrics[]>
> {
  const res = await fetch(`${apiRoot}/metrics/agencies`, {
    next: { revalidate: defaultRevalidate },
  });

  if (!res.ok) {
    return errorResponse({
      code: res.status,
      message: "An error occurred fetching agencies metrics",
    });
  }

  return await res.json();
}

export async function fetchMetricsForAgency(
  slug: string,
): Promise<ResponseContainer<AgencyMetrics>> {
  const res = await fetch(`${apiRoot}/metrics/agencies/${slug}`, {
    next: { revalidate: defaultRevalidate },
  });

  if (!res.ok) {
    return errorResponse({
      code: res.status,
      message: "An error occurred fetching metrics for agency",
    });
  }

  return await res.json();
}

export async function fetchSubAgencyMetrics(
  slug: string,
): Promise<ResponseContainer<AgencyMetrics[]>> {
  const res = await fetch(`${apiRoot}/metrics/agencies/${slug}/sub-agencies`, {
    next: { revalidate: defaultRevalidate },
  });

  if (!res.ok) {
    return errorResponse({
      code: res.status,
      message: "An error occurred fetching subagency metrics for agency",
    });
  }

  return await res.json();
}
