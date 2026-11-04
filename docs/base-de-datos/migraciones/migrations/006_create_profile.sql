BEGIN;

CREATE TABLE profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role_id UUID NOT NULL,
    user_account_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_profile_user_role FOREIGN KEY (user_role_id) REFERENCES user_role (id),
    CONSTRAINT fk_profile_user_account FOREIGN KEY (user_account_id) REFERENCES user_account (id),
    CONSTRAINT uq_profile_account_role UNIQUE (user_account_id, user_role_id)
);

CREATE INDEX idx_profile_user_role_id ON profile (user_role_id);
CREATE INDEX idx_profile_user_account_id ON profile (user_account_id);

COMMIT;
