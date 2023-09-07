
const db_sql = {
        "Q1": `SELECT * FROM admin WHERE email_address = '{var1}' AND deleted_at IS NULL`,
        "Q2": `SELECT id, name, surname, company, position, email_address, phone_number, status, created_at, updated_at, deleted_at
         FROM manager WHERE status = '{var1}' AND deleted_at IS NULL`,
        "Q3": `SELECT * FROM admin WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q4": `UPDATE manager SET status = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q5": `SELECT * FROM manager WHERE email_address = '{var1}' AND deleted_at IS NULL`,
        "Q6": `INSERT INTO manager
         (name, surname, company, position, email_address, encrypted_password, phone_number, status, avatar) 
         VALUES('{var1}', '{var2}', '{var3}', '{var4}', '{var5}', '{var6}', '{var7}','{var8}', '{var9}') RETURNING *`,
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
        "Q12": `SELECT * FROM project ORDER BY created_at DESC `,
        "Q13": `UPDATE manager SET encrypted_password = '{var1}', updated_at = '{var3}' WHERE id = '{var2}' AND deleted_at IS NULL RETURNING *`,
        "Q14": `UPDATE manager SET name = '{var1}', surname = '{var2}', email_address = '{var3}', phone_number = '{var4}', avatar = '{var5}'. updated_at = '{var7}' WHERE id = '{var6}' AND deleted_at IS NULL`,
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
        "Q20": `SELECT customer_name,customer_contact,customer_account,email_address,phone_number,country,city,address, scope_of_work,  manager_id, created_at, updated_at, deleted_at
          FROM customer WHERE id = '{var1}' AND deleted_at IS NULL`,
        "Q21": `UPDATE customer SET deleted_at = '{var1}' WHERE id = '{var2}' AND deleted_at IS NULL`,
        "Q22": `SELECT id, order_id, customer_id, project_type, description, start_date, end_date, created_at, is_completed, manager_id
          FROM project WHERE manager_id = '{var1}' AND deleted_at IS NULL`,
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
                        (
                        SELECT
                                JSON_AGG(pa.*)
                        FROM
                                project_attach pa
                        WHERE
                                pa.project_id = p.id
                                AND pa.deleted_at IS NULL
                        ) AS project_attach_data,
                        (
                        SELECT
                                JSON_AGG(t.*)
                        FROM
                                technician t
                        JOIN
                                tech_machine tm ON t.id = tm.tech_id
                        WHERE
                                tm.project_id = p.id
                                AND tm.deleted_at IS NULL
                        ) AS technician_data
                FROM
                        project AS p
                LEFT JOIN
                        customer c ON c.id = p.customer_id
                WHERE
                p.id = '{var1}'
                AND p.deleted_at IS NULL;`,
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
        "Q29": ` UPDATE technician SET name = '{var1}', surname = '{var2}', email_address = '{var3}', phone_number = '{var4}', nationality = '{var5}', qualification = '{var6}' , level = '{var7}', avatar = '{var8}', position = '{var9}', updated_at = '{var10}' WHERE id = '{var11}' AND deleted_at IS NULL RETURNING *`,
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
                  tm.machine_id
                FROM project as p
                INNER JOIN customer as c on c.id = p.customer_id
                INNER JOIN tech_machine as tm on tm.project_id = p.id
                WHERE tm.tech_id = '{var1}' AND p.deleted_at IS NULL AND c.deleted_at IS NULL AND tm.deleted_at IS NULL`,
        "Q31":`SELECT
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
                (
                        SELECT
                                JSON_AGG(pa.*)
                        FROM
                                project_attach pa
                        WHERE
                                pa.project_id = p.id
                                AND pa.deleted_at IS NULL
                        ) AS project_attach_data,
                        (
                        SELECT
                        JSON_AGG(m.*)
                        FROM
                        machine m
                        WHERE
                        m.id IN (SELECT machine_id FROM tech_machine WHERE tech_id = '{var2}')
                        ) AS machine_data
                        FROM project p 
                        JOIN customer c ON p.customer_id = c.id
                WHERE p.id = '{var1}' AND p.deleted_at IS NULL AND c.deleted_at IS NULL`        

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