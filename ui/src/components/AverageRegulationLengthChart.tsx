"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon, Skeleton } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
// Import directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

export default function AverageRegulationLengthChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Use hardcoded data directly from the JSON file
        const agencyMetrics = agencyMetricsJson.agencies;
        
        if (!agencyMetrics || !Array.isArray(agencyMetrics) || agencyMetrics.length === 0) {
          setError("No agency metrics data available");
          return;
        }
        
        // Calculate average words per section for each agency
        const agenciesWithAvg = agencyMetrics
          .filter(agency => agency.sectionCount > 10) // Ensure we have enough sections for meaningful average
          .map(agency => ({
            name: agency.name,
            avgWordsPerSection: Math.round(agency.wordCount / agency.sectionCount)
          }));
        
        // Sort by average word count and get top 5
        const topAgencies = agenciesWithAvg
          .sort((a, b) => b.avgWordsPerSection - a.avgWordsPerSection)
          .slice(0, 5);

        const renderChart = async () => {
          // Only execute in browser environment
          if (typeof window === "undefined") return;

          try {
            // Dynamically import Chart.js
            const { Chart, registerables } = await import("chart.js");
            Chart.register(...registerables);

            const labels = topAgencies.map(agency => {
              // Simplify agency names
              const name = agency.name.replace("Department of ", "Dept. of ");
              return name.length > 20 ? name.substring(0, 18) + "..." : name;
            });
            
            const data = topAgencies.map(agency => agency.avgWordsPerSection);

            // Clear any existing chart
            if (chartRef.current) {
              chartRef.current.innerHTML = '';
              const canvas = document.createElement('canvas');
              chartRef.current.appendChild(canvas);

              // Create a horizontal bar chart with burgundy/maroon colors
              new Chart(canvas, {
                type: 'bar',
                data: {
                  labels,
                  datasets: [{
                    label: 'Avg Words per Section',
                    data,
                    backgroundColor: '#8b0000', // burgundy/maroon
                    borderColor: '#640000',
                    borderWidth: 1
                  }]
                },
                options: {
                  indexAxis: 'y', // Horizontal bars
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Words Per Section',
                        font: {
                          family: 'var(--body-font), serif',
                          size: 14
                        }
                      },
                      ticks: {
                        font: {
                          family: 'var(--body-font), serif',
                          size: 13
                        }
                      }
                    },
                    y: {
                      ticks: {
                        font: {
                          family: 'var(--body-font), serif',
                          size: 14
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `Average: ${value.toLocaleString()} words per section`;
                        }
                      }
                    },
                    legend: {
                      display: false
                    }
                  }
                }
              });
            }
          } catch (error) {
            console.error("Failed to render chart:", error);
            setError("Failed to render chart");
          }
        };

        renderChart();
      } catch (err) {
        console.error("Error in AverageRegulationLengthChart:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, []);
  
  if (loading) {
    return (
      <div className="relative">
        <Skeleton height={360} radius="md" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="relative p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <InfoPopover
          target={
            <ActionIcon size="xs" variant="subtle" className="text-gray-400">
              <IconInfoCircle size={14} />
            </ActionIcon>
          }
          width={300}
        >
          <div className="text-sm">
            <p>This chart displays the top 5 agencies with the longest average section length in their regulations.</p>
            <p className="mt-2">These agencies write particularly long or complex regulatory sections.</p>
          </div>
        </InfoPopover>
      </div>
      <div ref={chartRef} className="h-full min-h-[360px]"></div>
    </div>
  );
} 