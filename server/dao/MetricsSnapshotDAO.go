package dao

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/sam-berry/ecfr-analyzer/server/data"
)

type MetricsSnapshotDAO struct {
	Db *sql.DB
}

// CreateSnapshot creates a new metrics snapshot
func (d *MetricsSnapshotDAO) CreateSnapshot(
	ctx context.Context,
	description string,
	snapshotDate time.Time,
) (*data.MetricsSnapshot, error) {
	id := uuid.New().String()
	timestamp := time.Now().UTC()

	// Format date to be midnight UTC of the specified date
	formattedDate := time.Date(
		snapshotDate.Year(),
		snapshotDate.Month(),
		snapshotDate.Day(),
		0, 0, 0, 0,
		time.UTC,
	)

	var snapshot data.MetricsSnapshot
	err := d.Db.QueryRowContext(
		ctx,
		`INSERT INTO metrics_snapshot(snapshotId, snapshotDate, description, createdTimestamp) 
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, snapshotId, snapshotDate, description, createdTimestamp`,
		id, formattedDate, description, timestamp,
	).Scan(
		&snapshot.Id,
		&snapshot.SnapshotId,
		&snapshot.SnapshotDate,
		&snapshot.Description,
		&snapshot.CreatedTimestamp,
	)

	if err != nil {
		return nil, fmt.Errorf("error creating metrics snapshot: %w", err)
	}

	return &snapshot, nil
}

// FindAll returns all metrics snapshots
func (d *MetricsSnapshotDAO) FindAll(
	ctx context.Context,
) ([]*data.MetricsSnapshot, error) {
	rows, err := d.Db.QueryContext(
		ctx,
		`SELECT id, snapshotId, snapshotDate, description, createdTimestamp
		 FROM metrics_snapshot
		 ORDER BY snapshotDate DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("error finding metrics snapshots: %w", err)
	}
	defer rows.Close()

	var snapshots []*data.MetricsSnapshot
	for rows.Next() {
		var snapshot data.MetricsSnapshot
		err := rows.Scan(
			&snapshot.Id,
			&snapshot.SnapshotId,
			&snapshot.SnapshotDate,
			&snapshot.Description,
			&snapshot.CreatedTimestamp,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning snapshot row: %w", err)
		}
		snapshots = append(snapshots, &snapshot)
	}

	return snapshots, nil
}

// GetYearlySnapshots returns one snapshot per year, choosing the latest snapshot for each year
func (d *MetricsSnapshotDAO) GetYearlySnapshots(
	ctx context.Context,
) ([]*data.MetricsSnapshot, error) {
	rows, err := d.Db.QueryContext(
		ctx,
		`SELECT DISTINCT ON (EXTRACT(YEAR FROM snapshotDate)) 
			id, snapshotId, snapshotDate, description, createdTimestamp
		 FROM metrics_snapshot
		 ORDER BY EXTRACT(YEAR FROM snapshotDate), snapshotDate DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("error finding yearly metrics snapshots: %w", err)
	}
	defer rows.Close()

	var snapshots []*data.MetricsSnapshot
	for rows.Next() {
		var snapshot data.MetricsSnapshot
		err := rows.Scan(
			&snapshot.Id,
			&snapshot.SnapshotId,
			&snapshot.SnapshotDate,
			&snapshot.Description,
			&snapshot.CreatedTimestamp,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning snapshot row: %w", err)
		}
		snapshots = append(snapshots, &snapshot)
	}

	return snapshots, nil
}
