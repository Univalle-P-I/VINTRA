BEGIN;

CREATE TABLE session_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_session_log_session FOREIGN KEY (entity_id) REFERENCES session (id),
    CONSTRAINT fk_session_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_session_log_entity_id ON session_log (entity_id);
CREATE INDEX idx_session_log_actor_id ON session_log (actor_id);
CREATE INDEX idx_session_log_created_at ON session_log (created_at);

COMMIT;
