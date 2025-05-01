"use client";

import { useEffect, useRef } from "react";
import agencyMetricsData from "ecfr-analyzer/data/agency-metrics.json";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";

export default function AgencyWordCountChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      // Only execute in browser environment
      if (typeof window === "undefined") return;

      try {
        // Dynamically import Chart.js
        const { Chart, registerables } = await import("chart.js");
        Chart.register(...registerables);

        // Get top 10 agencies by word count
        const topAgencies = [...agencyMetricsData.agencies]
          .sort((a, b) => b.wordCount - a.wordCount)
          .slice(0, 10);

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

          // Create the chart
          new Chart(canvas, {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                label: 'Word Count',
                data,
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(79, 70, 229, 0.8)',
                  'rgba(99, 102, 241, 0.8)',
                  'rgba(129, 140, 248, 0.8)',
                  'rgba(165, 180, 252, 0.8)',
                  'rgba(199, 210, 254, 0.8)',
                  'rgba(224, 231, 255, 0.8)',
                  'rgba(239, 246, 255, 0.8)',
                  'rgba(219, 234, 254, 0.8)',
                  'rgba(191, 219, 254, 0.8)',
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(79, 70, 229)',
                  'rgb(99, 102, 241)',
                  'rgb(129, 140, 248)',
                  'rgb(165, 180, 252)',
                  'rgb(199, 210, 254)',
                  'rgb(224, 231, 255)',
                  'rgb(239, 246, 255)',
                  'rgb(219, 234, 254)',
                  'rgb(191, 219, 254)',
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return formatWordCount(Number(value));
                    }
                  }
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              },
              plugins: {
                tooltip: {
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
      }
    };

    renderChart();

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, []);

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
            <p>This chart shows the top 10 federal agencies with the most words in their regulations.</p>
            <p className="mt-2">The Department of Treasury leads with over 15 million words, followed by the Department of Agriculture with over 13 million words.</p>
          </div>
        </InfoPopover>
      </div>
      <div ref={chartRef} className="h-full min-h-[300px]"></div>
    </div>
  );
} 