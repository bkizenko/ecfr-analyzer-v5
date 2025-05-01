"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon, Skeleton, Tooltip } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
import { useRouter } from "next/navigation";
// Import directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

export default function AgencyProportionChart() {
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
        const totalWordCount = agencyMetricsJson.metadata.totalWords;
        
        if (!agencyMetrics || !Array.isArray(agencyMetrics) || agencyMetrics.length === 0) {
          setError("No agency metrics data available");
          return;
        }

        // Get top agencies that make up ~80% of the total
        const sortedAgencies = [...agencyMetrics].sort((a, b) => b.wordCount - a.wordCount);
        
        // Calculate cumulative percentages and find where it crosses ~80%
        let cumulativeWordCount = 0;
        const topAgencies = [];
        
        for (const agency of sortedAgencies) {
          topAgencies.push(agency);
          cumulativeWordCount += agency.wordCount;
          
          // Once we've reached approximately 80%, stop adding more
          if (cumulativeWordCount / totalWordCount > 0.8) {
            break;
          }
        }

        // Calculate "Other" for the remaining agencies
        const otherWordCount = totalWordCount - cumulativeWordCount;

        const renderChart = async () => {
          // Only execute in browser environment
          if (typeof window === "undefined") return;

          try {
            // Dynamically import Chart.js
            const { Chart, registerables } = await import("chart.js");
            Chart.register(...registerables);

            // Prepare data for the chart
            const labels = topAgencies.map(agency => {
              // Shorten long agency names
              const name = agency.name.replace("Department of ", "Dept. of ");
              return name.length > 25 ? name.substring(0, 22) + "..." : name;
            });
            
            // Add "Other" category
            labels.push("Other Agencies");
            
            const data = topAgencies.map(agency => agency.wordCount);
            data.push(otherWordCount);
            
            // Calculate percentages for the tooltip
            const percentages = data.map(value => ((value / totalWordCount) * 100).toFixed(1) + '%');

            // Clear any existing chart
            if (chartRef.current) {
              chartRef.current.innerHTML = '';
              const canvas = document.createElement('canvas');
              chartRef.current.appendChild(canvas);

              // Create burgundy/maroon color scheme
              const burgundyColors = [
                '#580000', // Darkest burgundy
                '#6c0000',
                '#8b0000', // Classic burgundy/maroon
                '#a31010',
                '#b82020',
                '#cc3030',
                '#dd4444',
                '#e55858',
                '#eb6c6c',
                '#ff7d7d' // Lightest
              ];

              // Function to handle segment click
              const handleSegmentClick = (index: number) => {
                if (index < topAgencies.length) {
                  const agencyName = topAgencies[index].name;
                  const agencySlug = agencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  setSelectedAgency(agencyName);
                  
                  // Navigate to agency page
                  setTimeout(() => {
                    router.push(`/agency/${agencySlug}`);
                  }, 300);
                }
              };

              // Create the chart
              const chart = new Chart(canvas, {
                type: 'pie',
                data: {
                  labels,
                  datasets: [{
                    label: 'Word Count',
                    data,
                    backgroundColor: burgundyColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverBackgroundColor: burgundyColors.map(color => color.replace('#', '#ee')), // Lighter on hover
                    hoverBorderColor: '#ffffff',
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                  },
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        padding: 20,
                        font: {
                          family: 'var(--body-font), serif',
                          size: 11
                        },
                        generateLabels: (chart) => {
                          const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                          labels.forEach(label => {
                            // Add custom styling to legend items
                            label.lineWidth = 1;
                            label.borderRadius = 2;
                          });
                          return labels;
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                      },
                      onClick: (e, legendItem, legend) => {
                        const index = legendItem.index;
                        if (index !== undefined && index < topAgencies.length) {
                          handleSegmentClick(index);
                        }
                      }
                    },
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
                          const index = context.dataIndex;
                          const value = context.raw as number;
                          return `${context.label}: ${value.toLocaleString()} words (${percentages[index]})`;
                        },
                        afterLabel: function(context) {
                          if (context.dataIndex < topAgencies.length) {
                            return 'Click to view agency details';
                          }
                          return '';
                        }
                      }
                    }
                  },
                  onClick: (e, elements) => {
                    if (elements && elements.length > 0) {
                      const index = elements[0].index;
                      if (index < topAgencies.length) {
                        handleSegmentClick(index);
                      }
                    }
                  },
                  onHover: (e, elements) => {
                    // Change cursor to pointer when hovering over segments (except "Other")
                    const canvas = e.native?.target as HTMLCanvasElement;
                    if (canvas) {
                      if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        canvas.style.cursor = index < topAgencies.length ? 'pointer' : 'default';
                      } else {
                        canvas.style.cursor = 'default';
                      }
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
        console.error("Error in AgencyProportionChart:", err);
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
              <p>This pie chart shows the distribution of regulatory text volume across major federal agencies.</p>
              <p className="mt-2">A small number of agencies account for the majority of federal regulations by word count.</p>
              <div className="mt-3 text-xs text-slate-500 italic">Click on any segment or legend item to view detailed information about that agency.</div>
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
        Click on any segment to view detailed agency information
      </div>
    </div>
  );
} 