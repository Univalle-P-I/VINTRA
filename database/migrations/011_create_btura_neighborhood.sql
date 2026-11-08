BEGIN;

CREATE TABLE btura_neighborhood (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commune VARCHAR(80),
    name VARCHAR(120) NOT NULL,
    geom GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_btura_neighborhood_name ON btura_neighborhood (name);
CREATE INDEX idx_btura_neighborhood_geom ON btura_neighborhood USING GIST (geom);

COMMIT;
