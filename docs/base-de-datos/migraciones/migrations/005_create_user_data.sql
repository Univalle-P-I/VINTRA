BEGIN;

CREATE TABLE user_data (
    id UUID PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(10),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_user_data_user_account FOREIGN KEY (id) REFERENCES user_account (id),
    CONSTRAINT uq_user_data_email UNIQUE (email)
    CONSTRAINT uq_user_data_phone UNIQUE (phone)
);

COMMIT;
