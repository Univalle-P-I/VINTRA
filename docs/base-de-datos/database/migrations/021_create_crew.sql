BEGIN;

CREATE TABLE crew (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_data_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_crew_user_data FOREIGN KEY (user_data_id) REFERENCES user_data (id),
    CONSTRAINT uq_crew_user_data UNIQUE (user_data_id)
);

CREATE INDEX idx_crew_user_data_id ON crew (user_data_id);

COMMIT;
