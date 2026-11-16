BEGIN;

CREATE TABLE assignment_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_assignment_log_assignment FOREIGN KEY (entity_id) REFERENCES assignment (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id) ON DELETE CASCADE
);

CREATE INDEX idx_assignment_log_entity_id ON assignment_log (entity_id);
CREATE INDEX idx_assignment_log_actor_id ON assignment_log (actor_id);
CREATE INDEX idx_assignment_log_created_at ON assignment_log (created_at);

COMMIT;
