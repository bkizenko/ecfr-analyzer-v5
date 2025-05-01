"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfoCircle, IconArrowUpRight } from "@tabler/icons-react";
import { ActionIcon, Skeleton, Tooltip } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
import { useRouter } from "next/navigation";
// Import directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

export default function AgencyWordCountChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const router = useRouter();

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
        
        // Get top 10 agencies by word count
        const topAgencies = [...agencyMetrics]
          .sort((a, b) => b.wordCount - a.wordCount)
          .slice(0, 10);

        const renderChart = async () => {
          // Only execute in browser environment
          if (typeof window === "undefined") return;

          try {
            // Dynamically import Chart.js
            const { Chart, registerables } = await import("chart.js");
            Chart.register(...registerables);

            const labels = topAgencies.map(agency => {
              // Shorten long agency names
              const name = agency.name.replace("Department of ", "Dept. of ");
              return name.length > 25 ? name.substring(0, 22) + "..." : name;
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

              // Create a gradient of burgundy/maroon colors
              const burgundyColors = [
                '#8b0000', // Main burgundy
                '#980000',
                '#a50f0f',
                '#b21e1e',
                '#bf2c2c',
                '#cc3b3b',
                '#d94848',
                '#e65656',
                '#f36464',
                '#ff7272'
              ];

              // Create the chart
              const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                  labels,
                  datasets: [{
                    label: 'Word Count',
                    data,
                    backgroundColor: burgundyColors,
                    borderColor: '#640000',
                    borderWidth: 1,
                    hoverBackgroundColor: burgundyColors.map(color => color.replace('#', '#ee')), // Lighter on hover
                    hoverBorderColor: '#9a0000',
                    hoverBorderWidth: 2
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatWordCount(Number(value));
                        },
                        font: {
                          family: 'var(--body-font), serif'
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                          family: 'var(--body-font), serif'
                        }
                      },
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: {
                        family: 'var(--body-font), serif',
                        size: 14
                      },
                      bodyFont: {
                        family: 'var(--body-font), serif',
                        size: 13
                      },
                      padding: 12,
                      cornerRadius: 6,
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `Word Count: ${value.toLocaleString()} words`;
                        },
                        afterLabel: function() {
                          return 'Click to view agency details';
                        }
                      }
                    },
                    legend: {
                      display: false
                    }
                  },
                  onClick: (e, elements) => {
                    if (elements && elements.length > 0) {
                      const index = elements[0].index;
                      const agencyName = topAgencies[index].name;
                      const agencySlug = agencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      setSelectedAgency(agencyName);
                      
                      // Navigate to agency page
                      setTimeout(() => {
                        router.push(`/agency/${agencySlug}`);
                      }, 300);
                    }
                  },
                  onHover: (e, elements) => {
                    // Change cursor to pointer when hovering over bars
                    const canvas = e.native?.target as HTMLCanvasElement;
                    if (canvas) {
                      canvas.style.cursor = elements && elements.length > 0 ? 'pointer' : 'default';
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
  }, [router]);
  
  if (loading) {
    return (
      <div className="relative">
        <Skeleton height={300} radius="md" />
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
      <div className="absolute top-0 right-0 z-10">
        <Tooltip label="View chart information" position="left" withArrow>
          <InfoPopover
            target={
              <ActionIcon 
                size="md" 
                variant="light" 
                color="gray" 
                className="shadow-sm hover:shadow border border-gray-200 bg-white"
              >
                <IconInfoCircle size={16} />
              </ActionIcon>
            }
            width={300}
          >
            <div className="text-sm">
              <p>This chart shows the top 10 federal agencies with the most words in their regulations.</p>
              <p className="mt-2">These agencies contribute the largest volume of regulatory text to the Code of Federal Regulations.</p>
              <div className="mt-3 text-xs text-slate-500 italic">Click on any bar to view detailed information about that agency.</div>
            </div>
          </InfoPopover>
        </Tooltip>
      </div>
      
      {selectedAgency && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-800/80 text-white py-2 px-4 rounded-full text-sm animate-pulse">
          Navigating to {selectedAgency}...
        </div>
      )}
      
      <div ref={chartRef} className="h-full min-h-[300px]"></div>
      
      <div className="text-center mt-2 text-sm text-slate-500">
        Click on any bar to view detailed agency information
      </div>
    </div>
  );
} 