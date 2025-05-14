-- Create documents table with required schema
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    embedding TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_content_source UNIQUE (source, content)
);

-- Create extension for vector operations if needed
CREATE EXTENSION IF NOT EXISTS vector;