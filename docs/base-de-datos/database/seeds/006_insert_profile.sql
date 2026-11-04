BEGIN;

INSERT INTO profile (id, user_role_id, user_account_id) VALUES
    (
        '00000000-0000-4000-8000-000000000101',
        (SELECT id FROM user_role WHERE code = 'ADMIN'),
        '00000000-0000-4000-8000-000000000001'
    ),
    (
        '00000000-0000-4000-8000-000000000102',
        (SELECT id FROM user_role WHERE code = 'OP'),
        '00000000-0000-4000-8000-000000000002'
    ),
    (
        '00000000-0000-4000-8000-000000000103',
        (SELECT id FROM user_role WHERE code = 'DRIVER'),
        '00000000-0000-4000-8000-000000000003'
    )
ON CONFLICT DO NOTHING;

COMMIT;
