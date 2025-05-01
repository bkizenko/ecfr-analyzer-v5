import {
  fetchMetricsForAgency,
  fetchSubAgencyMetrics,
} from "ecfr-analyzer/service/MetricService";
import Error from "ecfr-analyzer/components/Error";
import GovInfoBulkDataLink from "ecfr-analyzer/components/GovInfoBulkDataLink";
import GovInfoAPILink from "ecfr-analyzer/components/GovInfoAPILink";
import MetricsGrid from "ecfr-analyzer/components/MetricsGrid";
import PageContainer from "ecfr-analyzer/components/PageContainer";
import { Button } from "@mantine/core";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import AgencyGrid from "ecfr-analyzer/components/AgencyGrid";
import { countSubAgencies } from "ecfr-analyzer/service/AgencyService";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const agencyMetricsResponse = await fetchMetricsForAgency(slug);
  const agencyMetrics = agencyMetricsResponse.data;
  if (agencyMetricsResponse.err || !agencyMetrics) {
    return <Error message={agencyMetricsResponse.err?.message} />;
  }

  const subAgencyMetricsResponse = await fetchSubAgencyMetrics(slug);
  const subAgencyMetrics = subAgencyMetricsResponse.data;
  if (subAgencyMetricsResponse.err || !subAgencyMetrics) {
    return <Error message={subAgencyMetricsResponse.err?.message} />;
  }

  const agency = agencyMetrics.agency;

  const subAgencyCount = countSubAgencies(agency);
  const references =
    (agency.cfr_references?.length || 0) +
    (agency.children || []).reduce(
      (acc, cur) => acc + (cur?.cfr_references?.length || 0),
      0,
    );

  return (
    <PageContainer title={agency.displayName}>
      <div>
        <div className="m-auto mt-6 max-w-4xl px-4">
          <Button variant="subtle" component={Link} href="/" size="compact-sm">
            <IconArrowLeft size={15} className="mr-1" /> View all agencies
          </Button>
        </div>
        <div className="mt-10 flex justify-center px-4">
          <MetricsGrid
            metrics={[
              {
                count: agencyMetrics.metrics.wordCount,
                label: "Total Words",
                info: (
                  <div>
                    Word count calculated by extracting the text from each part
                    of the CFR that the agency is tied to and splitting on
                    whitespace, using data available via <GovInfoBulkDataLink />
                  </div>
                ),
              },
              {
                count: agencyMetrics.metrics.sectionCount,
                label: "Total Sections",
                info: (
                  <div>
                    Section count calculated by counting the number of DIV8
                    instances in each part of the CFR that the agency is tied
                    to, using data available via <GovInfoBulkDataLink />
                  </div>
                ),
              },
              {
                count: subAgencyCount,
                label: "Inner Agencies",
                info: (
                  <div>
                    Inner agency count is based on the child agencies returned
                    with the agency, via the admin agencies API found here:{" "}
                    <GovInfoAPILink />
                  </div>
                ),
              },
              {
                count: references,
                label: "References",
                info: (
                  <div>
                    Reference count is based on the number of references for the
                    agency and child agencies returned via the admin agencies
                    API found here: <GovInfoAPILink />
                  </div>
                ),
              },
            ]}
          />
        </div>
        {subAgencyCount > 0 && (
          <div className="m-auto mt-20 max-w-[95rem] px-4">
            <div className="font-title decoration-primary-700 mb-7 w-full text-center text-2xl font-bold uppercase underline decoration-4 underline-offset-8 md:text-4xl">
              Inner Agencies
            </div>
            <AgencyGrid agencyMetrics={subAgencyMetrics} isSubAgency={true} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
