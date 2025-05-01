package ecfrdata

type Agency struct {
	Name          string `json:"name"`
	ShortName     string `json:"short_name"`
	DisplayName   string `json:"display_name"`
	SortableName  string `json:"sortable_name"`
	Slug          string `json:"slug"`
	Children      []any  `json:"children"`
	CfrReferences []any  `json:"cfr_references"`
}
