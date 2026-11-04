BEGIN;

CREATE TABLE microroute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    macroroute_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    geom geometry(MultiLineString, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_microroute_macroroute FOREIGN KEY (macroroute_id) REFERENCES macroroute (id)
);

CREATE INDEX idx_microroute_macroroute_id ON microroute (macroroute_id);
CREATE INDEX idx_microroute_geom ON microroute USING GIST (geom);

COMMIT;
