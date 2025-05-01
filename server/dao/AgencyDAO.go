package dao

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/sam-berry/ecfr-analyzer/server/data"
	"github.com/sam-berry/ecfr-analyzer/server/ecfrdata"
	"time"
)

type AgencyDAO struct {
	Db *sql.DB
}

func (d *AgencyDAO) Insert(
	ctx context.Context,
	agency *ecfrdata.Agency,
) error {
	id := uuid.New().String()

	cBytes, err := json.Marshal(agency.Children)
	if err != nil {
		return fmt.Errorf("error converting children to bytes: %v", err)
	}

	refBytes, err := json.Marshal(agency.CfrReferences)
	if err != nil {
		return fmt.Errorf("error converting CFR references to bytes: %v", err)
	}

	_, err = d.Db.ExecContext(
		ctx,
		`INSERT INTO agency(agencyId, name, shortName, displayName, sortableName, slug, children, cfrReferences, createdTimestamp) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO UPDATE
         SET name = $2, shortName = $3, displayName = $4, sortableName = $5, children = $7, cfrReferences = $8, createdTimestamp = $9
         WHERE agency.slug = $6`,
		id,
		agency.Name,
		agency.ShortName,
		agency.DisplayName,
		agency.SortableName,
		agency.Slug,
		cBytes,
		refBytes,
		time.Now().UTC(),
	)

	if err != nil {
		return fmt.Errorf("error inserting agency, %v, %w", agency.Name, err)
	}

	return nil
}

func (d *AgencyDAO) FindAll(ctx context.Context) ([]*data.Agency, error) {
	rows, err := d.Db.QueryContext(
		ctx,
		`SELECT id, agencyId, name, shortName, displayName, sortableName, slug, children, cfrReferences
         FROM agency`,
	)

	if err != nil {
		return nil, fmt.Errorf("error finding all agencies: %w", err)
	}

	var agencies []*data.Agency
	for rows.Next() {
		var agency data.Agency
		var chData []byte
		var refData []byte

		err := rows.Scan(
			&agency.InternalId,
			&agency.Id,
			&agency.Name,
			&agency.ShortName,
			&agency.DisplayName,
			&agency.SortableName,
			&agency.Slug,
			&chData,
			&refData,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning agency row: %w", err)
		}

		if err := json.Unmarshal(chData, &agency.Children); err != nil {
			return nil, fmt.Errorf(
				"error unmarshalling agency children, %v, %w",
				agency.Name,
				err,
			)
		}

		if err := json.Unmarshal(refData, &agency.AgencyReferences); err != nil {
			return nil, fmt.Errorf(
				"error unmarshalling agency references, %v, %w",
				agency.Name,
				err,
			)
		}
		agencies = append(agencies, &agency)
	}

	return agencies, nil
}

func (d *AgencyDAO) FindBySlug(
	ctx context.Context,
	slug string,
) (*data.Agency, error) {
	var a data.Agency
	var chData []byte
	var refData []byte

	err := d.Db.QueryRowContext(
		ctx,
		`SELECT id, agencyId, name, shortName, displayName, sortableName, slug, children, cfrReferences
         FROM agency
         WHERE slug = $1`,
		slug,
	).Scan(
		&a.InternalId,
		&a.Id,
		&a.Name,
		&a.ShortName,
		&a.DisplayName,
		&a.SortableName,
		&a.Slug,
		&chData,
		&refData,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}

		return nil, fmt.Errorf("error finding agency by slug: %v, %w", slug, err)
	}

	if err := json.Unmarshal(chData, &a.Children); err != nil {
		return nil, fmt.Errorf(
			"error unmarshalling agency children, %v, %w",
			a.Name,
			err,
		)
	}

	if err := json.Unmarshal(refData, &a.AgencyReferences); err != nil {
		return nil, fmt.Errorf(
			"error unmarshalling agency references, %v, %w",
			a.Name,
			err,
		)
	}

	return &a, nil
}
