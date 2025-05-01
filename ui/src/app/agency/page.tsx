import { fetchAgencyMetrics } from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";

export default async function AgencyPage() {
  const agencyMetricsResponse = await fetchAgencyMetrics();
  const agencyMetrics = agencyMetricsResponse.data;
  
  if (agencyMetricsResponse.err || !agencyMetrics) {
    return <Error message={agencyMetricsResponse.err?.message} />;
  }

  return (
    <PageContainer title="Agencies">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Agencies</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Agencies
          </h2>
          <p className="text-sm text-gray-600 mb-6">Browse federal agencies and their regulatory metrics</p>
          
          <AgencyGrid agencyMetrics={agencyMetrics} />
        </div>
      </div>
    </PageContainer>
  );
} 