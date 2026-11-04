BEGIN;

INSERT INTO vehicle_status (code, name) VALUES
    ('AVAILABLE', 'Disponible'),
    ('IN_USE', 'En uso'),
    ('MAINTENANCE', 'En mantenimiento'),
    ('OUT_OF_SERVICE', 'Fuera de servicio')
ON CONFLICT DO NOTHING;

COMMIT;
