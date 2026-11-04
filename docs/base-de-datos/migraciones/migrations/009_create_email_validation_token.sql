BEGIN;

CREATE TABLE email_validation_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL,
    email VARCHAR(254) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    request_ip INET,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_email_validation_token_user_account FOREIGN KEY (user_account_id) REFERENCES user_account (id),
    CONSTRAINT uq_email_validation_token_hash UNIQUE (token_hash),
    CONSTRAINT ck_email_validation_token_hash CHECK (token_hash ~ '^[0-9a-fA-F]{64}$')
);

CREATE INDEX idx_email_validation_token_user_account_id ON email_validation_token (user_account_id);
CREATE INDEX idx_email_validation_token_expires_at ON email_validation_token (expires_at);

COMMIT;
