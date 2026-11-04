BEGIN;

INSERT INTO btura_neighborhood (id, commune, name, geom) VALUES
    (
        '00000000-0000-4000-8000-000000000901',
        'Comuna 1',
        'El Jorge',
        ST_GeomFromText('MULTIPOLYGON(((-77.07 3.87, -77.05 3.87, -77.05 3.89, -77.07 3.89, -77.07 3.87)))', 4326)
    ),
    (
        '00000000-0000-4000-8000-000000000902',
        'Comuna 1',
        'El Firme',
        ST_GeomFromText('MULTIPOLYGON(((-77.05 3.89, -77.03 3.89, -77.03 3.91, -77.05 3.91, -77.05 3.89)))', 4326)
    )
ON CONFLICT DO NOTHING;

COMMIT;
