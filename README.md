# CFR-Metrics.com - Federal Regulations Metric Analyzer

## Overview

The purpose of this application is to download Federal Regulations data and produce insights based on the text and
information available. Data is sourced from the [ECFR Bulk Data Repository](https://www.govinfo.gov/bulkdata/ECFR) and
the [eCFR API](https://www.ecfr.gov/developers/documentation/api/v1#/).

The general approach that this application takes is to define jobs which handle the heavy lifting of downloading,
parsing, and collecting insights from the large set of CFR data. These programs then store computed values so that they
can have constant lookup for display and analysis purposes.

This system is currently running on [cfr-metrics.com](https://cfr-metrics.com). 

### Data Model

The following tables make up the data model for this application:

* `agency`: Stores agency data fetched from
  the [/admin/v1/agencies.json](https://www.ecfr.gov/developers/documentation/api/v1#/) API
* `title`: Stores title XML downloaded from the [ECFR Bulk Data Repository](https://www.govinfo.gov/bulkdata/ECFR)
* `computed_value`: A key-value store for computed metrics

[Source](https://github.com/sam-berry/ecfr-analyzer/blob/main/server/sql/ecfr_analyzer.sql)

### Server Architecture

There is a single server definition which handles all API requests - both publicly available endpoints, and the
authenticated import endpoints. It is a Go server which is intended to be run in a serverless environment via
Dockerfile.

[Source](https://github.com/sam-berry/ecfr-analyzer/tree/main/server)

### UI Architecture

The UI for [cfr-metrics.com](https://cfr-metrics.com) is built using NextJS with an emphasis on SSR-capable pages which
can be easily cached. The app is intended to be run in a serverless environment via Dockerfile.

[Source](https://github.com/sam-berry/ecfr-analyzer/tree/main/ui)

### Cloud Architecture

All infrastructure that powers [cfr-metrics.com](https://cfr-metrics.com) is running in Google Cloud via serverless
architecture. This includes:

* Cloud Run Services for both the UI and Server applications
* Cloud CDN to cache UI assets and artifacts
* Cloud SQL using Postgres as a backend
* Load balancing, routing, and SSL

## Data Population Workflow

Assuming the application is running, these are the steps to download and populate the data needed to
power [cfr-metrics.com](https://cfr-metrics.com), from scratch:

**`URL_ROOT`**: Locally this will be `http://localhost:8090`. For production it is `https://cfr-metrics.com`.
**`TOKEN`**: This value is set by the `ECFR_ADMIN_TOKEN` environment variable.

### Step 1: Import Agencies

To download and save all agencies, run:

```
curl -X POST -H 'Authorization: Bearer TOKEN' 'URL_ROOT/ecfr-service/import-agencies'
```

### Step 2: Import Titles

To download and save all current titles, run:

```
curl -X POST -H 'Authorization: Bearer TOKEN' 'URL_ROOT/ecfr-service/import-titles'
```

### Step 3: Compute Title Metrics

To process titles and compute metrics, run:

```
curl -X POST -H 'Authorization: Bearer TOKEN' 'URL_ROOT/ecfr-service/compute/title-metrics'
```

### Step 4: Compute Agency Metrics

To process metrics for all agencies, run:

```
curl -X POST -H 'Authorization: Bearer TOKEN' 'URL_ROOT/ecfr-service/compute/agency-metrics'
```

### Step 5: Compute Sub-Agency Metrics

To process metrics for all sub-agencies, run:

```
curl -X POST -H 'Authorization: Bearer TOKEN' 'URL_ROOT/ecfr-service/compute/sub-agency-metrics'
```

These 5 steps will generate all of the data needed to power the UI with constant lookup times.

## Development Setup

The following technologies are required:

* Go 1.21+
* Postgres 17
* Node 22

### Environment Variables

```
export ECFR_ADMIN_TOKEN="any token or UUID"
export ECFR_DB_USER="ecfr-app"
export ECFR_DB_PASS=""
export ECFR_DB_HOST="localhost"
export ECFR_DB_PORT="5432"
export ECFR_DB_NAME="ecfr"
export ECFR_DB_INSTANCE_CONNECTION_NAME=""
export ECFR_DEVELOPMENT="true"
```

### Setup Database

1. `createuser ecfr-app`
2. `createdb ecfr`
3. `psql ecfr`
4. `grant all privileges on database ecfr to "ecfr-app";`
5. `grant all on schema public TO "ecfr-app";`
6. Run statements
   in [ecfr_analyzer.sql](https://github.com/sam-berry/ecfr-analyzer/blob/main/server/sql/ecfr_analyzer.sql)

### Run Server

1. `cd /server`
2. `go run server.go`

### Run UI

1. `cd /ui`
2. `npm install`
3. `npm run dev`

## Find Agencies That Are Missing Computed Values

When computing agency metrics, it can be useful to run the following query to see if any agencies were missed. EPA,
Treasury, and Agriculture occasionally timeout and should be checked with this.

```
SELECT a.slug, cv.id
FROM agency a
         LEFT JOIN computed_value cv ON cv.key = CONCAT('agency-metrics__', a.agencyId)
WHERE cv.id IS NULL;
```

Failed agencies can be run individually, or in bulk via the [`import-specific-agencies.sh`](https://github.com/sam-berry/ecfr-analyzer/blob/main/server/scripts/import-specific-agencies.sh) script.

## Areas for Improvement

* Precompute text values for title XML. Write a job to parse the entire CFR and save
  chapters/parts/sections/etc as structured data that can be easily queried. Do not need XLST for
  this, can be done by iterating through the tree and following the DIV# guidelines.
* Create common Goroutine runner that encapsulates the channel and wait group processing, as it is
  similar throughout the project
* Subagencies metric import - this was an experiment that ended up working, but it could be handled cleaner
  instead of passing the `onlySubAgencies` variable and forking the top-level logic
* Import historical CFR records and compute metrics based on changes over time
