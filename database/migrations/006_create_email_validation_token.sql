BEGIN;

CREATE TABLE email_validation_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_data_id UUID NOT NULL,
    email VARCHAR(254) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    request_ip INET,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_email_validation_token_user_data FOREIGN KEY (user_data_id) REFERENCES user_data (id),
    CONSTRAINT uq_email_validation_token_hash UNIQUE (token_hash),
    CONSTRAINT ck_email_validation_token_expires_at CHECK (expires_at > created_at)
);

CREATE INDEX idx_email_validation_token_user_data_id ON email_validation_token (user_data_id);
CREATE INDEX idx_email_validation_token_expires_at ON email_validation_token (expires_at);

COMMIT;
