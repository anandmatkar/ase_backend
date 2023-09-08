CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Admin Table
CREATE TABLE public.admin (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying,
    email_address character varying,
    encrypted_password character varying,
    avatar character varying,
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
    avatar character varying,
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
    is_completed boolean DEFAULT false
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.project OWNER TO postgres;

-- Machine Table
CREATE TABLE public.machine (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id numeric,
    customer_id uuid,
    project_id uuid,
    machine_type character varying,
    serial character varying,
    hour_count character varying,
    nom_speed character varying,
    act_speed character varying,
    description character varying,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.machine OWNER TO postgres;



-- Tech_machine Table
CREATE TABLE public.tech_machine (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    tech_id uuid,
    machine_id uuid,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.tech_machine OWNER TO postgres;


-- Project_attach Table
CREATE TABLE public.project_attach (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    file_path character varying,
    file_type character varying,
    file_size character varying,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.project_attach OWNER TO postgres;



-- machine_attach Table
CREATE TABLE public.machine_attach (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    machine_id uuid,
    file_path character varying,
    file_type character varying,
    file_size character varying,
    manager_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.machine_attach OWNER TO postgres;


-- Technician Table
CREATE TABLE public.technician (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying,
    surname character varying,
    position character varying,
    email_address character varying,
    phone_number character varying,
    encrypted_password character varying,
    nationality character varying,
    qualification character varying,
    level character varying,
    avatar character varying,
    manager_id character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
    
);
ALTER TABLE public.technician OWNER TO postgres;

-- timesheet Table
CREATE TABLE public.timesheet (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    tech_id uuid,
    date character varying,
    start_time TIME,
    end_time TIME,
    comments character varying, 
    is_timesheet_approved boolean DEFAULT false,
    is_timesheet_requested_for_approval boolean DEFAULT false
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);
ALTER TABLE public.timesheet OWNER TO postgres;

-- timesheet_attach Table
CREATE TABLE public.timesheet_attach (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    tech_id uuid,
    file_path character varying,
    file_type character varying,
    file_size character varying,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone),
    deleted_at timestamp with time zone DEFAULT timezone('utc'::text, NULL::timestamp with time zone)
);
ALTER TABLE public.timesheet_attach OWNER TO postgres;

