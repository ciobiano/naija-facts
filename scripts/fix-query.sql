-- The query in the script should be updated to:
INSERT INTO documents (content, source, embedding) 
VALUES ($1, $2, $3) 
ON CONFLICT (source, content) DO NOTHING