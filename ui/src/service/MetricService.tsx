import {
  errorResponse,
  ResponseContainer,
} from "ecfr-analyzer/data/ResponseContainer";
import { TitleMetricResponse } from "ecfr-analyzer/data/TitleMetricResponse";
import { AgencyMetrics } from "ecfr-analyzer/data/AgencyMetrics";
import { staticTitleMetrics, staticAgencyMetrics } from "ecfr-analyzer/data/staticAgencyData";
// Import the complete agency metrics JSON data
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

// Ensure we have an API URL
const apiRoot = process.env.NEXT_PUBLIC_ECFR_SERVICE_API_URL || 'http://localhost:8090/ecfr-service';
const defaultRevalidate = 60 * 60; // seconds

// Flag to determine if we should use static data instead of API
const useStaticData = false; // Set to true to always use static data

// Flag to force using JSON data for charts/visualizations regardless of API status
const useHardcodedDataForCharts = true;

// Log API URL at startup
if (typeof window !== 'undefined') {
  console.log(`Using API URL: ${apiRoot}`);
  if (useStaticData) {
    console.log('Using static data instead of API calls');
  }
  if (useHardcodedDataForCharts) {
    console.log('Using hardcoded data for chart visualizations');
  }
}

// Helper function to convert agency-metrics.json data to AgencyMetrics[]
function convertJsonToAgencyMetrics(): AgencyMetrics[] {
  try {
    return agencyMetricsJson.agencies.map(agency => ({
      agency: {
        name: agency.name,
        slug: agency.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        id: agency.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 10)
      },
      wordCount: agency.wordCount,
      sectionCount: agency.sectionCount,
      subAgencyCount: agency.innerAgencies ? agency.innerAgencies.length : 0
    }));
  } catch (error) {
    console.error("Error converting JSON agency metrics:", error);
    return staticAgencyMetrics;
  }
}

// NEW FUNCTION: Get chart data directly from JSON file (for visualizations)
export function getChartData(): {
  agencyMetrics: AgencyMetrics[];
  titleMetrics: TitleMetricResponse;
} {
  console.log("Using hardcoded data from agency-metrics.json for visualization");
  return {
    agencyMetrics: convertJsonToAgencyMetrics(),
    titleMetrics: {
      wordCount: agencyMetricsJson.metadata.totalWords,
      sectionCount: agencyMetricsJson.metadata.totalSections
    }
  };
}

// NEW FUNCTION: Get sub-agency chart data for a specific agency 
export function getSubAgencyChartData(slug: string): AgencyMetrics[] {
  try {
    const agency = agencyMetricsJson.agencies.find(a => 
      a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug ||
      a.name.toLowerCase().includes(slug.replace(/-/g, " "))
    );
    
    if (agency && agency.innerAgencies && agency.innerAgencies.length > 0) {
      console.log(`Using ${agency.innerAgencies.length} inner agencies from JSON data for visualization`);
      return agency.innerAgencies.map(inner => ({
        agency: {
          name: inner.name,
          slug: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          id: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 10)
        },
        wordCount: inner.wordCount,
        sectionCount: inner.sectionCount,
        subAgencyCount: 0
      }));
    }
    return [];
  } catch (error) {
    console.error("Error getting sub-agency data from JSON:", error);
    return [];
  }
}

export async function fetchTitleMetrics(): Promise<
  ResponseContainer<TitleMetricResponse>
> {
  // Use static data if flag is set
  if (useStaticData) {
    console.log("Using static title metrics data");
    return {
      data: staticTitleMetrics as TitleMetricResponse,
      err: null
    };
  }

  try {
    const url = `${apiRoot}/metrics/titles`;
    console.log(`Fetching title metrics from: ${url}`);
    
    const res = await fetch(url, {
      next: { revalidate: defaultRevalidate },
    });

    if (!res.ok) {
      console.error(`Title metrics error: ${res.status} ${res.statusText}`);
      console.log("Falling back to static title metrics data");
      return {
        data: {
          wordCount: agencyMetricsJson.metadata.totalWords,
          sectionCount: agencyMetricsJson.metadata.totalSections
        } as TitleMetricResponse, 
        err: null
      };
    }

    const data = await res.json();
    console.log("Title metrics received from API");
    return data;
  } catch (error) {
    console.error("Error fetching title metrics:", error);
    console.log("Falling back to static title metrics data");
    return {
      data: {
        wordCount: agencyMetricsJson.metadata.totalWords,
        sectionCount: agencyMetricsJson.metadata.totalSections
      } as TitleMetricResponse,
      err: null
    };
  }
}

export async function fetchAgencyMetrics(): Promise<
  ResponseContainer<AgencyMetrics[]>
> {
  // Use static data if flag is set
  if (useStaticData) {
    console.log("Using comprehensive agency metrics data from JSON file");
    return {
      data: convertJsonToAgencyMetrics(),
      err: null
    };
  }

  try {
    const url = `${apiRoot}/metrics/agencies`;
    console.log(`Fetching agency metrics from: ${url}`);
    
    const res = await fetch(url, {
      next: { revalidate: defaultRevalidate },
    });

    if (!res.ok) {
      console.error(`Agency metrics error: ${res.status} ${res.statusText}`);
      console.log("Falling back to comprehensive agency metrics data from JSON file");
      return {
        data: convertJsonToAgencyMetrics(),
        err: null
      };
    }

    const data = await res.json();
    if (data?.data?.length > 0) {
      console.log(`Agency metrics received from API: ${data.data.length} agencies`);
      return data;
    } else {
      console.log("No agency data in API response, using comprehensive data from JSON file");
      return {
        data: convertJsonToAgencyMetrics(),
        err: null
      };
    }
  } catch (error) {
    console.error("Error fetching agency metrics:", error);
    console.log("Falling back to comprehensive agency metrics data from JSON file");
    return {
      data: convertJsonToAgencyMetrics(),
      err: null
    };
  }
}

export async function fetchMetricsForAgency(
  slug: string,
): Promise<ResponseContainer<AgencyMetrics>> {
  // Use static data if flag is set
  if (useStaticData) {
    console.log(`Using metrics for agency from JSON file: ${slug}`);
    // Try to find agency in comprehensive JSON data first
    const jsonAgencies = convertJsonToAgencyMetrics();
    const jsonAgency = jsonAgencies.find(a => 
      a.agency.slug === slug || 
      a.agency.name.toLowerCase().includes(slug.replace(/-/g, " "))
    );
    
    if (jsonAgency) {
      return {
        data: jsonAgency,
        err: null
      };
    }
    
    // Fall back to simpler static data
    const agency = staticAgencyMetrics.find(a => a.agency.slug === slug);
    if (agency) {
      return {
        data: agency as AgencyMetrics,
        err: null
      };
    }
  }

  try {
    const url = `${apiRoot}/metrics/agencies/${slug}`;
    console.log(`Fetching metrics for agency ${slug} from: ${url}`);
    
    const res = await fetch(url, {
      next: { revalidate: defaultRevalidate },
    });

    if (!res.ok) {
      console.error(`Agency ${slug} metrics error: ${res.status} ${res.statusText}`);
      
      // Try to find agency in comprehensive JSON data first
      const jsonAgencies = convertJsonToAgencyMetrics();
      const jsonAgency = jsonAgencies.find(a => 
        a.agency.slug === slug || 
        a.agency.name.toLowerCase().includes(slug.replace(/-/g, " "))
      );
      
      if (jsonAgency) {
        console.log(`Found agency in JSON data: ${jsonAgency.agency.name}`);
        return {
          data: jsonAgency,
          err: null
        };
      }
      
      // Fall back to simpler static data
      const agency = staticAgencyMetrics.find(a => a.agency.slug === slug);
      if (agency) {
        console.log(`Falling back to static data for agency: ${slug}`);
        return {
          data: agency as AgencyMetrics,
          err: null
        };
      }
      
      return errorResponse({
        code: res.status,
        message: `An error occurred fetching metrics for agency: ${res.status} ${res.statusText}`,
      });
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching metrics for agency ${slug}:`, error);
    
    // Try to find agency in comprehensive JSON data first
    const jsonAgencies = convertJsonToAgencyMetrics();
    const jsonAgency = jsonAgencies.find(a => 
      a.agency.slug === slug || 
      a.agency.name.toLowerCase().includes(slug.replace(/-/g, " "))
    );
    
    if (jsonAgency) {
      console.log(`Found agency in JSON data: ${jsonAgency.agency.name}`);
      return {
        data: jsonAgency,
        err: null
      };
    }
    
    // Fall back to simpler static data
    const agency = staticAgencyMetrics.find(a => a.agency.slug === slug);
    if (agency) {
      console.log(`Falling back to static data for agency: ${slug}`);
      return {
        data: agency as AgencyMetrics,
        err: null
      };
    }
    
    return errorResponse({
      code: 500,
      message: `Failed to fetch metrics for agency: ${error}`,
    });
  }
}

export async function fetchSubAgencyMetrics(
  slug: string,
): Promise<ResponseContainer<AgencyMetrics[]>> {
  // Try to find inner agencies in the comprehensive JSON data
  try {
    const agency = agencyMetricsJson.agencies.find(a => 
      a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug ||
      a.name.toLowerCase().includes(slug.replace(/-/g, " "))
    );
    
    if (agency && agency.innerAgencies && agency.innerAgencies.length > 0) {
      console.log(`Found ${agency.innerAgencies.length} inner agencies for ${agency.name} in JSON data`);
      const innerAgencies = agency.innerAgencies.map(inner => ({
        agency: {
          name: inner.name,
          slug: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          id: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 10)
        },
        wordCount: inner.wordCount,
        sectionCount: inner.sectionCount,
        subAgencyCount: 0
      }));
      
      return {
        data: innerAgencies as AgencyMetrics[],
        err: null
      };
    }
  } catch (error) {
    console.error("Error finding inner agencies in JSON data:", error);
  }

  // If not using static data, continue with API call
  if (useStaticData) {
    console.log(`No sub-agency metrics found for: ${slug}`);
    return {
      data: [],
      err: null
    };
  }

  try {
    const url = `${apiRoot}/metrics/agencies/${slug}/sub-agencies`;
    console.log(`Fetching sub-agency metrics for ${slug} from: ${url}`);
    
    const res = await fetch(url, {
      next: { revalidate: defaultRevalidate },
    });

    if (!res.ok) {
      console.error(`Sub-agency metrics error for ${slug}: ${res.status} ${res.statusText}`);
      // Try to find inner agencies in the JSON data again as a fallback
      try {
        const agency = agencyMetricsJson.agencies.find(a => 
          a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug ||
          a.name.toLowerCase().includes(slug.replace(/-/g, " "))
        );
        
        if (agency && agency.innerAgencies && agency.innerAgencies.length > 0) {
          console.log(`Using ${agency.innerAgencies.length} inner agencies from JSON data as fallback`);
          const innerAgencies = agency.innerAgencies.map(inner => ({
            agency: {
              name: inner.name,
              slug: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              id: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 10)
            },
            wordCount: inner.wordCount,
            sectionCount: inner.sectionCount,
            subAgencyCount: 0
          }));
          
          return {
            data: innerAgencies as AgencyMetrics[],
            err: null
          };
        }
      } catch (error) {
        console.error("Error finding inner agencies in JSON data:", error);
      }
      
      return {
        data: [],
        err: null
      };
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching sub-agency metrics for ${slug}:`, error);
    
    // One more try to find inner agencies in the JSON data as a fallback
    try {
      const agency = agencyMetricsJson.agencies.find(a => 
        a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug ||
        a.name.toLowerCase().includes(slug.replace(/-/g, " "))
      );
      
      if (agency && agency.innerAgencies && agency.innerAgencies.length > 0) {
        console.log(`Using ${agency.innerAgencies.length} inner agencies from JSON data after API error`);
        const innerAgencies = agency.innerAgencies.map(inner => ({
          agency: {
            name: inner.name,
            slug: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            id: inner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 10)
          },
          wordCount: inner.wordCount,
          sectionCount: inner.sectionCount,
          subAgencyCount: 0
        }));
        
        return {
          data: innerAgencies as AgencyMetrics[],
          err: null
        };
      }
    } catch (error) {
      console.error("Error finding inner agencies in JSON data:", error);
    }
    
    return {
      data: [],
      err: null
    };
  }
}
