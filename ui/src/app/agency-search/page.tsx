"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { fetchAgencyMetrics } from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { IconSearch, IconBuildingBank, IconSortAscending, IconArrowsSort } from "@tabler/icons-react";
import Link from "next/link";
// Importing directly from agency-metrics.json instead of making API calls
import agencyMetricsJson from "ecfr-analyzer/data/agency-metrics.json";

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

  // Get agencies from the static data
  const agencies = agencyMetricsJson.agencies || [];
  
  // Sort agencies alphabetically by name
  const sortedAgencies = [...agencies].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

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
    <PageContainer>
      {/* Hero Section with the same color scheme as the main page */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Federal Agencies</h1>
            <p className="text-lg text-white/80">Browse all federal agencies and their regulations</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">All Federal Agencies</h2>
          <Link 
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAgencies.map((agency) => (
              <div 
                key={agency.id} 
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{agency.name}</h3>
                <div className="text-sm text-slate-600 mb-4">
                  <p><span className="font-medium">Words: </span>{agency.wordCount.toLocaleString()}</p>
                  <p><span className="font-medium">Sections: </span>{agency.sectionCount.toLocaleString()}</p>
                </div>
                <div className="mt-3">
                  <Link 
                    href={`/agency/${agency.id}`}
                    className="text-sm font-medium text-slate-800 hover:text-slate-600 transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 