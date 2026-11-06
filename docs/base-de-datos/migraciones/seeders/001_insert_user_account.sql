BEGIN;

INSERT INTO user_account (id, user_status, document_type, document_id, pwd_hash) VALUES
    (
        '00000000-0000-4000-8000-000000000001',
        'ACTIVE',
        'CC',
        'admin',
        '$argon2id$v=19$m=16,t=2,p=1$cXdlcnR5dWlvcA$yWEMxe5JSk2/rYoKDB9tOA'
    ),
    (
        '00000000-0000-4000-8000-000000000002',
        'ACTIVE',
        'CC',
        '101',
        '$argon2id$v=19$m=16,t=2,p=1$cXdlcnR5dWlvcA$yWEMxe5JSk2/rYoKDB9tOA'
    ),
    (
        '00000000-0000-4000-8000-000000000003',
        'ACTIVE',
        'CC',
        '102',
        '$argon2id$v=19$m=16,t=2,p=1$cXdlcnR5dWlvcA$yWEMxe5JSk2/rYoKDB9tOA'
    )
ON CONFLICT DO NOTHING;

COMMIT;
