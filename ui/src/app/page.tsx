import {
  fetchAgencyMetrics,
  fetchTitleMetrics,
} from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import GovInfoBulkDataLink from "ecfr-analyzer/components/GovInfoBulkDataLink";
import GovInfoAPILink from "ecfr-analyzer/components/GovInfoAPILink";
import MetricsGrid from "ecfr-analyzer/components/MetricsGrid";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { countSubAgencies } from "ecfr-analyzer/service/AgencyService";
import Link from "next/link";
import { IconBuildingBank, IconSearch, IconRefresh, IconDatabase } from "@tabler/icons-react";
import AgencyWordCountChart from "ecfr-analyzer/components/AgencyWordCountChart";
import HistoricalChangesChart from "ecfr-analyzer/components/HistoricalChangesChart";

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

  return (
    <PageContainer>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Federal Regulations Analytics Platform</h1>
            <p className="text-xl text-blue-100 mb-8">Track, analyze, and understand the complexity of federal regulations with powerful metrics and insights.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/agency-search" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-colors">
                <IconSearch size={18} className="mr-2" />
                Browse & Search Regulations
              </Link>
              <Link href="/updates" className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white bg-transparent hover:bg-white/10 transition-colors">
                <IconRefresh size={18} className="mr-2" />
                Recent Updates
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-12 pb-20">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CFR Analytics Dashboard</h2>
          <p className="text-gray-600 mb-8">Real-time insights into federal regulations data</p>
          
          <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
            <Link href="/agency-search" className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap">
              <IconDatabase size={18} />
              <span>Browse & Search Regulations</span>
            </Link>
            <Link href="/updates" className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap">
              <IconRefresh size={18} />
              <span>Updates</span>
            </Link>
          </div>
        </div>
        
        <div className="mb-16">
          <MetricsGrid
            metrics={[
              {
                count: titleMetrics.wordCount,
                label: "Word Count",
                info: (
                  <div>
                    Word count calculated by extracting the text from each title
                    BODY content and splitting on whitespace, using data
                    available via <GovInfoBulkDataLink />
                  </div>
                ),
              },
              {
                count: titleMetrics.sectionCount,
                label: "Total Regulations",
                info: (
                  <div>
                    Section count calculated by counting the number of DIV8
                    instances in each title, using data available via{" "}
                    <GovInfoBulkDataLink />
                  </div>
                ),
              },
              {
                count: agencyCount,
                label: "Average Length",
                info: (
                  <div>
                    Average words per regulation based on data returned via the admin
                    agencies API found here: <GovInfoAPILink />
                  </div>
                ),
              },
            ]}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Top Agencies by Word Count
            </h2>
            <p className="text-sm text-gray-600 mb-6">Agencies with the most verbose regulations</p>
            <AgencyWordCountChart />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Historical Changes
            </h2>
            <p className="text-sm text-gray-600 mb-6">Regulation changes over time</p>
            <HistoricalChangesChart />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
