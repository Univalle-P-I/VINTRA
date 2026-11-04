BEGIN;

INSERT INTO macroroute (id, name, geom) VALUES
    (
        '00000000-0000-4000-8000-000000000801',
        'Isla del Cascajal ejemplo',
        ST_GeomFromText('MULTIPOLYGON(((-77.10 3.85, -77.00 3.85, -77.00 3.95, -77.10 3.95, -77.10 3.85)))', 4326)
    )
ON CONFLICT DO NOTHING;

COMMIT;
