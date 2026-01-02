-- Run this in your Neon SQL Editor to create the necessary table

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    type VARCHAR(10) DEFAULT 'text', -- 'text' or 'audio'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
