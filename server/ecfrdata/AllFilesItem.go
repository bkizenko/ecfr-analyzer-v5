package ecfrdata

type AllFilesItem struct {
	FormattedLastModifiedTime string `json:"formattedLastModifiedTime"`
	Name                      string `json:"name"`
	Folder                    bool   `json:"folder"`
	DisplayLabel              string `json:"displayLabel"`
	CFRTitle                  int    `json:"cfrTitle"`
	Link                      string `json:"link"`
	JustFileName              string `json:"justFileName"`
}
