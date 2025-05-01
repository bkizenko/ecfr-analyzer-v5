package data

type Title struct {
	InternalId int    `json:"-"`
	Id         string `json:"id"`
	Name       int    `json:"name"`
}
