-- Script de inicialización seguro para PostgreSQL
-- Este script se ejecuta automáticamente al iniciar el contenedor

-- Crea la base de datos si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = current_setting('POSTGRES_DB')) THEN
        EXECUTE format('CREATE DATABASE %I', current_setting('POSTGRES_DB'));
    END IF;
END
$$;

-- Crea el usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = current_setting('POSTGRES_USER')) THEN
        EXECUTE format('CREATE USER %I WITH PASSWORD %L SUPERUSER', 
                      current_setting('POSTGRES_USER'), 
                      current_setting('POSTGRES_PASSWORD'));
    ELSE
        EXECUTE format('ALTER USER %I WITH PASSWORD %L', 
                      current_setting('POSTGRES_USER'), 
                      current_setting('POSTGRES_PASSWORD'));
    END IF;
END
$$;

-- Otorga privilegios
DO $$
BEGIN
    EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', 
                  current_setting('POSTGRES_DB'), 
                  current_setting('POSTGRES_USER'));
    
    -- Conecta a la base de datos y otorga privilegios en el esquema public
    EXECUTE format('\connect %I', current_setting('POSTGRES_DB'));
    EXECUTE format('GRANT ALL ON SCHEMA public TO %I', current_setting('POSTGRES_USER'));
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %I', current_setting('POSTGRES_USER'));
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %I', current_setting('POSTGRES_USER'));
    
    -- Configura permisos por defecto para objetos futuros
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %I', current_setting('POSTGRES_USER'));
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %I', current_setting('POSTGRES_USER'));
END
$$;
