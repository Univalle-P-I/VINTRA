BEGIN;

CREATE TABLE microroute_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microroute_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    day_of_week SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_microroute_schedule_microroute FOREIGN KEY (microroute_id) REFERENCES microroute (id),
    CONSTRAINT fk_microroute_schedule_schedule FOREIGN KEY (schedule_id) REFERENCES schedule (id),
    CONSTRAINT uq_microroute_schedule UNIQUE (microroute_id, schedule_id, day_of_week),
    CONSTRAINT ck_microroute_schedule_day_of_week CHECK (day_of_week BETWEEN 1 AND 7)
);

CREATE INDEX idx_microroute_schedule_microroute_id ON microroute_schedule (microroute_id);
CREATE INDEX idx_microroute_schedule_schedule_id ON microroute_schedule (schedule_id);

COMMIT;
