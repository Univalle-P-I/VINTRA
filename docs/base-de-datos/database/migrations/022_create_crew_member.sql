BEGIN;

CREATE TABLE crew_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_crew_member_crew FOREIGN KEY (crew_id) REFERENCES crew (id)
);

CREATE INDEX idx_crew_member_crew_id ON crew_member (crew_id);

COMMIT;
