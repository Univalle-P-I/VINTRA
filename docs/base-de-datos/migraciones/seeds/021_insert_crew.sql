BEGIN;

INSERT INTO crew (id, user_data_id, name) VALUES
    (
        '00000000-0000-4000-8000-000000000d01',
        '00000000-0000-4000-8000-000000000002',
        'Cuadrilla Centro'
    )
ON CONFLICT DO NOTHING;

COMMIT;
