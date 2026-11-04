BEGIN;

INSERT INTO vehicle (id, vehicle_status_id, vehicle_type_id, plate, capacity_kg, capacity_yd3) VALUES
    (
        '00000000-0000-4000-8000-000000000701',
        (SELECT id FROM vehicle_status WHERE code = 'AVAILABLE'),
        (SELECT id FROM vehicle_type WHERE code = '12YD'),
        'ABC123',
        12000,
        20
    )
ON CONFLICT DO NOTHING;

COMMIT;
