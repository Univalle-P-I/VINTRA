BEGIN;

DO $$
BEGIN
    CREATE TYPE assignment_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    microroute_schedule_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    assignment_status assignment_status NOT NULL,
    scheduled_start_at TIMESTAMPTZ NOT NULL,
    scheduled_end_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_assignment_driver FOREIGN KEY (driver_id) REFERENCES driver (id),
    CONSTRAINT fk_assignment_microroute_schedule FOREIGN KEY (microroute_schedule_id) REFERENCES microroute_schedule (id),
    CONSTRAINT fk_assignment_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle (id),
    CONSTRAINT uq_assignment_schedule_start UNIQUE (microroute_schedule_id, scheduled_start_at),
    CONSTRAINT ck_assignment_scheduled_range CHECK (scheduled_end_at >= scheduled_start_at),
    CONSTRAINT ck_assignment_actual_range CHECK (ended_at IS NULL OR (started_at IS NOT NULL AND ended_at >= started_at))
);

CREATE INDEX idx_assignment_driver_id ON assignment (driver_id);
CREATE INDEX idx_assignment_microroute_schedule_id ON assignment (microroute_schedule_id);
CREATE INDEX idx_assignment_vehicle_id ON assignment (vehicle_id);
CREATE INDEX idx_assignment_scheduled_start_at ON assignment (scheduled_start_at);

COMMIT;
