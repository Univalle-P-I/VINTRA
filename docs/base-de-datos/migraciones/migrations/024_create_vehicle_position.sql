BEGIN;

CREATE TABLE vehicle_position (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_vehicle_position_assignment FOREIGN KEY (assignment_id) REFERENCES assignment (id)
);

CREATE INDEX idx_vehicle_position_assignment_id ON vehicle_position (assignment_id);
CREATE INDEX idx_vehicle_position_geom ON vehicle_position USING GIST (geom);
CREATE INDEX idx_vehicle_position_recorded_at ON vehicle_position (recorded_at);

COMMIT;
