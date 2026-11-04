BEGIN;

INSERT INTO assignment (id, crew_id, microroute_id, vehicle_id, assignment_status_id, scheduled_date, started_at) VALUES
    (
        '00000000-0000-4000-8000-000000000f01',
        '00000000-0000-4000-8000-000000000d01',
        '00000000-0000-4000-8000-000000000802',
        '00000000-0000-4000-8000-000000000701',
        (SELECT id FROM assignment_status WHERE code = 'SCHEDULED'),
        DATE '2026-24-11',
        now() - INTERVAL '1 hour'
    )
ON CONFLICT DO NOTHING;

COMMIT;
