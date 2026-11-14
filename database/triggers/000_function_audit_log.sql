BEGIN;

CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_action audit_action;
    v_entity_id UUID;
    v_old JSONB;
    v_new JSONB;
    v_actor_id UUID;
    v_request_ip INET;
BEGIN
    v_action := CASE TG_OP
        WHEN 'INSERT' THEN 'CREATE'::audit_action
        WHEN 'UPDATE' THEN 'UPDATE'::audit_action
        WHEN 'DELETE' THEN 'DELETE'::audit_action
    END;

    IF TG_OP = 'UPDATE'
        AND (to_jsonb(OLD) ->> 'is_active')::boolean IS DISTINCT FROM (to_jsonb(NEW) ->> 'is_active')::boolean
        AND (to_jsonb(NEW) ->> 'is_active')::boolean IS FALSE THEN
        v_action := 'DELETE'::audit_action;
    END IF;

    IF TG_OP = 'DELETE' THEN
        v_entity_id := OLD.id;
        v_old := to_jsonb(OLD);
        v_new := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_entity_id := NEW.id;
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSE
        v_entity_id := NEW.id;
        v_old := NULL;
        v_new := to_jsonb(NEW);
    END IF;

    IF TG_TABLE_NAME = 'user_account' THEN
        v_old := v_old - 'pwd_hash' - 'document_id';
        v_new := v_new - 'pwd_hash' - 'document_id';
    END IF;

    v_actor_id := NULLIF(current_setting('app.current_user_id', true), '')::uuid;
    v_request_ip := NULLIF(current_setting('app.request_ip', true), '')::inet;

    EXECUTE format(
        'INSERT INTO %I.%I (entity_id, actor_id, action, "old", "new", request_ip) VALUES ($1, $2, $3, $4, $5, $6)',
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME || '_log'
    ) USING v_entity_id, v_actor_id, v_action, v_old, v_new, v_request_ip;

    RETURN NULL;
END;
$$;

COMMIT;
