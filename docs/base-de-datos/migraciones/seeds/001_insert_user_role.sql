BEGIN;

INSERT INTO user_role (code, name) VALUES
    ('ADMIN', 'Administrador'),
    ('OP', 'Jefe de Operaciones'),
    ('DRIVER', 'Conductor')
ON CONFLICT DO NOTHING;

COMMIT;
