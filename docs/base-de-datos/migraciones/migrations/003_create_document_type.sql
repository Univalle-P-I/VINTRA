BEGIN;

CREATE TABLE document_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_document_type_code UNIQUE (code),
    CONSTRAINT uq_document_type_name UNIQUE (name)
);

COMMIT;
