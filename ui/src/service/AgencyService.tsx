import { Agency } from "ecfr-analyzer/data/Agency";

export function countSubAgencies(agency: Agency) {
  return agency?.children?.length || 0;
}
