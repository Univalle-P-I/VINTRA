BEGIN;

CREATE TABLE crew_member_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    actor_id UUID,
    action audit_action NOT NULL,
    old JSONB,
    new JSONB,
    request_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_crew_member_log_crew_member FOREIGN KEY (entity_id) REFERENCES crew_member (id),
    CONSTRAINT fk_crew_member_log_actor FOREIGN KEY (actor_id) REFERENCES user_account (id)
);

CREATE INDEX idx_crew_member_log_entity_id ON crew_member_log (entity_id);
CREATE INDEX idx_crew_member_log_actor_id ON crew_member_log (actor_id);
CREATE INDEX idx_crew_member_log_created_at ON crew_member_log (created_at);

COMMIT;
