BEGIN;

INSERT INTO user_account (id, user_status, document_type, document_id, pwd_hash, first_name, last_name) VALUES
    (
        '00000000-0000-4000-8000-000000000001',
        'ACTIVE',
        'CC',
        'admin',
        '$argon2id$v=19$m=16,t=2,p=1$NDUxMzEzMTI1Mw$eNVznf8stOz5NgTVq661sg',
        'ADONY',
        'PEREA'
    ),
    (
        '00000000-0000-4000-8000-000000000002',
        'ACTIVE',
        'CC',
        '101',
        '$argon2id$v=19$m=16,t=2,p=1$NDUxMzEzMTI1Mw$eNVznf8stOz5NgTVq661sg',
        'WAINER',
        'ARROYO'
    ),
    (
        '00000000-0000-4000-8000-000000000003',
        'ACTIVE',
        'CC',
        '102',
        '$argon2id$v=19$m=16,t=2,p=1$NDUxMzEzMTI1Mw$eNVznf8stOz5NgTVq661sg',
        'FARID',
        'CUERO'
    )
ON CONFLICT DO NOTHING;

COMMIT;
