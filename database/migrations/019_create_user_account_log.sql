BEGIN;

DO $$
BEGIN
    CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'SOFT_DELETE', 'DELETE', 'RESTORE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE user_account_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_account_log_user_account FOREIGN KEY (entity_id) REFERENCES user_account (id) ON DELETE SET NULL,
    CONSTRAINT fk_user_account_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id) ON DELETE SET NULL
);

CREATE INDEX idx_user_account_log_entity_id ON user_account_log (entity_id);
CREATE INDEX idx_user_account_log_actor_id ON user_account_log (actor_id);
CREATE INDEX idx_user_account_log_created_at ON user_account_log (created_at);

COMMIT;
