"use client";

import { useState, useEffect } from "react";
import { fetchAgencyMetrics } from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { IconSearch, IconBuildingBank, IconSortAscending, IconArrowsSort } from "@tabler/icons-react";
import Link from "next/link";

export default function AgencySearchPage() {
  const [sortMethod, setSortMethod] = useState("word-count");
  
  // This would be a server component in a real implementation
  // For demo purposes, we'll load data on the client
  const [agencyMetrics, setAgencyMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load agency data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAgencyMetrics();
        if (response.err) {
          setError(response.err.message);
        } else {
          setAgencyMetrics(response.data || []);
        }
      } catch (err) {
        setError("Failed to load agency data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (error) {
    return <Error message={error} />;
  }

  // Sort metrics based on selected method
  const getSortedAgencyMetrics = () => {
    if (!agencyMetrics || agencyMetrics.length === 0) return [];
    
    const metrics = [...agencyMetrics];
    
    switch (sortMethod) {
      case "word-count":
        return metrics.sort((a, b) => b.wordCount - a.wordCount);
      case "regulations":
        return metrics.sort((a, b) => b.sectionCount - a.sectionCount);
      case "agency-name":
        return metrics.sort((a, b) => a.agency.name.localeCompare(b.agency.name));
      default:
        return metrics;
    }
  };

  const sortedMetrics = getSortedAgencyMetrics();

  return (
    <PageContainer title="Browse Federal Agencies">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FEDERAL REGULATIONS BY AGENCY</h1>
            <p className="text-xl text-slate-200 mb-8">Browse metrics for each federal agency's regulations</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconSearch size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 focus:border-accent-shade-700 focus:outline-none focus:ring-1 focus:ring-accent-shade-700"
                placeholder="Search Agencies"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-8">
            <button 
              onClick={() => setSortMethod("word-count")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                sortMethod === "word-count" 
                  ? "bg-accent-shade-700 text-white" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <IconArrowsSort size={18} />
              <span>Sort by words</span>
            </button>
            
            <button 
              onClick={() => setSortMethod("regulations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                sortMethod === "regulations" 
                  ? "bg-accent-shade-700 text-white" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <IconArrowsSort size={18} />
              <span>Sort by regulations</span>
            </button>
            
            <button 
              onClick={() => setSortMethod("agency-name")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                sortMethod === "agency-name" 
                  ? "bg-accent-shade-700 text-white" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <IconArrowsSort size={18} />
              <span>Sort by agency</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-shade-700"></div>
            <span className="ml-3 text-slate-600">Loading agencies...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMetrics.map((metric) => (
              <div key={metric.agency.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{metric.agency.name}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-accent-shade-700">
                        {metric.wordCount.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Words</div>
                    </div>
                    
                    <div>
                      <div className="text-2xl font-bold text-slate-800">
                        {metric.sectionCount.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Sections</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-4">
                    {metric.subAgencyCount} inner agencies
                  </div>
                  
                  <Link 
                    href={`/agency/${metric.agency.slug}`}
                    className="inline-block text-sm text-accent-shade-700 hover:text-accent-shade-600 font-medium"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
} 