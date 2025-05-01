import {
  fetchAgencyMetrics,
  fetchTitleMetrics,
} from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import GovInfoBulkDataLink from "ecfr-analyzer/components/GovInfoBulkDataLink";
import GovInfoAPILink from "ecfr-analyzer/components/GovInfoAPILink";
import MetricsGrid from "ecfr-analyzer/components/MetricsGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { countSubAgencies } from "ecfr-analyzer/service/AgencyService";
import AgencyWordCountChart from "ecfr-analyzer/components/AgencyWordCountChart";
import AgencyProportionChart from "ecfr-analyzer/components/AgencyProportionChart";
import AverageRegulationLengthChart from "ecfr-analyzer/components/AverageRegulationLengthChart";
import Link from "next/link";
import { IconArrowRight, IconSearch, IconChartBar, IconBuildingBank } from "@tabler/icons-react";
import { Transition } from "@mantine/core";
import { useEffect, useState } from "react";

// CountUp component for animated number increases
function CountUpMetric({ 
  end, 
  duration = 2000,
  formatter = (value: number) => value.toLocaleString()
}: { 
  end: number, 
  duration?: number,
  formatter?: (value: number) => string
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    const step = Math.ceil(end / (duration / 16)); // 60fps approximation
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration]);
  
  return (
    <Transition mounted={isVisible} transition="fade" duration={400}>
      {(styles) => (
        <div style={styles} className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {formatter(count)}
        </div>
      )}
    </Transition>
  );
}

// Client-side component wrapper for metrics cards
function MetricsDisplay({ 
  wordCount,
  sectionCount,
  avgWordsPerRegulation
}: {
  wordCount: number,
  sectionCount: number,
  avgWordsPerRegulation: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 duration-300">
        <CountUpMetric end={wordCount} />
        <div className="text-lg text-slate-600">Total Words</div>
        <div className="mt-4 text-xs text-slate-500 text-center">
          Word count calculated from CFR text content
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 duration-300">
        <CountUpMetric end={sectionCount} />
        <div className="text-lg text-slate-600">Total Regulations</div>
        <div className="mt-4 text-xs text-slate-500 text-center">
          Unique regulatory sections in the CFR
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 duration-300">
        <CountUpMetric end={avgWordsPerRegulation} />
        <div className="text-lg text-slate-600">Average Length</div>
        <div className="mt-4 text-xs text-slate-500 text-center">
          Average words per regulatory section
        </div>
      </div>
    </div>
  );
}

// Server component
export default async function Page() {
  const titleMetricsResponse = await fetchTitleMetrics();
  const titleMetrics = titleMetricsResponse.data;
  if (titleMetricsResponse.err || !titleMetrics) {
    return <Error message={titleMetricsResponse.err?.message} />;
  }

  const agencyMetricsResponse = await fetchAgencyMetrics();
  const agencyMetrics = agencyMetricsResponse.data;
  if (agencyMetricsResponse.err || !agencyMetrics) {
    return <Error message={agencyMetricsResponse.err?.message} />;
  }

  const agencyCount = agencyMetrics.length;
  const subAgencyCount = agencyMetrics.reduce(
    (acc, cur) => acc + countSubAgencies(cur.agency),
    0,
  );
  
  // Calculate average words per regulation
  const avgWordsPerRegulation = Math.round(titleMetrics.wordCount / titleMetrics.sectionCount);

  return (
    <PageContainer>
      {/* Hero Section with updated colors */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">CODE OF FEDERAL REGULATIONS</h1>
            <p className="text-xl text-slate-200 mb-8">Analytics platform for tracking and understanding the complexity of federal regulations.</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-12 pb-20">
        {/* Main Metrics Section - Centered and Prominent */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Federal Regulations Metrics</h2>
            
            {/* Client metrics display with animations */}
            <MetricsDisplay 
              wordCount={titleMetrics.wordCount}
              sectionCount={titleMetrics.sectionCount}
              avgWordsPerRegulation={avgWordsPerRegulation}
            />
            
            {/* Browse Agencies Button */}
            <div className="mt-8 flex justify-center">
              <Link 
                href="/agency-search"
                className="px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all flex items-center gap-2 group"
              >
                <IconBuildingBank size={18} />
                <span>Browse Federal Agencies</span>
                <IconArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="mt-6 text-center text-sm text-slate-500">
              Data sourced from <GovInfoBulkDataLink /> and <GovInfoAPILink />
            </div>
          </div>
        </div>
        
        {/* Data Visualization Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Regulatory Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Top Agencies by Word Count
              </h2>
              <p className="text-sm text-slate-600 mb-6">Agencies with the most verbose regulations</p>
              <AgencyWordCountChart />
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Regulation Distribution
              </h2>
              <p className="text-sm text-slate-600 mb-6">Percentage of total regulation words by agency</p>
              <AgencyProportionChart />
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Average Regulation Length by Agency
            </h2>
            <p className="text-sm text-slate-600 mb-6">Agencies with the longest average regulations (words per section)</p>
            <AverageRegulationLengthChart />
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link 
            href="/agency-search" 
            className="flex items-center p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-slate-300 group"
          >
            <div className="mr-4 p-3 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors">
              <IconSearch size={24} className="text-slate-700" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Search Agencies</h3>
              <p className="text-sm text-slate-600">Find and analyze specific federal regulatory agencies</p>
            </div>
            <IconArrowRight size={20} className="ml-auto text-slate-400 group-hover:text-slate-800 transition-colors group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/agency" 
            className="flex items-center p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-slate-300 group"
          >
            <div className="mr-4 p-3 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors">
              <IconChartBar size={24} className="text-slate-700" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Compare Regulations</h3>
              <p className="text-sm text-slate-600">Compare metrics across different regulatory bodies</p>
            </div>
            <IconArrowRight size={20} className="ml-auto text-slate-400 group-hover:text-slate-800 transition-colors group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Additional Stats */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Federal Agencies</h3>
              <p className="text-2xl font-bold text-slate-900">{agencyCount.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Federal agencies issuing regulations</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Sub-Agencies</h3>
              <p className="text-2xl font-bold text-slate-900">{subAgencyCount.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Departments and divisions within agencies</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
