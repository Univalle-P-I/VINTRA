BEGIN;

CREATE TABLE microroute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    macroroute_id UUID NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(120) NOT NULL,
    geom GEOMETRY(MULTILINESTRING, 4326) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_microroute_macroroute FOREIGN KEY (macroroute_id) REFERENCES macroroute (id),
    CONSTRAINT uq_microroute_code UNIQUE (code)
);

CREATE INDEX idx_microroute_macroroute_id ON microroute (macroroute_id);
CREATE INDEX idx_microroute_geom ON microroute USING GIST (geom);

COMMIT;
