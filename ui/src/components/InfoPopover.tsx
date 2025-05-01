import { Popover, PopoverDropdown, PopoverTarget } from "@mantine/core";
import { ReactNode } from "react";

export default function InfoPopover({
  target,
  width,
  children,
}: {
  target: string | ReactNode;
  width?: number;
  children: ReactNode;
}) {
  return (
    <Popover width={width} position="top" withArrow shadow="md">
      <PopoverTarget>{target}</PopoverTarget>
      <PopoverDropdown>{children}</PopoverDropdown>
    </Popover>
  );
}
