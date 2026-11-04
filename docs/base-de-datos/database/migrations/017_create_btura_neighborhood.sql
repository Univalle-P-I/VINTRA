BEGIN;

CREATE TABLE btura_neighborhood (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commune VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    geom geometry(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_btura_neighborhood_geom ON btura_neighborhood USING GIST (geom);

COMMIT;
