BEGIN;

CREATE TABLE driver_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old_values JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_driver_log_driver FOREIGN KEY (entity_id) REFERENCES driver (id),
    CONSTRAINT fk_driver_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_driver_log_entity_id ON driver_log (entity_id);
CREATE INDEX idx_driver_log_actor_id ON driver_log (actor_id);
CREATE INDEX idx_driver_log_created_at ON driver_log (created_at);

COMMIT;
