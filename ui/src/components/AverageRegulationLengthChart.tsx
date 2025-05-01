"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon, Skeleton, Tooltip } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
import { useRouter } from "next/navigation";
// Import directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

export default function AverageRegulationLengthChart() {
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
        
        // Calculate average words per section for each agency
        const agenciesWithAvg = agencyMetrics
          .filter(agency => agency.sectionCount > 0)
          .map(agency => ({
            name: agency.name,
            slug: agency.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            avgWordsPerSection: Math.round(agency.wordCount / agency.sectionCount),
            wordCount: agency.wordCount,
            sectionCount: agency.sectionCount
          }));
        
        // Sort by average word count and get top 10
        const topAgencies = agenciesWithAvg
          .sort((a, b) => b.avgWordsPerSection - a.avgWordsPerSection)
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
            
            const data = topAgencies.map(agency => agency.avgWordsPerSection);

            // Clear any existing chart
            if (chartRef.current) {
              chartRef.current.innerHTML = '';
              const canvas = document.createElement('canvas');
              chartRef.current.appendChild(canvas);

              // Create gradient for bars
              const ctx = canvas.getContext('2d');
              const gradient = ctx?.createLinearGradient(0, 0, 0, 300);
              if (gradient) {
                gradient.addColorStop(0, '#8b0000');
                gradient.addColorStop(1, '#b22222');
              }

              // Create a horizontal bar chart with burgundy/maroon colors
              const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                  labels,
                  datasets: [{
                    label: 'Avg Words per Section',
                    data,
                    backgroundColor: gradient || '#8b0000',
                    borderColor: '#640000',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: '#a31010',
                    barPercentage: 0.7
                  }]
                },
                options: {
                  indexAxis: 'y', // Horizontal bars
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      title: {
                        display: true,
                        text: 'Average Words Per Section',
                        font: {
                          family: 'var(--body-font), serif',
                          size: 12
                        }
                      },
                      ticks: {
                        font: {
                          family: 'var(--body-font), serif'
                        }
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'var(--body-font), serif'
                        }
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
                          const index = context.dataIndex;
                          const agency = topAgencies[index];
                          return [
                            `Average: ${value.toLocaleString()} words per section`,
                            `Total words: ${agency.wordCount.toLocaleString()}`,
                            `Total sections: ${agency.sectionCount.toLocaleString()}`
                          ];
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
                      const agency = topAgencies[index];
                      setSelectedAgency(agency.name);
                      
                      // Navigate to agency page
                      setTimeout(() => {
                        router.push(`/agency/${agency.slug}`);
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
              <p>This chart displays agencies with the longest average section length in their regulations.</p>
              <p className="mt-2">Some agencies write particularly long or complex regulatory sections, which may impact readability and compliance.</p>
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