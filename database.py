import pymysql
import os

def get_db_connection():
    try:
        required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT']
        missing_vars = [var for var in required_vars if not os.environ.get(var)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        connection = pymysql.connect(
            host=os.environ.get('DB_HOST'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            database=os.environ.get('DB_NAME'),
            port=int(os.environ.get('DB_PORT')),
            connect_timeout=10
        )
        return connection
    except Exception as e:
        raise RuntimeError(f"Failed to connect to database: {str(e)}")

def create_user(email, password, name, image, status):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO users (email, password, name, image, status) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (email, password, name, image, status))
            connection.commit()
    finally:
        connection.close()

def user_exists(email):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            return cursor.fetchone() is not None
    finally:
        connection.close()

def get_user(email, password):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE email = %s AND password = %s"
            cursor.execute(sql, (email, password))
            return cursor.fetchone()
    finally:
        connection.close()

def get_products():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
            SELECT 
                p.id_products, 
                p.name, 
                p.image, 
                ps.price, 
                ps.products_count, 
                ps.in_date,
                p.short_description, 
                p.description,
                COALESCE(AVG(CASE WHEN t.status > 0 THEN t.rating ELSE NULL END), 0) AS rating
            FROM products p
            LEFT JOIN products_sklad ps ON p.id_products Are you sure you want to proceed with this action? = ps.products_id_products
            LEFT JOIN testimonials t ON p.id_products = t.products_id_products
            GROUP BY p.id_products, ps.price, ps.products_count, ps.in_date, 
                     p.name, p.image, p.short_description, p.description
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()

def add_new_product(name, image, price, products_count, in_date, short_description, description):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql_product = """
                INSERT INTO products (name, image, short_description, description)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_product, (name, image, short_description, description))
            product_id = connection.insert_id()

            sql_sklad = """
                INSERT INTO products_sklad (products_id_products, products_count, in_date, price)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_sklad, (product_id, products_count, in_date, price))
            connection.commit()
    finally:
        connection.close()

def update_existing_product(id, name, image, price, products_count, in_date, short_description, description):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            image_clause = ", image = %s" if image else ""
            params = [name, short_description, description]
            if image:
                params.append(image)
            params.append(id)

            sql_product = f"""
                UPDATE products 
                SET name = %s, short_description = %s, description = %s {image_clause}
                WHERE id_products = %s
            """
            cursor.execute(sql_product, params)

            sql_sklad = """
                UPDATE products_sklad 
                SET products_count = %s, in_date = %s, price = %s 
                WHERE products_id_products = %s
            """
            cursor.execute(sql_sklad, (products_count, in_date, price, id))
            connection.commit()
    finally:
        connection.close()

def get_product_image_key(product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT image FROM products WHERE id_products = %s"
            cursor.execute(sql, (product_id,))
            result = cursor.fetchone()
            return result[0] if result else None
    finally:
        connection.close()

def delete_product(product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Get image key for deletion from Spaces
            image_key = get_product_image_key(product_id)
            if image_key:
                session = boto3.session.Session()
                s3_client = session.client(
                    's3',
                    region_name=os.environ.get('DO_SPACES_REGION'),
                    endpoint_url=os.environ.get('DO_SPACES_ENDPOINT'),
                    aws_access_key_id=os.environ.get('DO_SPACES_KEY'),
                    aws_secret_access_key=os.environ.get('DO_SPACES_SECRET')
                )
                s3_client.delete_object(Bucket=os.environ.get('DO_SPACES_BUCKET'), Key=image_key)

            # Delete from products_sklad
            sql_delete_sklad = "DELETE FROM products_sklad WHERE products_id_products = %s"
            cursor.execute(sql_delete_sklad, (product_id,))
            
            # Delete from products
            sql_delete_product = "DELETE FROM products WHERE id_products = %s"
            cursor.execute(sql_delete_product, (product_id,))
            
            connection.commit()
    finally:
        connection.close()

def add_review(review, rating, status, user_id, product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
            INSERT INTO testimonials (response, rating, status, users_id_users, products_id_products)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (review if review else None, rating, status, user_id, product_id))
            connection.commit()
    finally:
        connection.close()

def get_reviews():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    t.id_testimonials, 
                    t.response, 
                    t.rating, 
                    t.status, 
                    u.name AS user_name, 
                    p.name AS product_name 
                FROM testimonials t
                JOIN users u ON t.users_id_users = u.id_users
                JOIN products p ON t.products_id_products = p.id_products
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()

def approve_review(review_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "UPDATE testimonials SET status = 1 WHERE id_testimonials = %s"
            cursor.execute(sql, (review_id,))
            connection.commit()
    finally:
        connection.close()

def delete_review(review_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM testimonials WHERE id_testimonials = %s"
            cursor.execute(sql, (review_id,))
            connection.commit()
    finally:
        connection.close()

def get_orders(user_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    o.id_order, 
                    p.name AS product_name,
                    p.image AS product_image,
                    ps.price AS product_price,
                    IFNULL(AVG(t.rating), 0) AS product_rating
                FROM `order` o
                JOIN products_sklad ps ON o.products_sklad_id_products_sklad = ps.id_products_sklad
                JOIN products p ON ps.products_id_products = p.id_products
                LEFT JOIN testimonials t ON p.id_products = t.products_id_products
                WHERE o.users_id_users = %s
                GROUP BY o.id_order, p.name, p.image, ps.price
            """
            cursor.execute(sql, (user_id,))
            return cursor.fetchall()
    finally:
        connection.close()

def add_order(user_id, product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            query_find_sklad_id = """
                SELECT id_products_sklad 
                FROM products_sklad 
                WHERE products_id_products = %s
                LIMIT 1
            """
            cursor.execute(query_find_sklad_id, (product_id,))
            result = cursor.fetchone()

            if result:
                sklad_id = result[0]
                query_insert_order = """
                    INSERT INTO `order` 
                        (products_sklad_id_products_sklad, products_sklad_products_id_products, users_id_users)
                    VALUES (%s, %s, %s)
                """
                cursor.execute(query_insert_order, (sklad_id, product_id, user_id))
                connection.commit()
            else:
                raise ValueError("No stock information found for the given product ID")
    finally:
        connection.close()

def remove_order(order_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_order FROM `order` WHERE id_order = %s", (order_id,))
            if cursor.fetchone() is None:
                raise ValueError("Order not found.")
            cursor.execute("DELETE FROM `order` WHERE id_order = %s", (order_id,))
            connection.commit()
    finally:
        connection.close()

def clear_cart(user_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM `order` WHERE users_id_users = %s", (user_id,))
            connection.commit()
    finally:
        connection.close()