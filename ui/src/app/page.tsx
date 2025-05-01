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
      <div>
        <div className="mt-16 flex justify-center px-4">
          <MetricsGrid
            metrics={[
              {
                count: titleMetrics.wordCount,
                label: "Total Words",
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
                label: "Total Sections",
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
                label: "Agencies",
                info: (
                  <div>
                    Agency count is based on data returned via the admin
                    agencies API found here: <GovInfoAPILink />
                  </div>
                ),
              },
              {
                count: subAgencyCount,
                label: "Inner Agencies",
                info: (
                  <div>
                    Inner agency count is based on the child agencies returned
                    with each agency, via the admin agencies API found here:{" "}
                    <GovInfoAPILink />
                  </div>
                ),
              },
            ]}
          />
        </div>
        <div className="m-auto mt-20 max-w-[95rem] px-4">
          <div className="font-title decoration-primary-700 mb-7 w-full text-center text-2xl font-bold uppercase underline decoration-4 underline-offset-8 md:text-4xl">
            Federal Regulations by Agency
          </div>
          <AgencyGrid agencyMetrics={agencyMetrics} />
        </div>
      </div>
    </PageContainer>
  );
}
