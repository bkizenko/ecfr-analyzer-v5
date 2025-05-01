import { Button } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowsUpDown,
  IconArrowUp,
} from "@tabler/icons-react";

export default function SortButton({
  isAsc,
  isDesc,
  label,
  sortAsc,
  sortDesc,
  clear,
}: {
  isAsc: boolean;
  isDesc: boolean;
  label: string;
  sortAsc: () => void;
  sortDesc: () => void;
  clear: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="compact-sm"
      leftSection={
        isAsc ? (
          <IconArrowUp size={14} stroke={2} />
        ) : isDesc ? (
          <IconArrowDown size={14} stroke={2} />
        ) : (
          <IconArrowsUpDown size={14} stroke={2} />
        )
      }
      classNames={{
        section: "mr-1",
        root: `rounded-full px-3 py-1 transition-all ${isAsc || isDesc ? 'border-accent text-accent' : 'border-primary-300 text-primary-700'} hover:border-accent hover:text-accent`,
      }}
      onClick={() => {
        if (isDesc) {
          sortAsc();
        } else if (isAsc) {
          clear();
        } else {
          sortDesc();
        }
      }}
    >
      {label}
    </Button>
  );
}
