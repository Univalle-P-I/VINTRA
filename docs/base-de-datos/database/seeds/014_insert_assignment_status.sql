BEGIN;

INSERT INTO assignment_status (code, name) VALUES
    ('SCHEDULED', 'Programada'),
    ('IN_PROGRESS', 'En curso'),
    ('COMPLETED', 'Completada'),
    ('CANCELLED', 'Cancelada')
ON CONFLICT DO NOTHING;

COMMIT;
