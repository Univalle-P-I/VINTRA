BEGIN;

CREATE TABLE microroute_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_microroute_log_microroute FOREIGN KEY (entity_id) REFERENCES microroute (id),
    CONSTRAINT fk_microroute_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_microroute_log_entity_id ON microroute_log (entity_id);
CREATE INDEX idx_microroute_log_actor_id ON microroute_log (actor_id);
CREATE INDEX idx_microroute_log_created_at ON microroute_log (created_at);

COMMIT;
