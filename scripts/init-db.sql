-- PostgreSQL Database Initialization Script for Quotation Tool

-- Create the database if it doesn't exist
-- (This is handled by the POSTGRES_DB environment variable)

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'approved', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE quotation_tool TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- Log successful initialization
SELECT 'Database initialization completed successfully' as status;
