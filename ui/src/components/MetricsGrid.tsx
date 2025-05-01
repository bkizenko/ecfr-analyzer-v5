import { ReactNode } from "react";
import NumberCounter from "ecfr-analyzer/components/NumberCounter";
import InfoPopover from "ecfr-analyzer/components/InfoPopover";
import { ActionIcon } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export default function MetricsGrid({
  metrics,
}: {
  metrics: {
    count: number;
    label: string;
    info: string | ReactNode;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-7xl px-4">
      {metrics.map((it, i) => (
        <div key={i} className="metrics-card p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">{it.label}</h3>
          <div className="text-gray-900 text-3xl font-bold mb-1">
            <NumberCounter start={0} end={it.count}></NumberCounter>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-sm text-gray-500">
              <InfoPopover
                target={
                  <ActionIcon size="xs" variant="subtle" className="text-gray-400">
                    <IconInfoCircle size={14} />
                  </ActionIcon>
                }
                width={300}
              >
                {it.info}
              </InfoPopover>
              More information
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
