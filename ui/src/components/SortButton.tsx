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
          <IconArrowUp size={13} stroke={2.5} />
        ) : isDesc ? (
          <IconArrowDown size={13} stroke={2.5} />
        ) : (
          <IconArrowsUpDown size={13} stroke={2.5} />
        )
      }
      classNames={{
        section: "mr-1",
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
