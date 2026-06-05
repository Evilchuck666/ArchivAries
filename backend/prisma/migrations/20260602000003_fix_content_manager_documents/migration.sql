UPDATE "role_permissions"
SET "granted" = false
WHERE
        "role" = 'CONTENT_MANAGER'
    AND "permission" IN (
            'documents.create'
        ,   'documents.delete'
        ,   'documents.edit'
        ,   'documents.read_restricted'
    );
