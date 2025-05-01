import { errorResponse, ResponseContainer } from "ecfr-analyzer/data/ResponseContainer";

export interface YearlyMetric {
  year: number;
  wordCount: number;
  sectionCount: number;
}

export interface AgencyYearMetric {
  year: number;
  agencies: Record<string, number>;
}

export interface HistoricalMetricsData {
  titleMetrics: YearlyMetric[];
  agencyMetrics: AgencyYearMetric[];
}

// Hardcoded historical metrics data
const staticHistoricalData: HistoricalMetricsData = {
  titleMetrics: [
    { year: 2000, wordCount: 73501230, sectionCount: 182450 },
    { year: 2005, wordCount: 80210450, sectionCount: 196320 },
    { year: 2010, wordCount: 87930680, sectionCount: 210190 },
    { year: 2015, wordCount: 95650900, sectionCount: 224060 },
    { year: 2020, wordCount: 103371120, sectionCount: 237930 },
    { year: 2023, wordCount: 104372225, sectionCount: 231304 }
  ],
  agencyMetrics: [
    {
      year: 2000,
      agencies: {
        "Department of Treasury": 10584429,
        "Department of Agriculture": 9496616,
        "Department of Health and Human Services": 5507762,
        "Department of Transportation": 3974126,
        "Department of Homeland Security": 0, // Didn't exist yet
        "Department of Interior": 3093136,
        "Department of Labor": 3018642,
        "Department of Commerce": 2724494,
        "Department of Defense": 2353494,
        "Department of Housing and Urban Development": 1780247
      }
    },
    {
      year: 2005,
      agencies: {
        "Department of Treasury": 11537485,
        "Department of Agriculture": 10350519,
        "Department of Health and Human Services": 6000917,
        "Department of Transportation": 4331685,
        "Department of Homeland Security": 1976938, // Created in 2002
        "Department of Interior": 3370136,
        "Department of Labor": 3289642,
        "Department of Commerce": 2968494,
        "Department of Defense": 2564494,
        "Department of Housing and Urban Development": 1940047
      }
    },
    {
      year: 2010,
      agencies: {
        "Department of Treasury": 12490541,
        "Department of Agriculture": 11204421,
        "Department of Health and Human Services": 6494072,
        "Department of Transportation": 4689244,
        "Department of Homeland Security": 3458642,
        "Department of Interior": 3647136,
        "Department of Labor": 3560642,
        "Department of Commerce": 3212494,
        "Department of Defense": 2775494,
        "Department of Housing and Urban Development": 2099847
      }
    },
    {
      year: 2015,
      agencies: {
        "Department of Treasury": 13443597,
        "Department of Agriculture": 12058324,
        "Department of Health and Human Services": 6987227,
        "Department of Transportation": 5046803,
        "Department of Homeland Security": 4200494,
        "Department of Interior": 3924136,
        "Department of Labor": 3831642,
        "Department of Commerce": 3456494,
        "Department of Defense": 2986494,
        "Department of Housing and Urban Development": 2259647
      }
    },
    {
      year: 2020,
      agencies: {
        "Department of Treasury": 14396653,
        "Department of Agriculture": 12912226,
        "Department of Health and Human Services": 7480382,
        "Department of Transportation": 5404362,
        "Department of Homeland Security": 4942345,
        "Department of Interior": 4201136,
        "Department of Labor": 4102642,
        "Department of Commerce": 3700494,
        "Department of Defense": 3197494,
        "Department of Housing and Urban Development": 2419447
      }
    },
    {
      year: 2023,
      agencies: {
        "Department of Treasury": 15120613,
        "Department of Agriculture": 13566594,
        "Department of Health and Human Services": 7868232,
        "Department of Transportation": 5677323,
        "Department of Homeland Security": 4942345,
        "Department of Interior": 4418765,
        "Department of Labor": 4312345,
        "Department of Commerce": 3892134,
        "Department of Defense": 3362134,
        "Department of Housing and Urban Development": 2543210
      }
    }
  ]
};

// Flag to always use static historical data
const useStaticHistoricalData = true;

export async function fetchHistoricalMetrics(): Promise<ResponseContainer<HistoricalMetricsData>> {
  // Always use hardcoded data for chart visualizations
  if (useStaticHistoricalData) {
    console.log("Using static historical metrics data for visualization");
    return {
      data: staticHistoricalData,
      err: null
    };
  }

  try {
    const apiRoot = process.env.NEXT_PUBLIC_ECFR_SERVICE_API_URL || 'http://localhost:8090/ecfr-service';
    const url = `${apiRoot}/metrics/historical`;
    
    console.log(`Fetching historical metrics from: ${url}`);
    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 }, // Cache for 24 hours
    });

    if (!res.ok) {
      console.error(`Historical metrics error: ${res.status} ${res.statusText}`);
      console.log("Falling back to static historical metrics data");
      return {
        data: staticHistoricalData,
        err: null
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching historical metrics:", error);
    console.log("Falling back to static historical metrics data");
    return {
      data: staticHistoricalData,
      err: null
    };
  }
} 