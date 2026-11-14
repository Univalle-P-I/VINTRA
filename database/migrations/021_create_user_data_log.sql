BEGIN;

CREATE TABLE user_data_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_data_log_user_data FOREIGN KEY (entity_id) REFERENCES user_data (id),
    CONSTRAINT fk_user_data_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_user_data_log_entity_id ON user_data_log (entity_id);
CREATE INDEX idx_user_data_log_actor_id ON user_data_log (actor_id);
CREATE INDEX idx_user_data_log_created_at ON user_data_log (created_at);

COMMIT;
