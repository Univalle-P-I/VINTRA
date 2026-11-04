BEGIN;

INSERT INTO microroute (id, macroroute_id, name, geom) VALUES
    (
        '00000000-0000-4000-8000-000000000802',
        '00000000-0000-4000-8000-000000000801',
        'El Jorge - Bajo Firme',
        ST_GeomFromText('MULTILINESTRING((-77.06 3.88, -77.05 3.89, -77.04 3.90), (-77.04 3.90, -77.03 3.91))', 4326)
    )
ON CONFLICT DO NOTHING;

COMMIT;
