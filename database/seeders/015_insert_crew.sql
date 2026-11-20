BEGIN;

INSERT INTO crew (id, name) VALUES
    (
        '00000000-0000-4000-8000-000000000d01',
        'Cuadrilla del Cascajal'
    )
ON CONFLICT DO NOTHING;

COMMIT;
