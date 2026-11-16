BEGIN;

CREATE OR REPLACE TRIGGER trg_microroute_neighborhood_audit
AFTER INSERT OR UPDATE OR DELETE ON microroute_neighborhood
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

COMMIT;
