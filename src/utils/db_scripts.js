
const db_sql = {
        "Q1": `SELECT * FROM admin WHERE email_address = '{var1}' AND deleted_at IS NULL`,
        "Q2": `SELECT id, name, surname, company, position, email_address, phone_number, status, created_at, updated_at, deleted_at
         FROM manager WHERE status = '{var1}' AND deleted_at IS NULL`,
        "Q3": `SELECT * FROM admin WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q4": `UPDATE manager SET status = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q5": `SELECT * FROM manager WHERE email_address = '{var1}' AND deleted_at IS NULL`,
        "Q6": `INSERT INTO manager
         (name, surname, company, position, email_address, encrypted_password, phone_number, status, avatar, otp) 
         VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}','{var8}', '{var9}', '{var10}') RETURNING *`,
        "Q7": `SELECT id, name, surname, company, position, email_address, phone_number, status, avatar, created_at, updated_at, deleted_at 
         FROM  manager WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q8": `SELECT id, name, surname, company, position, email_address, phone_number, status, created_at, updated_at, deleted_at 
         FROM manager WHERE deleted_at IS NULL`,
        "Q9": `INSERT INTO customer
         (customer_name,customer_contact,customer_account,email_address,phone_number,country,city,address, scope_of_work,manager_id) 
         VALUES('{var1}','{var2}','{var3}', '{var4}','{var5}','{var6}','{var7}','{var8}', '{var9}','{var10}') RETURNING *`,
        "Q10": `SELECT * FROM customer WHERE manager_id = '{var1}' AND deleted_at IS NULL`,
        "Q11": `INSERT INTO project
          (order_id,customer_id,project_type,description,start_date,end_date,manager_id) 
          VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}','{var7}') RETURNING *`,
        "Q12": `SELECT * FROM project WHERE manager_id = '{var1}' ORDER BY created_at DESC `,
        "Q13": `UPDATE manager SET encrypted_password = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q14": `UPDATE manager SET name = '{var1}', surname = '{var2}', email_address = '{var3}', phone_number = '{var4}', avatar = '{var5}', updated_at = '{var7}' WHERE id = '{var6}' AND deleted_at IS NULL`,
        "Q15": `INSERT INTO machine
          (customer_id,project_id,order_id,machine_type, serial,hour_count,nom_speed,act_speed,description,manager_id) 
          VALUES('{var1}','{var2}','{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}') RETURNING *`,
        "Q16": `INSERT INTO tech_machine 
          (project_id,tech_id,machine_id,manager_id)
          VALUES('{var1}','{var2}','{var3}', '{var4}') RETURNING *`,
        "Q17": `INSERT INTO project_attach(project_id,file_path,file_type,file_size, manager_id)
         VALUES('{var1}', '{var2}','{var3}','{var4}', '{var5}') RETURNING *`,
        "Q18": `INSERT INTO machine_attach(project_id,machine_id,file_path,file_type,file_size, manager_id)
         VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}') RETURNING *`,
        "Q19": `UPDATE customer SET customer_name = '{var1}', customer_contact = '{var2}', customer_account = '{var3}', email_address = '{var4}', phone_number = '{var5}', country = '{var6}', city = '{var7}', address = '{var8}', scope_of_work = '{var9}', updated_at = '{var10}' WHERE id = '{var11}' AND deleted_at IS NULL RETURNING *`,
        "Q20": `SELECT id as customer_id, customer_name,customer_contact,customer_account,email_address,phone_number,country,city,address, scope_of_work,  manager_id, created_at, updated_at, deleted_at
          FROM customer WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q21": `UPDATE customer SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q22": `SELECT
                        p.id AS project_id,
                        p.order_id,
                        p.project_type,
                        p.description,
                        p.start_date,
                        p.end_date,
                        p.created_at,
                        p.is_completed,
                        p.is_requested_for_approval,
                        p.manager_id,
                        c.id AS customer_id,
                        c.customer_name,
                        c.customer_contact,
                        c.customer_account,
                        c.email_address,
                        c.phone_number,
                        c.country,
                        c.city,
                        c.address,
                        c.scope_of_work
                FROM project as p
                INNER JOIN customer as c on c.id = p.customer_id
                WHERE p.manager_id = '{var1}' AND p.deleted_at IS NULL AND c.deleted_at IS NULL`,
        "Q23": `SELECT
        p.id AS project_id,
        p.order_id,
        p.customer_id,
        p.project_type,
        p.description,
        p.start_date,
        p.end_date,
        p.created_at,
        p.is_completed,
        p.manager_id,
        c.id AS customer_id,
        c.customer_name,
        c.customer_contact,
        c.customer_account,
        c.email_address,
        c.phone_number,
        c.country,
        c.city,
        c.address,
        c.scope_of_work,
        COALESCE((
            SELECT JSON_AGG(pa.*)
            FROM project_attach pa
            WHERE pa.project_id = p.id
            AND pa.deleted_at IS NULL
        )::json, '[]'::json) AS project_attach_data,
        COALESCE((
            SELECT JSON_AGG(
                json_build_object(
                    'id', t.id,
                    'name', t.name,
                    'surname', t.surname,
                    'position', t.position,
                    'email_address', t.email_address,
                    'phone_number', t.phone_number,
                    'encrypted_password', t.encrypted_password,
                    'nationality', t.nationality,
                    'qualification', t.qualification,
                    'level', t.level,
                    'avatar', t.avatar,
                    'manager_id', t.manager_id,
                    'created_at', t.created_at,
                    'updated_at', t.updated_at,
                    'deleted_at', t.deleted_at,
                    'timesheet_data', COALESCE((
                        SELECT JSON_AGG(
                            json_build_object(
                                'id', ts.id,
                                'date', ts.date,
                                'start_time', ts.start_time,
                                'end_time', ts.end_time,
                                'comments', ts.comments,
                                'is_timesheet_requested_for_approval', ts.is_timesheet_requested_for_approval,
                                'is_timesheet_approved', ts.is_timesheet_approved,
                                'lunch_time', ts.lunch_time,
                                'timesheet_attach_data', COALESCE((
                                    SELECT JSON_AGG(ta.*)
                                    FROM timesheet_attach ta
                                    WHERE ta.timesheet_id = ts.id
                                    AND ta.deleted_at IS NULL
                                )::json, '[]'::json)
                            )
                        )
                        FROM timesheet ts
                        WHERE ts.tech_id = t.id
                        AND ts.project_id = p.id
                        AND ts.deleted_at IS NULL
                    )::json, '[]'::json),
                    'project_report_data', COALESCE((
                        SELECT JSON_AGG(
                            json_build_object(
                                'id', pr.id,
                                'date', pr.date,
                                'description', pr.description,
                                'is_requested_for_approval', pr.is_requested_for_approval,
                                'is_approved', pr.is_approved,
                                'report_attach_data', COALESCE((
                                    SELECT JSON_AGG(ra.*)
                                    FROM report_attach ra
                                    WHERE ra.report_id = pr.id
                                    AND ra.deleted_at IS NULL
                                )::json, '[]'::json)
                            )
                        )
                        FROM project_report pr
                        WHERE pr.project_id = p.id
                        AND pr.tech_id = t.id
                        AND pr.deleted_at IS NULL
                    )::json, '[]'::json),
                    'machine_data', COALESCE((
                        SELECT JSON_AGG(
                            json_build_object(
                                'id', m.id,
                                'machine_type', m.machine_type,
                                'description', m.description,
                                'serial', m.serial,
                                'machine_attach_data', COALESCE((
                                    SELECT JSON_AGG(ma.*)
                                    FROM machine_attach ma
                                    WHERE ma.machine_id = m.id
                                    AND ma.deleted_at IS NULL
                                )::json, '[]'::json)
                            )
                        )
                        FROM machine m
                        INNER JOIN tech_machine tm ON m.id = tm.machine_id
                        WHERE tm.tech_id = t.id
                        AND tm.project_id = p.id
                        AND tm.deleted_at IS NULL
                        AND m.deleted_at IS NULL
                    )::json, '[]'::json)
                )
            )
            FROM (
                SELECT DISTINCT t.id
                FROM technician t
                JOIN tech_machine tm ON t.id = tm.tech_id
                WHERE tm.project_id = p.id
                AND tm.deleted_at IS NULL
                AND t.deleted_at IS NULL
            ) AS distinct_technicians
            JOIN technician t ON distinct_technicians.id = t.id
        )::json, '[]'::json) AS technician_data
    FROM project AS p
    LEFT JOIN customer c ON c.id = p.customer_id
    WHERE p.id = '{var1}'
    AND p.deleted_at IS NULL
    AND c.deleted_at IS NULL;
    `,
        "Q24": `INSERT INTO technician
          (name, surname, position, email_address, encrypted_password, phone_number, nationality, qualification,level, avatar, manager_id)
          VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}', '{var9}', '{var10}', '{var11}') RETURNING *`,
        "Q25": `SELECT * FROM technician WHERE email_address = '{var1}' AND deleted_at IS NULL`,
        "Q26": `SELECT id, name, surname, position, email_address, phone_number, nationality, qualification , level, avatar, manager_id, created_at, updated_at, deleted_at
          FROM technician WHERE manager_id = '{var1}' AND deleted_at IS NULL`,
        "Q27": `SELECT id, name, surname, position, email_address, phone_number, nationality, qualification , level, avatar, manager_id, created_at, updated_at, deleted_at 
          FROM technician WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q28": `SELECT id, name, surname, company, position, email_address, phone_number, NULL AS qualification, NULL AS level, NULL AS nationality, avatar, created_at, updated_at, deleted_at 
          FROM manager 
          WHERE id = '{var1}' AND deleted_at IS NULL
       
          UNION ALL
       
          SELECT id, name, surname, NULL AS company, NULL AS position, email_address, phone_number, qualification, level, nationality, avatar, created_at, updated_at, deleted_at 
          FROM technician 
          WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q29": ` UPDATE technician SET name = '{var1}', surname = '{var2}', email_address = '{var3}', phone_number = '{var4}', nationality = '{var5}', qualification = '{var6}' , level = '{var7}', avatar = '{var8}',  updated_at = '{var9}' WHERE id = '{var10}' AND deleted_at IS NULL RETURNING *`,
        "Q30": `SELECT
                    p.id AS project_id,
                    p.order_id,
                    p.customer_id,
                    p.project_type,
                    p.description,
                    p.start_date,
                    p.end_date,
                    p.created_at,
                    p.is_completed,
                    p.is_requested_for_approval,
                    p.manager_id,
                    c.id AS customer_id,
                    c.customer_name,
                    c.customer_contact,
                    c.customer_account,
                    c.email_address,
                    c.phone_number,
                    c.country,
                    c.city,
                    c.address,
                    c.scope_of_work,
                    tm.tech_id,
                    COALESCE(json_agg(ts.*) FILTER (WHERE ts.tech_id = tm.tech_id  AND ts.project_id = p.id), '[]') AS timesheet_data
                FROM project AS p
                INNER JOIN customer AS c ON c.id = p.customer_id
                INNER JOIN tech_machine AS tm ON tm.project_id = p.id
                LEFT JOIN timesheet AS ts ON tm.tech_id = ts.tech_id
                WHERE
                    tm.tech_id = '{var1}'
                    AND p.deleted_at IS NULL
                    AND c.deleted_at IS NULL
                    AND tm.deleted_at IS NULL
                    AND (p.id, tm.tech_id) IN (
                        SELECT DISTINCT p.id, tm.tech_id
                        FROM project AS p
                        INNER JOIN tech_machine AS tm ON tm.project_id = p.id
                        WHERE tm.tech_id = '{var1}'
                        GROUP BY p.id, tm.tech_id
                    )
                GROUP BY
                    p.id,
                    p.order_id,
                    p.customer_id,
                    p.project_type,
                    p.description,
                    p.start_date,
                    p.end_date,
                    p.created_at,
                    p.is_completed,
                    p.is_requested_for_approval,
                    p.manager_id,
                    c.id,
                    c.customer_name,
                    c.customer_contact,
                    c.customer_account,
                    c.email_address,
                    c.phone_number,
                    c.country,
                    c.city,
                    c.address,
                    c.scope_of_work,
                    tm.tech_id;`,

        "Q31": `WITH unique_technicians AS (
            SELECT DISTINCT ON (t.id) t.id,
                t.name,
                t.surname,
                t.position,
                t.email_address,
                t.phone_number,
                t.encrypted_password,
                t.nationality,
                t.qualification,
                t.level,
                t.avatar,
                t.manager_id,
                t.created_at,
                t.updated_at,
                t.deleted_at
            FROM technician t
            JOIN tech_machine tm ON t.id = tm.tech_id
            WHERE t.id = '{var2}'
            AND t.deleted_at IS NULL
        )
        , technician_data AS (
            SELECT JSON_AGG(tech_data.*)
            FROM (
                SELECT 
                    t.id,
                    t.name,
                    t.surname,
                    t.position,
                    t.email_address,
                    t.phone_number,
                    t.encrypted_password,
                    t.nationality,
                    t.qualification,
                    t.level,
                    t.avatar,
                    t.manager_id,
                    t.created_at,
                    t.updated_at,
                    t.deleted_at,
                    COALESCE(
                        (SELECT JSON_AGG(json_build_object(
                            'id', ts.id,
                            'date', ts.date,
                            'start_time', ts.start_time,
                            'end_time', ts.end_time,
                            'comments', ts.comments,
                            'is_timesheet_requested_for_approval', ts.is_timesheet_requested_for_approval,
                            'is_timesheet_approved', ts.is_timesheet_approved,
                            'lunch_time', ts.lunch_time,
                            'timesheet_attach_data', COALESCE(
                                (SELECT JSON_AGG(ta.*)
                                FROM timesheet_attach ta
                                WHERE ta.timesheet_id = ts.id
                                AND ta.deleted_at IS NULL
                                ), '[]')
                        ))
                        FROM timesheet ts
                        WHERE ts.tech_id = t.id
                        AND ts.project_id = (SELECT id FROM project WHERE project.id = '{var1}')
                        AND ts.deleted_at IS NULL
                        ), '[]') AS timesheet_data,
                        COALESCE(
                        (SELECT JSON_AGG(json_build_object(
                            'id', pr.id,
                            'date', pr.date,
                            'description', pr.description,
                            'machine_id', pr.machine_id,
                            'duration', pr.duration,
                            'comments', pr.comments,
                            'is_requested_for_approval', pr.is_requested_for_approval,
                            'is_approved', pr.is_approved,
                            'report_attach_data', COALESCE(
                                (SELECT JSON_AGG(ra.*)
                                FROM report_attach ra
                                WHERE ra.report_id = pr.id
                                AND ra.deleted_at IS NULL
                                ), '[]')
                        ))
                        FROM project_report pr
                        WHERE pr.project_id = (SELECT id FROM project WHERE project.id = '{var1}')
                        AND pr.tech_id = t.id
                        AND pr.deleted_at IS NULL
                        ), '[]') AS project_report_data,
                        COALESCE(
                        (SELECT JSON_AGG(json_build_object(
                            'id', m.id,
                            'machine_type', m.machine_type,
                            'hour_count', m.hour_count,
                            'serial', m.serial,
                            'nom_speed', m.nom_speed,
                            'act_speed', m.act_speed,
                            'description', m.description,
                            'machine_attach_data', COALESCE(
                                (SELECT JSON_AGG(ma.*)
                                FROM machine_attach ma
                                WHERE ma.machine_id = m.id
                                AND ma.deleted_at IS NULL
                                ), '[]')
                        ))
                        FROM machine m
                        INNER JOIN tech_machine tm ON m.id = tm.machine_id
                        WHERE tm.tech_id = t.id
                        AND tm.project_id = (SELECT id FROM project WHERE project.id = '{var1}')
                        AND tm.deleted_at IS NULL
                        AND m.deleted_at IS NULL
                        ), '[]') AS machine_data
                    FROM unique_technicians t
                ) AS tech_data
            )
            SELECT
                p.id AS project_id,
                p.order_id,
                p.customer_id,
                p.project_type,
                p.description,
                p.start_date,
                p.end_date,
                p.created_at,
                p.is_completed,
                p.manager_id,
                c.id AS customer_id,
                c.customer_name,
                c.customer_contact,
                c.customer_account,
                c.email_address,
                c.phone_number,
                c.country,
                c.city,
                c.address,
                c.scope_of_work,
                COALESCE(
                (SELECT JSON_AGG(pa.*)
                FROM project_attach pa
                WHERE pa.project_id = (SELECT id FROM project WHERE project.id = '{var1}')
                AND pa.deleted_at IS NULL
                ), '[]') AS project_attach_data,
                (SELECT * FROM technician_data) AS technician_data
            FROM project AS p
            LEFT JOIN customer c ON c.id = p.customer_id
            WHERE p.id = '{var1}'
            AND p.deleted_at IS NULL
            AND c.deleted_at IS NULL;
        `,
        "Q32": `INSERT INTO timesheet
               (project_id, tech_id, date, start_time, end_time, comments, manager_id, lunch_time)
               VALUES('{var1}','{var2}','{var3}','{var4}','{var5}','{var6}', '{var7}', '{var8}') RETURNING *` ,
        "Q33": `SELECT id, project_id, tech_id, date, start_time, end_time, comments, created_at, is_timesheet_approved, lunch_time FROM timesheet WHERE project_id = '{var1}' AND tech_id = '{var2}' AND deleted_at IS NULL`,
        "Q34": `INSERT INTO timesheet_attach
               (project_id,tech_id,file_path,file_type,file_size, timesheet_id)
               VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') RETURNING *`,
        "Q35": `SELECT id, project_id, tech_id, file_path, file_type, file_size, created_at FROM timesheet_attach WHERE project_id = '{var1}' AND tech_id = '{var2}' AND deleted_at IS NULL`,
        "Q36": `UPDATE timesheet SET is_timesheet_requested_for_approval = '{var1}', updated_at = '{var2}' WHERE project_id = '{var3}' AND tech_id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q37":`UPDATE project SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q38":`UPDATE project_attach SET deleted_at = '{var1}' WHERE project_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q39":`UPDATE machine SET deleted_at = '{var1}' WHERE project_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q40":`UPDATE machine_attach SET deleted_at = '{var1}' WHERE project_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q41":`UPDATE timesheet SET deleted_at = '{var1}' WHERE project_id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q42":`UPDATE {var1} SET deleted_at = '{var2}' WHERE project_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
        "Q43":`SELECT id, order_id, customer_id, project_type, description, start_date, end_date, manager_id, is_completed, created_at, updated_at, deleted_at FROM project WHERE customer_id = '{var1}' AND deleted_at IS NULL`,
        "Q44":`SELECT id, project_id, tech_id, date, start_time, end_time, comments, is_timesheet_approved, is_timesheet_requested_for_approval, created_at, updated_at FROM timesheet WHERE is_timesheet_requested_for_approval = true AND manager_id = '{var1}'`,
        "Q45":`SELECT * FROM project WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q46":`UPDATE timesheet SET is_timesheet_approved = '{var1}', is_timesheet_requested_for_approval = '{var2}' WHERE project_id = '{var3}' AND tech_id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q47":`SELECT
                        p.id AS project_id,
                        p.order_id,
                        p.customer_id,
                        p.project_type,
                        p.description,
                        p.start_date,
                        p.end_date,
                        p.created_at,
                        p.is_completed,
                        p.manager_id,
                        c.customer_name,
                        c.customer_contact,
                        c.customer_account,
                        c.email_address,
                        c.phone_number,
                        c.country,
                        c.city,
                        c.address,
                        c.scope_of_work,
                        c.manager_id,
                                                m.email_address as manager_email_address,
                        json_agg(
                        jsonb_build_object(
                                'tech_id', t.id,
                                'name', t.name,
                                'surname', t.surname,
                                'position', t.position,
                                'email_address', t.email_address,
                                'phone_number', t.phone_number
                        )
                        ) AS technicians
                FROM
                        project p
                LEFT JOIN customer c ON p.customer_id = c.id
                LEFT JOIN technician t ON t.manager_id = c.manager_id
                                LEFT JOIN manager m ON m.id = p.manager_id
                WHERE
                        p.id = '{var1}'
                        AND p.deleted_at IS NULL
                        AND c.deleted_at IS NULL
                        AND t.deleted_at IS NULL
                GROUP BY
                        p.id,
                        p.order_id,
                        p.customer_id,
                        p.project_type,
                        p.description,
                        p.start_date,
                        p.end_date,
                        p.created_at,
                        p.is_completed,
                        p.manager_id,
                        c.customer_name,
                        c.customer_contact,
                        c.customer_account,
                        c.email_address,
                        c.phone_number,
                        c.country,
                        c.city,
                        c.address,
                        c.scope_of_work,
                        c.manager_id,
                        m.email_address;` ,
        "Q48":` INSERT INTO project_report(project_id, tech_id, manager_id, date, description, duration, comments, machine_id)
                VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}', '{var8}') RETURNING *`,
        "Q49":  `UPDATE project_report SET is_requested_for_approval = '{var1}' WHERE project_id = '{var2}' AND tech_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
        "Q50":  `SELECT * FROM project_report WHERE project_id = '{var1}' AND tech_id = '{var2}' AND deleted_at IS NULL` ,
        "Q51":  `UPDATE project_report SET is_approved = '{var1}', is_requested_for_approval = '{var2}'
                 WHERE project_id = '{var3}' AND tech_id = '{var4}' AND machine_id = '{var5}' AND deleted_at IS NULL RETURNING *`,
        "Q52":  `UPDATE timesheet SET deleted_at = '{var1}' WHERE project_id = '{var2}' AND tech_id = '{var3}' AND id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q53":  `UPDATE timesheet_attach SET deleted_at = '{var1}'
                 WHERE project_id = '{var2}' AND tech_id = '{var3}' AND timesheet_id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q54":  `UPDATE project SET is_requested_for_approval = '{var1}', is_completed = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q55":  `UPDATE project SET is_completed = '{var1}', is_requested_for_approval = '{var2}'
                 WHERE id = '{var3}' AND manager_id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q56":  `UPDATE manager SET otp = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q57":  `SELECT * FROM customer WHERE email_address = '{var1}' AND deleted_at IS NULL`,
        "Q58":  `UPDATE technician SET otp = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q59":  `UPDATE technician SET encrypted_password = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q60":  `UPDATE technician SET encrypted_password = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q61":  `INSERT INTO report_attach
                 (project_id,tech_id,file_path,file_type,file_size, report_id)
                 VALUES('{var1}','{var2}','{var3}','{var4}','{var5}', '{var6}') RETURNING *`,
        "Q62":  `UPDATE project_report SET deleted_at = '{var1}'
                 WHERE project_id = '{var2}' AND tech_id = '{var3}' AND id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q63":  `UPDATE report_attach SET deleted_at = '{var1}'
                 WHERE project_id = '{var2}' AND tech_id = '{var3}' AND report_id = '{var4}' AND deleted_at IS NULL RETURNING *`,
        "Q64":  `SELECT 
                    ts.id, 
                    ts.project_id, 
                    ts.tech_id, 
                    ts.date, 
                    ts.start_time, 
                    ts.end_time, 
                    ts.comments, 
                    ts.lunch_time,
                    ts.is_timesheet_approved, 
                    ts.is_timesheet_requested_for_approval, 
                    ts.created_at, 
                    ts.updated_at,
                    COALESCE(
                    (
                            SELECT json_agg(ta.*)
                            FROM timesheet_attach ta
                            WHERE ta.timesheet_id = ts.id
                            AND ta.deleted_at IS NULL
                    ), '[]'::json
                    ) AS timesheet_attach
                FROM timesheet ts
                WHERE ts.tech_id = '{var1}' 
                    AND ts.project_id = '{var2}' 
                    AND ts.deleted_at IS NULL;`,
        "Q65":  `INSERT INTO tech_documents(manager_id, tech_id,file_path, file_type, file_size)
                 VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}') RETURNING *`,
        "Q66":` SELECT
                    t.id,
                    t.name,
                    t.surname,
                    t.position,
                    t.email_address,
                    t.phone_number,
                    t.nationality,
                    t.qualification,
                    t.level,
                    t.avatar as profilePic,
                    t.manager_id,
                    t.created_at,
                    t.updated_at,
                    t.deleted_at,
                    COALESCE(
                        (
                            SELECT JSON_AGG(td.*)
                            FROM tech_documents td
                            WHERE td.tech_id = t.id
                                AND td.deleted_at IS NULL
                        ),
                        '[]'::json
                    ) AS tech_documents
                FROM technician t
                WHERE t.id = '{var1}' AND t.deleted_at IS NULL;`,
        "Q67":  `SELECT
                        pr.id,
                        pr.tech_id,
                        pr.project_id,
                        pr.manager_id,
                        pr.machine_id,
                        pr.date,
                        pr.description,
                        pr.comments,
                        pr.duration,
                        pr.is_requested_for_approval,
                        pr.is_approved,
                        pr.created_at,
                        pr.updated_at,
                        pr.deleted_at,
                        COALESCE(
                        (
                                SELECT JSON_AGG(ra.*)
                                FROM report_attach ra
                                WHERE ra.report_id = pr.id
                                AND ra.deleted_at is NULL
                        ),
                        '[]'::json
                        ) AS project_documents
                FROM
                        project_report pr
                WHERE
                        project_id = '{var1}' AND
                        tech_id = '{var2}' AND
                        machine_id = '{var3}' AND
                        pr.deleted_at IS NULL;`,
        "Q68":  `SELECT
                    p.id AS project_id,
                    p.order_id,
                    p.customer_id,
                    p.project_type,
                    p.description,
                    p.start_date,
                    p.end_date,
                    p.created_at,
                    p.is_completed,
                    p.manager_id,
                    json_agg(
                        json_build_object(
                            'machine_id', m.id,
                            'machine_type', m.machine_type,
                            'serial',m.serial,
                            'hour_count',m.hour_count,
                            'nom_speed',m.nom_speed,
                            'act_speed',m.act_speed,
                            'description',m.description,
                            'machine_attach', (
                                SELECT json_agg(ma.*)
                                FROM machine_attach ma
                                WHERE ma.machine_id = m.id
                                AND ma.deleted_at IS NULL
                            )
                        )
                    ) AS machine_data
                FROM
                    project p
                JOIN
                    machine m
                ON
                    p.id = m.project_id
                AND
                    m.deleted_at IS NULL
                WHERE
                    p.manager_id = '{var1}' AND
                    p.deleted_at IS NULL
                GROUP BY
                    p.id, p.order_id, p.customer_id, p.project_type, p.description, p.start_date, p.end_date, p.created_at, p.is_completed, p.manager_id;`,
        "Q69":  `UPDATE machine 
                 SET machine_type = '{var1}', serial = '{var2}', hour_count = '{var3}', nom_speed = '{var4}', act_speed = '{var5}', description = '{var6}', updated_at = '{var7}'
                 WHERE id = '{var8}' AND deleted_at IS NULL RETURNING *`,
        "Q70":  `UPDATE machine SET deleted_at = '{var1}' WHERE id = '{var2}' AND project_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
        "Q71":  `UPDATE tech_machine SET deleted_at = '{var1}' WHERE machine_id = '{var2}' AND project_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
        "Q72":  `UPDATE machine_attach SET deleted_at = '{var1}' WHERE machine_id = '{var2}' AND project_id = '{var3}' AND deleted_at IS NULL RETURNING *`,
        "Q73":  `SELECT
                    m.id AS machine_id,
                    m.order_id,
                    m.project_id,
                    m.machine_type,
                    m.serial,
                    m.hour_count,
                    m.nom_speed,
                    m.act_speed,
                    m.description,
                    m.created_at,
                    m.updated_at,
                    m.deleted_at,
                    'machine_attach',
                    COALESCE(
                        (
                            SELECT json_agg(ma.*)
                            FROM machine_attach ma
                            WHERE ma.machine_id = m.id
                            AND ma.deleted_at IS NULL
                        ),
                        '[]'::json
                    ) AS machine_attach,
                    COALESCE(
                        (
                            SELECT json_agg(
                                jsonb_build_object(
                                    'id', pr.id,
                                    'tech_id', pr.tech_id,
                                    'machine_id', pr.machine_id,
                                    'date',pr.date,
                                    'duration',pr.duration,
                                    'description',pr.description,
                                    'comments', pr.comments,
                                    'is_requested_for_approval', pr.is_requested_for_approval,
                                    'is_approved',pr.is_approved,
                                    'created_at',pr.created_at,
                                    'updated_at',pr.updated_at,
                                    'deleted_at',pr.deleted_at,
                                    'report_attachments', (
                                        SELECT COALESCE(
                                            json_agg(ra.*),
                                            '[]'::json
                                        )
                                        FROM report_attach ra
                                        WHERE ra.report_id = pr.id
                                        AND ra.deleted_at IS NULL
                                    )
                                )
                            )
                            FROM project_report pr
                            WHERE pr.machine_id = m.id
                            AND pr.tech_id = '{var1}'
                            AND pr.deleted_at IS NULL
                        ),
                        '[]'::json
                    ) AS project_report
                FROM machine m
                JOIN tech_machine tm ON m.id = tm.machine_id
                WHERE tm.tech_id = '{var1}' AND m.project_id = '{var2}' AND m.deleted_at IS NULL AND tm.deleted_at IS NULL;
    `,
        "Q74":`SELECT COUNT(*) 
               FROM manager 
               WHERE status = {var1} AND deleted_at IS NULL;`,
        "Q75":`UPDATE project SET is_completed = '{var1}', is_requested_for_approval = '{var2}', updated_at = '{var3}' WHERE id = '{var4}' AND deleted_at IS NULL RETURNING *;`,
        "Q76": `SELECT
                p.order_id AS "ORDER_ID",
                p.project_type AS "PROJECT_TYPE",
                p.description AS "DESCRIPTION",
                p.start_date AS "START_DATE",
                p.end_date AS "END_DATE",
                c.customer_name AS "CUSTOMER_NAME",
                c.customer_contact AS "CONTACT",
                c.customer_account AS "ACCOUNT",
                c.email_address AS "EMAIL",
                c.phone_number AS "PHONE",
                c.country AS "COUNTRY",
                c.city AS "CITY",
                c.address AS "ADDRESS",
                c.scope_of_work AS "SCOPE",
                COALESCE((
                    SELECT JSON_AGG(
                        json_build_object(
                            'NAME', t.name,
                            'SURNAME', t.surname,
                            'POSITION', t.position,
                            'EMAIL', t.email_address,
                            'PHONE', t.phone_number,
                            'NATIONALITY', t.nationality,
                            'QUALIFICATION', t.qualification,
                            'EXPERIENCE', t.level,
                            'timesheet_data', COALESCE((
                                SELECT JSON_AGG(
                                    json_build_object(
                                        'DATE', ts.date,
                                        'CHECK_IN', ts.start_time,
                                        'CHECK_OUT', ts.end_time,
                                        'LUNCH_TIME', ts.lunch_time,
                                        'COMMENTS', ts.comments
                                    )
                                )
                                FROM timesheet ts
                                WHERE ts.tech_id = t.id
                                AND ts.project_id = p.id
                                AND ts.deleted_at IS NULL
                            )::json, '[]'::json)
                        )
                    )
                    FROM (
                        SELECT DISTINCT t.id
                        FROM technician t
                        JOIN tech_machine tm ON t.id = tm.tech_id
                        WHERE tm.project_id = p.id
                        AND tm.deleted_at IS NULL
                        AND t.deleted_at IS NULL
                    ) AS distinct_technicians
                    JOIN technician t ON distinct_technicians.id = t.id
                )::json, '[]'::json) AS technician_data
                FROM project AS p
                LEFT JOIN customer c ON c.id = p.customer_id
                WHERE p.id = '{var1}'
                AND p.deleted_at IS NULL
                AND c.deleted_at IS NULL;
                `,
            "Q77": `SELECT tm.*, p.*
                    FROM tech_machine AS tm
                    LEFT JOIN project AS p ON tm.project_id = p.id
                    WHERE tm.tech_id = '{var1}' AND tm.deleted_at IS NULL AND p.deleted_at IS NULL;
                    `,
            "Q78": `UPDATE {var1} SET deleted_at = '{var2}' WHERE id = '{var3}' AND deleted_at IS NULL RETURNING *`                           

}


function dbScript(template, variables) {
        if (variables != null && Object.keys(variables).length > 0) {
                template = template.replace(new RegExp("\{([^\{]+)\}", "g"), (_unused, varName) => {
                        return variables[varName];
                });
        }
        template = template.replace(/'null'/g, null);
        return template
}

module.exports = { db_sql, dbScript };