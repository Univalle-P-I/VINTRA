BEGIN;

CREATE TABLE user_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_status_id UUID NOT NULL,
    document_type_id UUID NOT NULL,
    document_id VARCHAR(20) NOT NULL,
    pwd_hash TEXT NOT NULL,
    failed_attempts SMALLINT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_account_user_status FOREIGN KEY (user_status_id) REFERENCES user_status (id),
    CONSTRAINT fk_user_account_document_type FOREIGN KEY (document_type_id) REFERENCES document_type (id),
    CONSTRAINT uq_user_account_document UNIQUE (document_type_id, document_id),
    CONSTRAINT ck_user_account_failed_attempts CHECK (failed_attempts >= 0)
);

CREATE INDEX idx_user_account_user_status_id ON user_account (user_status_id);
CREATE INDEX idx_user_account_document_type_id ON user_account (document_type_id);

COMMIT;
