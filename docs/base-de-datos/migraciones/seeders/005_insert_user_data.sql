BEGIN;

INSERT INTO user_data (id, first_name, last_name, email, phone) VALUES
    ('00000000-0000-4000-8000-000000000001', 'Administrador', 'VINTRA', NULL NULL),
    ('00000000-0000-4000-8000-000000000002', 'Jose Roberto', 'Gómez Palacios', NULL, NULL),
    ('00000000-0000-4000-8000-000000000003', 'Manuel', 'Zapata Olivella', NULL, NULL)
ON CONFLICT DO NOTHING;

COMMIT;
