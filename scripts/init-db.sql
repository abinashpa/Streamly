-- Streamly Database Initialization Script
-- Creates individual databases for microservices to enforce database-per-service isolation

CREATE DATABASE streamly_users;
CREATE DATABASE streamly_media;
CREATE DATABASE streamly_catalog;
CREATE DATABASE streamly_frontend;

GRANT ALL PRIVILEGES ON DATABASE streamly_users TO streamly;
GRANT ALL PRIVILEGES ON DATABASE streamly_media TO streamly;
GRANT ALL PRIVILEGES ON DATABASE streamly_catalog TO streamly;
GRANT ALL PRIVILEGES ON DATABASE streamly_frontend TO streamly;
