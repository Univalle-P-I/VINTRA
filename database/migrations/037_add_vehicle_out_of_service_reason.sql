BEGIN;

ALTER TABLE vehicle
    ADD COLUMN IF NOT EXISTS out_of_service_reason VARCHAR(500);

COMMIT;
