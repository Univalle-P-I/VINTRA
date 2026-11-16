BEGIN;

CREATE TABLE password_reset_token_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_password_reset_token_log_password_reset_token FOREIGN KEY (entity_id) REFERENCES password_reset_token (id) ON DELETE CASCADE,
    CONSTRAINT fk_password_reset_token_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_token_log_entity_id ON password_reset_token_log (entity_id);
CREATE INDEX idx_password_reset_token_log_actor_id ON password_reset_token_log (actor_id);
CREATE INDEX idx_password_reset_token_log_created_at ON password_reset_token_log (created_at);

COMMIT;
