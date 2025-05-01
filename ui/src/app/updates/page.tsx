"use client";

import { useEffect, useState } from "react";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { fetchHistoricalMetrics } from "ecfr-analyzer/service/HistoricalMetricService";
import { Skeleton } from "@mantine/core";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface RegulationUpdate {
  id: number;
  date: string;
  title: string;
  summary: string;
  agency: string;
  changeType: "Increase" | "Decrease" | "Stable";
  changeAmount: number;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<RegulationUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setLoading(true);
        const response = await fetchHistoricalMetrics();
        
        if (response.err) {
          setError(response.err.message);
        } else if (response.data) {
          // Create updates based on historical data
          const titleMetrics = response.data.titleMetrics.sort((a, b) => b.year - a.year);
          const agencyMetrics = response.data.agencyMetrics.sort((a, b) => b.year - a.year);
          
          if (titleMetrics.length < 2 || agencyMetrics.length < 2) {
            setError("Not enough historical data to show updates");
            return;
          }
          
          // Latest and previous year data
          const latestYear = titleMetrics[0].year;
          const previousYear = titleMetrics[1].year;
          
          // Get latest agency data
          const latestAgencyData = agencyMetrics[0].agencies;
          const previousAgencyData = agencyMetrics[1].agencies;
          
          // Total regulation change
          const totalChange = titleMetrics[0].wordCount - titleMetrics[1].wordCount;
          const totalChangePercent = (totalChange / titleMetrics[1].wordCount * 100).toFixed(1);
          
          let generatedUpdates: RegulationUpdate[] = [];
          
          // Overall update
          generatedUpdates.push({
            id: 1,
            date: `${latestYear}`,
            title: "Overall Federal Regulations Growth",
            summary: `Total regulation word count ${totalChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(totalChange).toLocaleString()} words (${totalChangePercent}%) from ${previousYear} to ${latestYear}`,
            agency: "All Agencies",
            changeType: totalChange > 0 ? "Increase" : (totalChange < 0 ? "Decrease" : "Stable"),
            changeAmount: totalChange
          });
          
          // Get top 5 agencies by change amount
          const agencyChanges = Object.keys(latestAgencyData)
            .filter(agency => previousAgencyData[agency]) // Only include agencies with data in both years
            .map(agency => {
              const current = latestAgencyData[agency] || 0;
              const previous = previousAgencyData[agency] || 0;
              const change = current - previous;
              const changePercent = (change / previous * 100).toFixed(1);
              
              return {
                agency,
                change,
                changePercent,
                current
              };
            })
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)) // Sort by absolute change to get biggest changes
            .slice(0, 5);
          
          // Add agency updates
          agencyChanges.forEach((item, index) => {
            generatedUpdates.push({
              id: index + 2,
              date: `${latestYear}`,
              title: `${item.agency} Regulation ${item.change > 0 ? 'Growth' : 'Reduction'}`,
              summary: `${item.agency} regulations ${item.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(item.change).toLocaleString()} words (${item.changePercent}%) from ${previousYear} to ${latestYear}`,
              agency: item.agency,
              changeType: item.change > 0 ? "Increase" : (item.change < 0 ? "Decrease" : "Stable"),
              changeAmount: item.change
            });
          });
          
          setUpdates(generatedUpdates);
        }
      } catch (err) {
        setError("Failed to load historical data");
      } finally {
        setLoading(false);
      }
    };
    
    loadHistoricalData();
  }, []);

  return (
    <PageContainer title="Regulation Changes">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recent Regulation Changes</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Changes to Federal Regulations
          </h2>
          <p className="text-sm text-gray-600 mb-6">Recent changes in regulation volume based on yearly word count analysis</p>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={80} radius="md" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
              {error}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {updates.map((update) => (
                <div key={update.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{update.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{update.summary}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-gray-500">{update.agency}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{update.date}</span>
                      </div>
                    </div>
                    <div className={`flex items-center text-xs px-3 py-1.5 rounded-full ${getChangeTypeColor(update.changeType)}`}>
                      {update.changeType === "Increase" ? <IconTrendingUp size={14} className="mr-1" /> : 
                       update.changeType === "Decrease" ? <IconTrendingDown size={14} className="mr-1" /> : null}
                      {update.changeType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function getChangeTypeColor(type: string) {
  switch (type) {
    case "Increase":
      return "bg-red-100 text-red-800";
    case "Decrease":
      return "bg-green-100 text-green-800";
    case "Stable":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
} 