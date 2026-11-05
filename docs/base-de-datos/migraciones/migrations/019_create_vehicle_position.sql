BEGIN;

CREATE TABLE vehicle_position (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    geom GEOMETRY(POINT, 4326) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_vehicle_position_assignment FOREIGN KEY (assignment_id) REFERENCES assignment (id)
);

CREATE INDEX idx_vehicle_position_assignment_recorded ON vehicle_position (assignment_id, recorded_at);
CREATE INDEX idx_vehicle_position_geom ON vehicle_position USING GIST (geom);

COMMIT;
