CREATE TABLE agency
(
    id               SERIAL PRIMARY KEY,
    agencyId         UUID UNIQUE NOT NULL,
    name             TEXT        NOT NULL,
    shortName        TEXT        NOT NULL,
    displayName      TEXT        NOT NULL,
    sortableName     TEXT        NOT NULL,
    slug             TEXT UNIQUE NOT NULL,
    children         JSONB       NOT NULL,
    cfrReferences    JSONB       NOT NULL,
    createdTimestamp TIMESTAMP   NOT NULL
);

CREATE TABLE title
(
    id               SERIAL PRIMARY KEY,
    titleId          UUID UNIQUE    NOT NULL,
    name             INTEGER UNIQUE NOT NULL,
    content          XML            NOT NULL,
    createdTimestamp TIMESTAMP      NOT NULL
);

CREATE TABLE computed_value
(
    id               SERIAL PRIMARY KEY,
    valueId          UUID UNIQUE NOT NULL,
    key              TEXT UNIQUE NOT NULL,
    data             JSONB       NOT NULL,
    createdTimestamp TIMESTAMP   NOT NULL
);