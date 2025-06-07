-- Test SQL file with Nunjucks includes
SELECT 
    id,
    name,
    email
FROM users
WHERE 
    created_at > '{{ start_date }}'
    AND status = '{{ user_status }}'
ORDER BY created_at DESC
LIMIT {{ limit }}; 