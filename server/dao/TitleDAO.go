package dao

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/lib/pq"
	"github.com/sam-berry/ecfr-analyzer/server/data"
	"strings"
)

type TitleDAO struct {
	Db *sql.DB
}

func (d *TitleDAO) FindAll(ctx context.Context) (
	[]*data.Title,
	error,
) {
	rows, err := d.Db.QueryContext(
		ctx,
		`SELECT id, titleId, name
         FROM title`,
	)
	if err != nil {
		return nil, fmt.Errorf("error finding all titles: %w", err)
	}

	var titles []*data.Title
	for rows.Next() {
		var title data.Title
		err := rows.Scan(
			&title.InternalId,
			&title.Id,
			&title.Name,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning title row: %w", err)
		}

		titles = append(titles, &title)
	}

	return titles, nil
}

func (d *TitleDAO) CountAllWords(ctx context.Context, title int) (int, error) {
	var count int
	err := d.Db.QueryRowContext(
		ctx,
		`SELECT
             SUM(COALESCE(ARRAY_LENGTH(ARRAY_REMOVE(REGEXP_SPLIT_TO_ARRAY(
                 (SELECT STRING_AGG((XPATH('string(.)', d))[1]::TEXT, ' ')
                  FROM title,
                  LATERAL UNNEST(XPATH('//DIV1', content)) AS d
                  WHERE name = $1),
             '\s+'), ''), 1), 0));`,
		title,
	).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("error counting words for title, %d, %w", title, err)
	}

	return count, nil
}

func (d *TitleDAO) CountAllSections(ctx context.Context, title int) (
	int,
	error,
) {
	var count int
	err := d.Db.QueryRowContext(
		ctx,
		`SELECT 
             SUM(COALESCE(
                 (XPATH(
                     'count((//BODY//DIV8))',
                     content
                 ))[1]::TEXT::NUMERIC,
             0)) 
        FROM title 
        WHERE name = $1;`,
		title,
	).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("error counting sections for title, %v, %w", title, err)
	}

	return count, nil
}

func (d *TitleDAO) CountAgencyWords(ctx context.Context, agencyName string, titles []int) (
	int,
	error,
) {
	var count int
	err := d.Db.QueryRowContext(
		ctx,
		`SELECT
             SUM(COALESCE(ARRAY_LENGTH(ARRAY_REMOVE(REGEXP_SPLIT_TO_ARRAY(ARRAY_TO_STRING(
                 (XPATH(
                     '//BODY//HEAD[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' || $1 || '")]/..//text()',
                     content
                 )),
             ' '), '\s+'), ''), 1), 0))
        FROM title 
        WHERE NAME = ANY($2);`,
		strings.ToLower(agencyName),
		pq.Array(titles),
	).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("error counting words for agency, %v, %w", agencyName, err)
	}

	return count, nil
}

func (d *TitleDAO) CountAgencySections(ctx context.Context, agencyName string, titles []int) (
	int,
	error,
) {
	var count int
	err := d.Db.QueryRowContext(
		ctx,
		`SELECT 
             SUM(COALESCE(
                 (XPATH(
                     'count((//BODY//HEAD[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' || $1 || '")]/..//DIV8))',
                     content
                 ))[1]::TEXT::NUMERIC,
             0)) 
        FROM title 
        WHERE name = ANY($2);`,
		strings.ToLower(agencyName),
		pq.Array(titles),
	).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("error counting sections for agency, %v, %w", agencyName, err)
	}

	return count, nil
}
