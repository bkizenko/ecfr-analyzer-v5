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
            <h1 className="text-4xl md:text-5xl font-bold">CODE OF FEDERAL REGULATIONS</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-12 pb-20">
        {/* Main Metrics Section - Centered and Prominent */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Federal Regulations Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{titleMetrics.wordCount.toLocaleString()}</div>
                <div className="text-xl text-slate-600">Total Words</div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{titleMetrics.sectionCount.toLocaleString()}</div>
                <div className="text-xl text-slate-600">Total Regulations</div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{avgWordsPerRegulation.toLocaleString()}</div>
                <div className="text-xl text-slate-600">Average Length</div>
              </div>
            </div>
            
            {/* Browse Agencies Button - Bigger and Blue */}
            <div className="mt-10 flex justify-center">
              <Link 
                href="/agency"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-lg font-medium rounded-md shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                Browse Federal Agencies
              </Link>
            </div>
            
            <div className="mt-8 text-center text-sm text-slate-500">
              Data sourced from <GovInfoBulkDataLink /> and <GovInfoAPILink />
            </div>
          </div>
        </div>
        
        {/* Data Visualization Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Regulatory Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Top Agencies by Word Count
              </h2>
              <AgencyWordCountChart />
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Regulation Distribution
              </h2>
              <AgencyProportionChart />
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Average Regulation Length by Agency
            </h2>
            <AverageRegulationLengthChart />
          </div>
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
