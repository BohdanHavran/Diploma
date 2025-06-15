import pymysql
import os

# Налаштуйте з'єднання з базою даних
def get_db_connection():
    connection = pymysql.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        database=os.environ.get('DB_NAME'),
        port=int(os.environ.get('DB_PORT'))
    )
    return connection
# Функція для створення користувача
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
            result = cursor.fetchone()
            # Check if result is None (no matching user found)
            if result is None:
                return False
            # If a result is found, return True
            return True
    finally:
        connection.close()

# Функція для отримання користувача
def get_user(email, password):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE email = %s AND password = %s"
            cursor.execute(sql, (email, password))
            user = cursor.fetchone()
            return user
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
                p.shor_description, 
                p.description,
                COALESCE(AVG(CASE WHEN t.status > 0 THEN t.rating ELSE NULL END), 0) AS rating
            FROM products p
            LEFT JOIN products_sklad ps ON p.id_products = ps.products_id_products
            LEFT JOIN testimonials t ON p.id_products = t.products_id_products
            GROUP BY p.id_products, ps.price, ps.products_count, ps.in_date, 
                     p.name, p.image, p.shor_description, p.description
            """
            cursor.execute(sql)
            products = cursor.fetchall()
            connection.commit()
            return products
    finally:
        connection.close()

# Оновлення функції для додавання товару
def add_new_product(name, filename, price, products_count, in_date, short_description, description):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql_product = """
                INSERT INTO products (name, image, shor_description, description)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_product, (name, filename, short_description, description))
            product_id = connection.insert_id()

            sql_sklad = """
                INSERT INTO products_sklad (products_id_products, products_count, in_date, price)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_sklad, (product_id, products_count, in_date, price))
            connection.commit()
    finally:
        connection.close()


# Оновлення функції для оновлення товару
def update_existing_product(id, name, filename, price, products_count, in_date, short_description, description):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            image_clause = ", image = %s" if filename else ""
            params = [name, short_description, description]
            if filename:
                params.append(f"products/{filename}")
            params.append(id)

            sql_product = f"""
                UPDATE products 
                SET name = %s, shor_description = %s, description = %s {image_clause}
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

def delete_product(product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Спочатку видаляємо зі складу
            sql_delete_sklad = "DELETE FROM products_sklad WHERE products_id_products = %s"
            cursor.execute(sql_delete_sklad, (product_id,))
            
            # Потім видаляємо сам товар
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
            reviews = cursor.fetchall()
            connection.commit()
            return reviews
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
                    IFNULL(AVG(t.rating), 'Rating unavailable') AS product_rating
                FROM `order` o
                JOIN products_sklad ps ON o.products_sklad_id_products_sklad = ps.id_products_sklad
                JOIN products p ON ps.products_id_products = p.id_products
                LEFT JOIN testimonials t ON p.id_products = t.products_id_products
                WHERE o.users_id_users = %s
                GROUP BY o.id_order, p.name, p.image, ps.price;
            """
            cursor.execute(sql, (user_id,))
            orders = cursor.fetchall()
            connection.commit()
            return orders
    finally:
        connection.close()

def add_order(user_id, product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
        # Крок 1: Знайти id_products_sklad
            query_find_sklad_id = """
                SELECT id_products_sklad 
                FROM products_sklad 
                WHERE products_id_products = %s
                LIMIT 1;
            """
            cursor.execute(query_find_sklad_id, (product_id,))
            result = cursor.fetchone()

            if result:
                sklad_id = result[0]

                # Крок 2: Вставити замовлення у таблицю order
                query_insert_order = """
                    INSERT INTO `order` 
                        (products_sklad_id_products_sklad, products_sklad_products_id_products, users_id_users)
                    VALUES (%s, %s, %s);
                """
                cursor.execute(query_insert_order, (sklad_id, product_id, user_id))
                connection.commit()
                print("Order successfully added to cart.")
            else:
                print("No stock information found for the given product ID.")
    finally:
        connection.close()

def remove_order(order_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Перевірка існування замовлення
            cursor.execute("SELECT id_order FROM `order` WHERE id_order = %s", (order_id,))
            if cursor.fetchone() is None:
                raise ValueError("Order not found.")

            # Видалення замовлення
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

