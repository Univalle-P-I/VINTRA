BEGIN;

CREATE TABLE microroute_schedule_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_microroute_schedule_log_microroute_schedule FOREIGN KEY (entity_id) REFERENCES microroute_schedule (id) ON DELETE SET NULL,
    CONSTRAINT fk_microroute_schedule_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id) ON DELETE SET NULL
);

CREATE INDEX idx_microroute_schedule_log_entity_id ON microroute_schedule_log (entity_id);
CREATE INDEX idx_microroute_schedule_log_actor_id ON microroute_schedule_log (actor_id);
CREATE INDEX idx_microroute_schedule_log_created_at ON microroute_schedule_log (created_at);

COMMIT;
