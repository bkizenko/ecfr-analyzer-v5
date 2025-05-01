package ecfrdata

type TitleFileItem struct {
	MimeType                  string `json:"mimeType"`
	Size                      int    `json:"size"`
	FormattedLastModifiedTime string `json:"formattedLastModifiedTime"`
	Name                      string `json:"name"`
	Folder                    bool   `json:"folder"`
	DisplayLabel              string `json:"displayLabel"`
	FormattedSize             string `json:"formattedSize"`
	Link                      string `json:"link"`
	JustFileName              string `json:"justFileName"`
	FileExtension             string `json:"fileExtension"`
}
