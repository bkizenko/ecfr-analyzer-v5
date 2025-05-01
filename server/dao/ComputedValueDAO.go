package dao

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/sam-berry/ecfr-analyzer/server/data"
	"time"
)

type ComputedValueDAO struct {
	Db *sql.DB
}

func (d *ComputedValueDAO) Insert(
	ctx context.Context,
	cv *data.ComputedValue,
) error {
	id := uuid.New().String()

	dBytes, err := cv.Data.MarshalJSON()
	if err != nil {
		return fmt.Errorf("error converting data to bytes: %v", err)
	}

	_, err = d.Db.ExecContext(
		ctx,
		`INSERT INTO computed_value(valueId, key, data, createdTimestamp) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE
         SET data = $3, createdTimestamp = $4
         WHERE computed_value.key = $2`,
		id,
		cv.Key,
		dBytes,
		time.Now().UTC(),
	)

	if err != nil {
		return fmt.Errorf("error inserting computed value, %v, %w", cv.Key, err)
	}

	return nil
}

func (d *ComputedValueDAO) FindByKey(
	ctx context.Context,
	key string,
) (*data.ComputedValue, error) {
	var cv data.ComputedValue
	var dBytes []byte

	err := d.Db.QueryRowContext(
		ctx,
		`SELECT id, valueId, key, data
         FROM computed_value
         WHERE key = $1`,
		key,
	).Scan(
		&cv.InternalId,
		&cv.Id,
		&cv.Key,
		&dBytes,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("error finding computed value by key: %v, %w", key, err)
	}

	if err := json.Unmarshal(dBytes, &cv.Data); err != nil {
		return nil, fmt.Errorf(
			"error unmarshalling computed value data, %v, %w",
			key,
			err,
		)
	}

	return &cv, nil
}

func (d *ComputedValueDAO) FindByKeyPrefix(
	ctx context.Context,
	prefix string,
) ([]*data.ComputedValue, error) {
	rows, err := d.Db.QueryContext(
		ctx,
		`SELECT id, valueId, key, data
         FROM computed_value
         WHERE key LIKE $1 || '%'`,
		prefix,
	)

	if err != nil {
		return nil, fmt.Errorf("error finding computed values by prefix: %v, %w", prefix, err)
	}

	var values []*data.ComputedValue
	for rows.Next() {
		var value data.ComputedValue
		var dBytes []byte

		err := rows.Scan(
			&value.InternalId,
			&value.Id,
			&value.Key,
			&dBytes,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning computed value row: %v, %w", prefix, err)
		}

		if err := json.Unmarshal(dBytes, &value.Data); err != nil {
			return nil, fmt.Errorf(
				"error unmarshalling computed value data, %v, %w",
				prefix,
				err,
			)
		}
		values = append(values, &value)
	}

	return values, nil
}
