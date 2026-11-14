BEGIN;

CREATE TABLE crew_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_crew_log_crew FOREIGN KEY (entity_id) REFERENCES crew (id),
    CONSTRAINT fk_crew_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_crew_log_entity_id ON crew_log (entity_id);
CREATE INDEX idx_crew_log_actor_id ON crew_log (actor_id);
CREATE INDEX idx_crew_log_created_at ON crew_log (created_at);

COMMIT;
