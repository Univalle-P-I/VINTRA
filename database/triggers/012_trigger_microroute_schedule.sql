BEGIN;

CREATE OR REPLACE TRIGGER trg_microroute_schedule_audit
AFTER INSERT OR UPDATE OR DELETE ON microroute_schedule
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

COMMIT;
