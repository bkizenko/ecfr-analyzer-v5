"use client";

import { useEffect, useRef } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";

// Simulated historical data
const historicalData = {
  labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
  wordCountData: [94500000, 97200000, 98800000, 101300000, 102600000, 103500000, 104372225],
  sectionCountData: [209000, 214000, 218000, 222500, 225000, 228000, 231304]
};

export default function HistoricalChangesChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      // Only execute in browser environment
      if (typeof window === "undefined") return;

      try {
        // Dynamically import Chart.js
        const { Chart, registerables } = await import("chart.js");
        Chart.register(...registerables);

        // Format counts (e.g., 15,000,000 → 15M)
        const formatCount = (value: number) => {
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
            type: 'line',
            data: {
              labels: historicalData.labels,
              datasets: [
                {
                  label: 'Total Words',
                  data: historicalData.wordCountData,
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                  yAxisID: 'y'
                },
                {
                  label: 'Total Sections',
                  data: historicalData.sectionCountData,
                  borderColor: 'rgb(79, 70, 229)',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.3,
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Word Count'
                  },
                  ticks: {
                    callback: function(value) {
                      return formatCount(Number(value));
                    }
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Section Count'
                  },
                  grid: {
                    drawOnChartArea: false
                  },
                  ticks: {
                    callback: function(value) {
                      return formatCount(Number(value));
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Year'
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const value = context.raw as number;
                      const datasetLabel = context.dataset.label || '';
                      return `${datasetLabel}: ${value.toLocaleString()}`;
                    }
                  }
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
            <p>This chart shows the growth in federal regulations over time.</p>
            <p className="mt-2">Both the total word count and number of sections have consistently increased year over year.</p>
            <p className="mt-2">Since 2017, the eCFR has grown by approximately 10 million words and 22,000 sections.</p>
          </div>
        </InfoPopover>
      </div>
      <div ref={chartRef} className="h-full min-h-[300px]"></div>
    </div>
  );
} 