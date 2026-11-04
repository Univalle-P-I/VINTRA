BEGIN;

INSERT INTO user_account (id, user_status_id, document_type_id, document_id, pwd_hash) VALUES
    (
        '00000000-0000-4000-8000-000000000001',
        (SELECT id FROM user_status WHERE code = 'ACTIVE'),
        (SELECT id FROM document_type WHERE code = 'CC'),
        'admin',
        '$argon2id$v=19$m=16,t=2,p=1$cXdlcnR5dWlvcA$yWEMxe5JSk2/rYoKDB9tOA'
    ),
    (
        '00000000-0000-4000-8000-000000000002',
        (SELECT id FROM user_status WHERE code = 'ACTIVE'),
        (SELECT id FROM document_type WHERE code = 'CC'),
        '101',
        '$argon2id$v=19$m=16,t=2,p=1$cXdlcnR5dWlvcA$yWEMxe5JSk2/rYoKDB9tOA'
    ),
    (
        '00000000-0000-4000-8000-000000000003',
        (SELECT id FROM user_status WHERE code = 'ACTIVE'),
        (SELECT id FROM document_type WHERE code = 'CC'),
        '102',
        '$argon2id$v=19$m=16,t=2,p=1$cXdlcnR5dWlvcA$yWEMxe5JSk2/rYoKDB9tOA'
    )
ON CONFLICT DO NOTHING;

COMMIT;
