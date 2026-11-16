BEGIN;

CREATE TABLE vehicle_position_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_vehicle_position_log_vehicle_position FOREIGN KEY (entity_id) REFERENCES vehicle_position (id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicle_position_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicle_position_log_entity_id ON vehicle_position_log (entity_id);
CREATE INDEX idx_vehicle_position_log_actor_id ON vehicle_position_log (actor_id);
CREATE INDEX idx_vehicle_position_log_created_at ON vehicle_position_log (created_at);

COMMIT;
