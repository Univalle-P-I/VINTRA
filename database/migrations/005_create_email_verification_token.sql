BEGIN;

CREATE TABLE email_verification_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL,
    email VARCHAR(254) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    request_ip INET,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_email_verification_token_user_account FOREIGN KEY (user_account_id) REFERENCES user_account (id) ON DELETE CASCADE,
    CONSTRAINT uq_email_verification_token_hash UNIQUE (token_hash),
    CONSTRAINT ck_email_verification_token_expires_at CHECK (expires_at > created_at)
);

CREATE INDEX idx_email_verification_token_user_account_id ON email_verification_token (user_account_id);
CREATE INDEX idx_email_verification_token_expires_at ON email_verification_token (expires_at);

COMMIT;
