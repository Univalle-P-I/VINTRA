BEGIN;

DO $$
BEGIN
    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING_VERIFICATION');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    CREATE TYPE document_type_enum AS ENUM ('CC');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE user_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_status user_status_enum NOT NULL,
    document_type document_type_enum NOT NULL,
    document_id CHAR(20) NOT NULL,
    pwd_hash TEXT NOT NULL,
    failed_attempts SMALLINT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_account_document UNIQUE (document_type, document_id),
    CONSTRAINT ck_user_account_failed_attempts CHECK (failed_attempts >= 0)
);

COMMIT;
