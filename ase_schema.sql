CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Admin Table
CREATE TABLE public.admin (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying,
    email_address character varying,
    encrypted_password character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.admin OWNER TO postgres;



-- Manager Table
CREATE TABLE public.manager (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying,
    surname character varying,
    company character varying,
    position character varying,
    email_address character varying,
    phone_number character varying,
    encrypted_password character varying,
    status numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.manager OWNER TO postgres;



-- Customer Table
CREATE TABLE public.customer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_name character varying,
    customer_contact character varying,
    customer_account character varying,
    email_address character varying,
    phone_number character varying,
    country character varying,
    city character varying,
    address character varying,
    scope_of_work character varying,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.customer OWNER TO postgres;


-- Project Table
CREATE TABLE public.project (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id numeric,
    customer_id uuid,
    project_type character varying,
    description character varying,
    start_date character varying,
    end_date character varying,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.project OWNER TO postgres;