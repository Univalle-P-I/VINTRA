BEGIN;

INSERT INTO document_type (code, name) VALUES
    ('CC', 'Cédula de ciudadanía')
ON CONFLICT DO NOTHING;

COMMIT;
