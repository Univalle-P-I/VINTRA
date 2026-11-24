BEGIN;

CREATE TABLE driver (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL,
    crew_id UUID,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_driver_user_account FOREIGN KEY (user_account_id) REFERENCES user_account (id) ON DELETE CASCADE,
    CONSTRAINT fk_driver_crew FOREIGN KEY (crew_id) REFERENCES crew (id) ON DELETE CASCADE,
    CONSTRAINT ck_driver_dates CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_driver_user_account_id ON driver (user_account_id);
CREATE INDEX idx_driver_crew_id ON driver (crew_id);

COMMIT;
