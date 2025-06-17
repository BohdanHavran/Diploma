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
            return result is not None
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
            sql_delete_sklad = "DELETE FROM products_sklad WHERE products_id_products = %s"
            cursor.execute(sql_delete_sklad, (product_id,))
            
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
                LEFT JOIN check_details cd ON o.id_order = cd.order_id_order
                WHERE o.users_id_users = %s
                AND cd.order_id_order IS NULL  -- Exclude orders linked to checks
                GROUP BY o.id_order, p.name, p.image, ps.price;
            """
            cursor.execute(sql, (user_id,))
            orders = cursor.fetchall()
            connection.commit()
            return orders
    finally:
        connection.close()

def get_all_orders():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    o.id_order, 
                    u.name AS user_name,
                    p.name AS product_name,
                    p.image AS product_image,
                    ps.price AS product_price,
                    IFNULL(AVG(t.rating), 'Rating unavailable') AS product_rating
                FROM `order` o
                JOIN users u ON o.users_id_users = u.id_users
                JOIN products_sklad ps ON o.products_sklad_id_products_sklad = ps.id_products_sklad
                JOIN products p ON ps.products_id_products = p.id_products
                LEFT JOIN testimonials t ON p.id_products = t.products_id_products
                GROUP BY o.id_order, u.name, p.name, p.image, ps.price;
            """
            cursor.execute(sql)
            orders = cursor.fetchall()
            return orders
    except Exception as e:
        print(f"Error fetching orders: {e}")
        return []
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
                LIMIT 1;
            """
            cursor.execute(query_find_sklad_id, (product_id,))
            result = cursor.fetchone()

            if result:
                sklad_id = result[0]

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
            cursor.execute("SELECT id_order FROM `order` WHERE id_order = %s", (order_id,))
            if cursor.fetchone() is None:
                raise ValueError("Order not found.")

            # Delete associated check_details records first
            cursor.execute("DELETE FROM `check_details` WHERE order_id_order = %s", (order_id,))
            
            # Then delete the order
            cursor.execute("DELETE FROM `order` WHERE id_order = %s", (order_id,))
            connection.commit()
    finally:
        connection.close()

def clear_cart(user_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Delete associated check_details records first
            cursor.execute("SELECT id_order FROM `order` WHERE users_id_users = %s", (user_id,))
            order_ids = [row[0] for row in cursor.fetchall()]
            if order_ids:
                cursor.execute("DELETE FROM `check_details` WHERE order_id_order IN %s", (tuple(order_ids),))

            # Then delete the orders
            cursor.execute("DELETE FROM `order` WHERE users_id_users = %s", (user_id,))
            connection.commit()
    finally:
        connection.close()
        
def get_checks():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    c.id_check,
                    u.name AS user_name,
                    p.name AS product_name,
                    c.order_price,
                    c.order_data,
                    c.is_confirmed,
                    o.id_order
                FROM `check` c
                JOIN `check_details` cd ON c.id_check = cd.check_id_check
                JOIN `order` o ON cd.order_id_order = o.id_order
                JOIN users u ON c.order_users_id_users = u.id_users
                JOIN products_sklad ps ON o.products_sklad_id_products_sklad = ps.id_products_sklad
                JOIN products p ON o.products_sklad_products_id_products = p.id_products
            """
            cursor.execute(sql)
            checks = cursor.fetchall()
            checks_dict = {}
            for check in checks:
                check_id = check[0]
                if check_id not in checks_dict:
                    checks_dict[check_id] = {
                        "id_check": check[0],
                        "user_name": check[1],
                        "product_names": [],
                        "order_price": check[3],
                        "order_date": check[4].isoformat() if check[4] else None,
                        "is_confirmed": bool(check[5]) if check[5] is not None else False
                    }
                checks_dict[check_id]["product_names"].append(check[2])
            return list(checks_dict.values())
    except Exception as e:
        print(f"Error fetching checks: {e}")
        return []
    finally:
        connection.close()

def confirm_check(id_check):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "UPDATE `check` SET is_confirmed = TRUE WHERE id_check = %s"
            cursor.execute(sql, (id_check,))
            connection.commit()
            return cursor.rowcount > 0
    except Exception as e:
        print(f"Error confirming check: {e}")
        return False
    finally:
        connection.close()

def update_check(id_check, quantity):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                UPDATE `order` o
                JOIN `check` c ON c.order_id_order = o.id_order
                SET o.order_price = o.order_price / (SELECT order_price FROM `order` WHERE id_order = o.id_order) * %s
                WHERE c.id_check = %s
            """
            cursor.execute(sql, (quantity, id_check))
            connection.commit()
            return cursor.rowcount > 0
    except Exception as e:
        print(f"Error updating check: {e}")
        return False
    finally:
        connection.close()

def delete_check(id_check):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM `check` WHERE id_check = %s"
            cursor.execute(sql, (id_check,))
            connection.commit()
            return cursor.rowcount > 0
    except Exception as e:
        print(f"Error deleting check: {e}")
        return False
    finally:
        connection.close()

def checkout(user_id, order_details):
    from datetime import datetime
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            if not order_details or not isinstance(order_details, list):
                raise ValueError("order_details must be a non-empty list")
            print(f"Received order_details: {order_details}")

            # Calculate total amount
            total_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in order_details)

            # Insert into check table
            sql_check = """
                INSERT INTO `check` (order_price, order_data, order_users_id_users, is_confirmed)
                VALUES (%s, NOW(), %s, %s)
            """
            cursor.execute(sql_check, (total_amount, user_id, 0))
            check_id = cursor.lastrowid

            # Link existing orders to check via check_details
            for item in order_details:
                id_order = item.get('id_order')
                if not id_order:
                    continue
                quantity = item.get('quantity', 1)
                price = item.get('price', 0)

                # Verify the order exists and update quantity/price if needed
                cursor.execute("SELECT 1 FROM `order` WHERE id_order = %s", (id_order,))
                if cursor.fetchone():
                    sql_check_details = "INSERT INTO `check_details` (check_id_check, order_id_order) VALUES (%s, %s)"
                    cursor.execute(sql_check_details, (check_id, id_order))
                    cursor.execute("UPDATE `order` SET order_price = %s WHERE id_order = %s", (price * quantity, id_order))

            connection.commit()

            # Fetch product names for receipt
            order_details_with_names = []
            for item in order_details:
                id_order = item.get('id_order')
                if id_order:
                    cursor.execute("""
                        SELECT p.name 
                        FROM `order` o 
                        JOIN products_sklad ps ON o.products_sklad_id_products_sklad = ps.id_products_sklad 
                        JOIN products p ON ps.products_id_products = p.id_products 
                        WHERE o.id_order = %s
                    """, (id_order,))
                    product_name = cursor.fetchone()
                    if product_name:
                        order_details_with_names.append({
                            "name": product_name[0],
                            "price": item.get('price', 0),
                            "quantity": item.get('quantity', 1)
                        })

            return {
                "orderDetails": order_details_with_names,
                "totalAmount": total_amount,
                "date": datetime.now().isoformat()
            }
    except Exception as e:
        print(f"Error during checkout: {e}")
        return None
    finally:
        connection.close()