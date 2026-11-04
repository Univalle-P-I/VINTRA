BEGIN;

INSERT INTO user_status (code, name) VALUES
    ('ACTIVE', 'Activo'),
    ('INACTIVE', 'Inactivo'),
    ('LOCKED', 'Bloqueado'),
    ('PENDING_VERIFICATION', 'Pendiente de verificación')
ON CONFLICT DO NOTHING;

COMMIT;
