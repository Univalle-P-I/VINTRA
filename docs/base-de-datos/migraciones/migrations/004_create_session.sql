BEGIN;

CREATE TABLE session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL,
    token_hash CHAR(64) NOT NULL,
    request_ip INET NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_session_user_account FOREIGN KEY (user_account_id) REFERENCES user_account (id),
    CONSTRAINT uq_session_token_hash UNIQUE (token_hash),
    CONSTRAINT ck_session_expires_at CHECK (expires_at > created_at)
);

CREATE INDEX idx_session_user_account_id ON session (user_account_id);
CREATE INDEX idx_session_expires_at ON session (expires_at);

COMMIT;
