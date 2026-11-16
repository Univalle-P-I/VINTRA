BEGIN;

CREATE TABLE microroute_neighborhood_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_microroute_neighborhood_log_microroute_neighborhood FOREIGN KEY (entity_id) REFERENCES microroute_neighborhood (id),
    CONSTRAINT fk_microroute_neighborhood_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_microroute_neighborhood_log_entity_id ON microroute_neighborhood_log (entity_id);
CREATE INDEX idx_microroute_neighborhood_log_actor_id ON microroute_neighborhood_log (actor_id);
CREATE INDEX idx_microroute_neighborhood_log_created_at ON microroute_neighborhood_log (created_at);

COMMIT;
