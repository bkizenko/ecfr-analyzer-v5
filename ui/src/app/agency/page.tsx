import { fetchAgencyMetrics } from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default async function AgencyPage() {
  const agencyMetricsResponse = await fetchAgencyMetrics();
  const agencyMetrics = agencyMetricsResponse.data;
  
  if (agencyMetricsResponse.err || !agencyMetrics) {
    return <Error message={agencyMetricsResponse.err?.message} />;
  }

  return (
    <PageContainer title="Federal Agencies">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FEDERAL REGULATIONS BY AGENCY</h1>
            <p className="text-xl text-slate-200 mb-8">Browse metrics for each federal agency's regulations</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">All Agencies</h2>
          <Link 
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <IconArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-6">Browse federal agencies and their regulatory metrics</p>
          
          <AgencyGrid agencyMetrics={agencyMetrics} />
        </div>
      </div>
    </PageContainer>
  );
} 