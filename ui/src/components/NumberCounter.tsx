"use client";

import CountUp from "react-countup";

function abbreviateNumber(num: number): string {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast((item) => num >= item.value);
  return item
    ? (num / item.value).toFixed(2).replace(regexp, "").concat(item.symbol)
    : "0";
}

export default function NumberCounter({
  start,
  end,
  abbreviate,
}: {
  start: number;
  end: number;
  abbreviate?: boolean;
}) {
  return (
    <CountUp
      start={start}
      end={end}
      formattingFn={abbreviate ? abbreviateNumber : undefined}
    ></CountUp>
  );
}
