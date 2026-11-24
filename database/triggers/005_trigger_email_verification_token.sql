BEGIN;

CREATE OR REPLACE TRIGGER trg_email_verification_token_audit
AFTER INSERT OR UPDATE OR DELETE ON email_verification_token
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

COMMIT;
