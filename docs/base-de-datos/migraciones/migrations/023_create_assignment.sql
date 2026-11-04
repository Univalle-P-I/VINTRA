BEGIN;

CREATE TABLE assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL,
    microroute_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    assignment_status_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_assignment_crew FOREIGN KEY (crew_id) REFERENCES crew (id),
    CONSTRAINT fk_assignment_microroute FOREIGN KEY (microroute_id) REFERENCES microroute (id),
    CONSTRAINT fk_assignment_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle (id),
    CONSTRAINT fk_assignment_assignment_status FOREIGN KEY (assignment_status_id) REFERENCES assignment_status (id),
    CONSTRAINT uq_assignment_microroute_date UNIQUE (microroute_id, scheduled_date),
    CONSTRAINT ck_assignment_dates CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_assignment_crew_id ON assignment (crew_id);
CREATE INDEX idx_assignment_microroute_id ON assignment (microroute_id);
CREATE INDEX idx_assignment_vehicle_id ON assignment (vehicle_id);
CREATE INDEX idx_assignment_assignment_status_id ON assignment (assignment_status_id);
CREATE INDEX idx_assignment_scheduled_date ON assignment (scheduled_date);

COMMIT;
