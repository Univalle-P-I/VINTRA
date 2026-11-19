BEGIN;

CREATE TABLE email_validation_token_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_email_validation_token_log_email_validation_token FOREIGN KEY (entity_id) REFERENCES email_validation_token (id) ON DELETE SET NULL,
    CONSTRAINT fk_email_validation_token_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id) ON DELETE SET NULL
);

CREATE INDEX idx_email_validation_token_log_entity_id ON email_validation_token_log (entity_id);
CREATE INDEX idx_email_validation_token_log_actor_id ON email_validation_token_log (actor_id);
CREATE INDEX idx_email_validation_token_log_created_at ON email_validation_token_log (created_at);

COMMIT;
