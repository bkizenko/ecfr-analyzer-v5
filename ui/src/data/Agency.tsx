export interface AgencyReference {
  title: number;
}

export interface Agency {
  internalId: number;
  id: string;
  name: string;
  shortName: string;
  displayName: string;
  sortableName: string;
  slug: string;
  parent?: Agency;
  children: Agency[];
  cfr_references: AgencyReference[];
}
