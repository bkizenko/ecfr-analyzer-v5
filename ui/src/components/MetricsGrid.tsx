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
    <div className="relative mx-4 min-w-64 max-w-2xl md:w-full">
      <div className="bg-primary absolute -left-4 -top-4 bottom-8 right-8"></div>
      <div className="bg-accent absolute -bottom-4 -right-4 left-8 top-8"></div>
      <div className="bg-light border-primary relative flex flex-wrap justify-around gap-8 border p-8 max-sm:flex-col">
        {metrics.map((it, i) => (
          <div
            key={i}
            className="flex min-w-[40%] shrink-0 flex-col items-center gap-2"
          >
            <div className="font-title text-4xl font-bold md:text-5xl">
              <NumberCounter start={0} end={it.count}></NumberCounter>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="font-semibold">{it.label}</div>
              <div className="-mr-4">
                <InfoPopover
                  target={
                    <ActionIcon size="xs" variant="subtle">
                      <IconInfoCircle size={13} />
                    </ActionIcon>
                  }
                  width={300}
                >
                  {it.info}
                </InfoPopover>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
