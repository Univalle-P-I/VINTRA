BEGIN;

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_user_account_updated_at
BEFORE UPDATE ON user_account
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_user_data_updated_at
BEFORE UPDATE ON user_data
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_vehicle_updated_at
BEFORE UPDATE ON vehicle
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_macroroute_updated_at
BEFORE UPDATE ON macroroute
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_microroute_updated_at
BEFORE UPDATE ON microroute
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_btura_neighborhood_updated_at
BEFORE UPDATE ON btura_neighborhood
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_schedule_updated_at
BEFORE UPDATE ON schedule
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_microroute_schedule_updated_at
BEFORE UPDATE ON microroute_schedule
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_crew_updated_at
BEFORE UPDATE ON crew
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_crew_member_updated_at
BEFORE UPDATE ON crew_member
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_driver_updated_at
BEFORE UPDATE ON driver
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_assignment_updated_at
BEFORE UPDATE ON assignment
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

COMMIT;
