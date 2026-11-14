BEGIN;

DO $$
BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'OP', 'DRIVER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL,
    user_role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_profile_user_account FOREIGN KEY (user_account_id) REFERENCES user_account (id),
    CONSTRAINT uq_profile_account_role UNIQUE (user_account_id, user_role)
);

CREATE INDEX idx_profile_user_account_id ON profile (user_account_id);

COMMIT;
