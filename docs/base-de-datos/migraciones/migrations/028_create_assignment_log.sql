BEGIN;

CREATE TABLE assignment_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old_values JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_assignment_log_assignment FOREIGN KEY (entity_id) REFERENCES assignment (id),
    CONSTRAINT fk_assignment_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_assignment_log_entity_id ON assignment_log (entity_id);
CREATE INDEX idx_assignment_log_actor_id ON assignment_log (actor_id);
CREATE INDEX idx_assignment_log_created_at ON assignment_log (created_at);

COMMIT;
