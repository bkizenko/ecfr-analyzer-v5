"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon, Skeleton } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
// Import directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

export default function AgencyProportionChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        // Get top 10 agencies
        const sortedAgencies = [...agencyMetrics].sort((a, b) => b.wordCount - a.wordCount);
        const topAgencies = sortedAgencies.slice(0, 10);
        
        // Calculate total words for top 10 agencies
        const topAgenciesWordCount = topAgencies.reduce((sum, agency) => sum + agency.wordCount, 0);
        
        // Calculate "Other" for the remaining agencies
        const otherWordCount = totalWordCount - topAgenciesWordCount;

        const renderChart = async () => {
          // Only execute in browser environment
          if (typeof window === "undefined") return;

          try {
            // Dynamically import Chart.js
            const { Chart, registerables } = await import("chart.js");
            Chart.register(...registerables);

            // Prepare data for the chart
            const labels = topAgencies.map(agency => {
              // Simplify agency names
              const name = agency.name.replace("Department of ", "Dept. of ");
              // Further shorten agency names to prevent cutoff
              return name.length > 18 ? name.substring(0, 16) + "..." : name;
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

              // Create burgundy/maroon color scheme for top 10 agencies + Other
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
                '#ff7d7d', // Lightest
                '#f09090', // Light burgundy for "Other" (replacing gray)
              ];

              // Create the chart
              new Chart(canvas, {
                type: 'pie',
                data: {
                  labels,
                  datasets: [{
                    label: 'Word Count',
                    data,
                    backgroundColor: burgundyColors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      align: 'start',
                      labels: {
                        padding: 20,
                        boxWidth: 15,
                        boxHeight: 15, 
                        font: {
                          family: 'var(--body-font), serif',
                          size: 16 // Larger font size
                        },
                        // Prevent text from being cut off
                        textAlign: 'left',
                        generateLabels: function(chart) {
                          const original = Chart.overrides.pie.plugins.legend.labels.generateLabels;
                          const labels = original.call(this, chart);
                          return labels;
                        }
                      },
                      // Expand the legend width to prevent cutoff
                      maxWidth: 200
                    },
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
                          const index = context.dataIndex;
                          const value = context.raw as number;
                          return `${context.label}: ${value.toLocaleString()} words (${percentages[index]})`;
                        }
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
      <div className="absolute top-0 right-0 z-10">
        <InfoPopover
          target={
            <ActionIcon size="xs" variant="subtle" className="text-gray-400">
              <IconInfoCircle size={14} />
            </ActionIcon>
          }
          width={300}
        >
          <div className="text-sm">
            <p>This pie chart shows the distribution of regulatory text volume across the top 10 federal agencies.</p>
            <p className="mt-2">These agencies account for a significant portion of federal regulations by word count.</p>
          </div>
        </InfoPopover>
      </div>
      <div ref={chartRef} className="h-full min-h-[400px]"></div>
    </div>
  );
} 