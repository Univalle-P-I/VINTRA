BEGIN;

CREATE TABLE vehicle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_status_id UUID NOT NULL,
    vehicle_type_id UUID NOT NULL,
    plate CHAR(6) NOT NULL,
    capacity_kg NUMERIC NOT NULL,
    capacity_yd3 NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_vehicle_vehicle_status FOREIGN KEY (vehicle_status_id) REFERENCES vehicle_status (id),
    CONSTRAINT fk_vehicle_vehicle_type FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_type (id),
    CONSTRAINT uq_vehicle_plate UNIQUE (plate),
    CONSTRAINT ck_vehicle_capacity_kg CHECK (capacity_kg >= 0),
    CONSTRAINT ck_vehicle_capacity_yd3 CHECK (capacity_yd3 >= 0)
);

CREATE INDEX idx_vehicle_vehicle_status_id ON vehicle (vehicle_status_id);
CREATE INDEX idx_vehicle_vehicle_type_id ON vehicle (vehicle_type_id);

COMMIT;
