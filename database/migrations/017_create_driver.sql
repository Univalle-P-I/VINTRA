BEGIN;

CREATE TABLE driver (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_data_id UUID NOT NULL,
    crew_id UUID,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_driver_user_data FOREIGN KEY (user_data_id) REFERENCES user_data (id),
    CONSTRAINT fk_driver_crew FOREIGN KEY (crew_id) REFERENCES crew (id),
    CONSTRAINT ck_driver_dates CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_driver_user_data_id ON driver (user_data_id);
CREATE INDEX idx_driver_crew_id ON driver (crew_id);

COMMIT;
