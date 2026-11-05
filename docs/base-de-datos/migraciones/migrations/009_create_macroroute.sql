BEGIN;

CREATE TABLE macroroute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(120) NOT NULL,
    geom GEOMETRY(MULTILINESTRING, 4326) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_macroroute_code UNIQUE (code)
);

CREATE INDEX idx_macroroute_geom ON macroroute USING GIST (geom);

COMMIT;
