BEGIN;

CREATE OR REPLACE TRIGGER trg_password_reset_token_audit
AFTER INSERT OR UPDATE OR DELETE ON password_reset_token
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

COMMIT;
