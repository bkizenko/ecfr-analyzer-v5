package dao

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"strings"
	"unicode"
)

// There is a bug with Postgres & libxml2 with UTF-8 special characters.
// At the time of this writing, this occurs with 3 of the 50 title XML exports.
// https://www.postgresql.org/message-id/18274-98d16bc03520665f%40postgresql.org

func removeSpecialCharacters(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsNumber(r) || unicode.IsSpace(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func scrubXML(b []byte) []byte {
	reader := bytes.NewReader(b)

	var output bytes.Buffer

	decoder := xml.NewDecoder(reader)
	encoder := xml.NewEncoder(&output)

	for {
		token, err := decoder.Token()
		if err != nil {
			break
		}

		switch t := token.(type) {
		case xml.CharData:
			cleaned := removeSpecialCharacters(string(t))
			encoder.EncodeToken(xml.CharData(cleaned))
		default:
			encoder.EncodeToken(t)
		}
	}

	if err := encoder.Flush(); err != nil {
		fmt.Printf("Error flushing XML encoder: %v", err)
	}

	return output.Bytes()
}

type Node struct {
	XMLName xml.Name   `xml:""`
	Attrs   []xml.Attr `xml:",any,attr"`
	Nodes   []Node     `xml:",any"`
	Text    string     `xml:",chardata"`
}

func cleanNode(n *Node) {
	if n.Text != "" {
		n.Text = removeSpecialCharacters(n.Text)
	}
	for i := range n.Nodes {
		cleanNode(&n.Nodes[i])
	}
}

func scrubXMLAggresive(data []byte) ([]byte, error) {
	var root Node
	if err := xml.Unmarshal(data, &root); err != nil {
		return nil, fmt.Errorf("error unmarshaling XML: %w", err)
	}
	cleanNode(&root)
	output, err := xml.Marshal(root)
	if err != nil {
		return nil, fmt.Errorf("error marshaling XML: %w", err)
	}
	return output, nil
}
