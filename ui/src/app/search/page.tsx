"use client";

import { useState } from "react";
import PageContainer from "ecfr-analyzer/components/PageContainer";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
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

  return (
    <PageContainer title="Search">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Search Regulations</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Term
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="block w-full rounded-md border-gray-300 border py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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
              disabled={isSearching}
            >
              Search
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
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No results found. Try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 