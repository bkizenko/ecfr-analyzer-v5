"use client";

import { useState, useEffect } from "react";
import { fetchAgencyMetrics } from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { IconSearch, IconBuildingBank, IconSortAscending } from "@tabler/icons-react";

export default function AgencySearchPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
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
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Here you would typically call an API to search
    // For now, we'll just simulate a search with a timeout
    setTimeout(() => {
      setIsSearching(false);
      setSearchResults([]);
    }, 1000);
  };

  if (error) {
    return <Error message={error} />;
  }

  return (
    <PageContainer title="Browse & Search Regulations">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Browse & Search Regulations</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button 
                onClick={() => setActiveTab("browse")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "browse" 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <IconBuildingBank size={18} />
                  <span>Browse Agencies</span>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab("search")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "search" 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <IconSearch size={18} />
                  <span>Search Regulations</span>
                </div>
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === "browse" ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    All Agencies
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">Browse federal agencies and their regulatory metrics</p>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                    <span className="ml-3 text-gray-600">Loading agencies...</span>
                  </div>
                ) : (
                  <AgencyGrid agencyMetrics={agencyMetrics} />
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Search Regulations
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">Find specific regulations by keyword or phrase</p>
                </div>
                
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="mb-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search Term
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconSearch size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="search"
                        className="block w-full rounded-md border-gray-300 border py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Search for regulations, keywords, or phrases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isSearching ? (
                          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </form>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
                  {isSearching ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {/* Results would be mapped here */}
                      <p className="py-4 text-gray-500">Results will appear here</p>
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No results found. Try a different search term.</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Enter a search term above to find regulations.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 