package data

type AgencyReference struct {
	Title int `json:"title"`
}

type Agency struct {
	InternalId       int                `json:"-"`
	Id               string             `json:"id"`
	Name             string             `json:"name"`
	ShortName        string             `json:"shortName"`
	DisplayName      string             `json:"displayName"`
	SortableName     string             `json:"sortableName"`
	Slug             string             `json:"slug"`
	Parent           *Agency            `json:"parent"`
	Children         []*Agency          `json:"children"`
	AgencyReferences []*AgencyReference `json:"cfr_references"`
}
