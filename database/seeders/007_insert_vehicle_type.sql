BEGIN;

INSERT INTO vehicle_type (code, name) VALUES
    ('12YD', 'Camión de 12 yardas cúbicas'),
    ('7YD', 'Camión de 7 yardas cúbicas'),
    ('STAKE', 'Camioneta de estacas')
ON CONFLICT DO NOTHING;

COMMIT;
