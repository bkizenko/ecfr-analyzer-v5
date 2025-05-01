"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon, Skeleton } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
// Import directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

export default function AgencyWordCountChart() {
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
        
        // Get top 5 agencies by word count
        const topAgencies = [...agencyMetrics]
          .sort((a, b) => b.wordCount - a.wordCount)
          .slice(0, 5);

        const renderChart = async () => {
          // Only execute in browser environment
          if (typeof window === "undefined") return;

          try {
            // Dynamically import Chart.js
            const { Chart, registerables } = await import("chart.js");
            Chart.register(...registerables);

            const labels = topAgencies.map(agency => {
              // Simplify agency names for better display
              const name = agency.name.replace("Department of ", "Dept. of ");
              // Ensure names aren't too long
              return name.length > 20 ? name.substring(0, 18) + "..." : name;
            });
            
            const data = topAgencies.map(agency => agency.wordCount);

            // Format word counts (e.g., 15,000,000 → 15M)
            const formatWordCount = (value: number) => {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + 'K';
              }
              return value;
            };

            // Clear any existing chart
            if (chartRef.current) {
              chartRef.current.innerHTML = '';
              const canvas = document.createElement('canvas');
              chartRef.current.appendChild(canvas);

              // Create a gradient of burgundy/maroon colors - just 5 colors needed
              const burgundyColors = [
                '#8b0000', // Main burgundy
                '#980000',
                '#a50f0f',
                '#b21e1e',
                '#bf2c2c'
              ];

              // Create the chart
              new Chart(canvas, {
                type: 'bar',
                data: {
                  labels,
                  datasets: [{
                    label: 'Word Count',
                    data,
                    backgroundColor: burgundyColors,
                    borderColor: '#640000',
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Word Count',
                        font: {
                          family: 'var(--body-font), serif',
                          size: 16
                        }
                      },
                      ticks: {
                        callback: function(value) {
                          return formatWordCount(Number(value));
                        },
                        font: {
                          family: 'var(--body-font), serif',
                          size: 15
                        }
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 30,
                        minRotation: 30,
                        font: {
                          family: 'var(--body-font), serif',
                          size: 16
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      titleFont: {
                        family: 'var(--body-font), serif',
                        size: 16
                      },
                      bodyFont: {
                        family: 'var(--body-font), serif',
                        size: 15
                      },
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `Word Count: ${value.toLocaleString()}`;
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
        console.error("Error in AgencyWordCountChart:", err);
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
        <Skeleton height={400} radius="md" />
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
            <p>This chart shows the top 5 federal agencies with the most words in their regulations.</p>
            <p className="mt-2">These agencies contribute the largest volume of regulatory text to the Code of Federal Regulations.</p>
          </div>
        </InfoPopover>
      </div>
      <div ref={chartRef} className="h-full min-h-[400px]"></div>
    </div>
  );
} 