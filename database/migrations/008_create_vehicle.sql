BEGIN;

DO $$
BEGIN
    CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE vehicle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_type_id UUID NOT NULL,
    vehicle_status vehicle_status NOT NULL,
    plate CHAR(6) NOT NULL,
    capacity_kg NUMERIC NOT NULL,
    capacity_yd3 NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_vehicle_vehicle_type FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_type (id),
    CONSTRAINT uq_vehicle_plate UNIQUE (plate),
    CONSTRAINT ck_vehicle_capacity_kg CHECK (capacity_kg >= 0),
    CONSTRAINT ck_vehicle_capacity_yd3 CHECK (capacity_yd3 >= 0)
);

CREATE INDEX idx_vehicle_vehicle_type_id ON vehicle (vehicle_type_id);

COMMIT;
