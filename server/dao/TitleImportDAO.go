package dao

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2/log"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"time"
)

var InvalidXMLErrorCode = pq.ErrorCode("2200N")

type TitleImportDAO struct {
	Db *sql.DB
}

func (d *TitleImportDAO) Insert(
	ctx context.Context,
	name int,
	content []byte,
) error {
	id := uuid.New().String()

	err := d.insertTitle(ctx, name, content, id)

	// There are currently 3 titles that cause a Postgres XML error.
	// After first failure, remove special characters - preserving word and section count.
	// After second failure, aggressively translate the XML while preserving metrics
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			if pqErr.Code == InvalidXMLErrorCode {
				log.Info(
					fmt.Sprintf(
						"Invalid XML detected, attempting to scrub title %v",
						name,
					),
				)
				err = d.insertTitle(ctx, name, scrubXML(content), id)
				if err == nil {
					return nil
				}

				var pqErr *pq.Error
				if errors.As(err, &pqErr) {
					if pqErr.Code == InvalidXMLErrorCode {
						log.Info(
							fmt.Sprintf(
								"Invalid XML detected, attempting to aggressively scrub title %v",
								name,
							),
						)
						scrubbedXML, err := scrubXMLAggresive(content)
						if err != nil {
							return fmt.Errorf(
								"error aggressively scrubbing title, %v, %w",
								name,
								err,
							)
						}
						err = d.insertTitle(ctx, name, scrubbedXML, id)
						if err == nil {
							return nil
						}

						return fmt.Errorf(
							"error inserting title after aggresive scrub, %v, %w",
							name,
							err,
						)
					} else {
						return fmt.Errorf("error inserting title after scrub, %v, %w", name, err)
					}
				} else {
					return fmt.Errorf("error inserting title after scrub, %v, %w", name, err)
				}
			}
		}
		return fmt.Errorf("error inserting title, %v, %w", name, err)
	}

	return nil
}

func (d *TitleImportDAO) insertTitle(
	ctx context.Context,
	name int,
	content []byte,
	id string,
) error {
	_, err := d.Db.ExecContext(
		ctx,
		`INSERT INTO title(titleId, name, content, createdTimestamp) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE
         SET content = $3, createdTimestamp = $4
         WHERE title.name = $2`,
		id,
		name,
		content,
		time.Now().UTC(),
	)
	return err
}
