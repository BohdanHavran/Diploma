from flask import Flask, request, jsonify, send_file, send_from_directory, redirect
import os
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
from database import ( 
    create_user, get_user, get_products, user_exists, 
    add_new_product, update_existing_product, delete_product, 
    add_review, get_reviews, approve_review, delete_review, 
    get_orders, add_order, remove_order, clear_cart, 
    get_product_image_key, get_all_orders, get_checks, 
    confirm_check, update_check, delete_check, checkout
)
from image import save_image_from_base64, presigned_url, delete_product_image

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES'))
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES'))

jwt = JWTManager(app)

UPLOAD_FOLDER = 'products'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify(message=f"Welcome"), 200

@app.route('/products/<path:filename>')
def get_photo(filename):
    try:
        url = presigned_url(f"products/{filename}")
        return redirect(url), 302
    except Exception as e:
        return jsonify({"error": f"Failed to generate pre-signed URL: {str(e)}"}), 500

# Хешування пароля
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Реєстрація
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = hash_password(data.get('password'))
    image = data.get('image')
    status = "0"

    if user_exists(email):
        return jsonify(message='User with this email already exists'), 400

    try:
        create_user(email, password, name, image, status)
        return jsonify(message='User created successfully'), 201
    except Exception as e:
        return jsonify(message='User creation failed', error=str(e)), 400

# Логін
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = hash_password(data.get('password'))

    user = get_user(email, password)

    if user[2] == password:
        access_token = create_access_token(identity=user[3])
        refresh_token  = create_access_token(identity=user[3])
        return jsonify(access_token=access_token, refresh_token=refresh_token, name=user[3], image=user[4], status=user[5], id=user[0]), 200
    else:
        return jsonify(message='Invalid email or password'), 401

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

# Захищений роут
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(message=f"Welcome {current_user}"), 200

@app.route('/api/products', methods=['POST'])
def products():
    products = get_products()
    if products:
        product_list = []
        for product in products:
            product_data = {
                'id': product[0],
                'name': product[1],
                'image': product[2],
                'price': product[3],
                'count': product[4],
                'in_date': product[5],
                'short_description': product[6],
                'description': product[7],
                'rating': product[8]
            }
            product_list.append(product_data)
        return jsonify(product_list), 200
    else:
        return jsonify(error="No products found"), 404

@app.route('/api/products/add', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    short_description = data.get('short_description')
    description = data.get('description')
    price = data.get('price')
    products_count = data.get('count')
    base64_image = data.get('image')
    in_date = '2024-12-15'

    try:
        filename = save_image_from_base64(base64_image, app.config['UPLOAD_FOLDER'])

        image = "products/"+filename

        add_new_product(name, image, price, products_count, in_date, short_description, description)
        return jsonify(message='Product added successfully'), 201
    except Exception as e:
        return jsonify(error=str(e)), 400

@app.route('/api/products/update/<int:id>', methods=['POST'])
def update_product(id):
    data = request.get_json()
    name = data.get('name')
    base64_image = data.get('image')  # Може бути None
    price = data.get('price')
    products_count = data.get('count')
    in_date = "2024-12-16"
    short_description = data.get('short_description')
    description = data.get('description')

    try:
        filename_old = get_product_image_key(id)

        filename_new = None
        if base64_image:
            filename_new = save_image_from_base64(base64_image, app.config['UPLOAD_FOLDER'])
        
        update_existing_product(
            id, 
            name, 
            filename_new,
            price, 
            products_count, 
            in_date, 
            short_description, 
            description
        )

        delete_product_image(filename_old)
        return jsonify(message='Product updated successfully'), 200
    except Exception as e:
        return jsonify(error=str(e)), 400

@app.route('/api/products/del/<int:id>', methods=['DELETE'])
def delete_product_api(id):
    try:
        product_id = id
        if not product_id:
            return jsonify({"error": "Product ID is required"}), 400
        filename = get_product_image_key(product_id)

        delete_product(product_id)

        delete_product_image(filename)
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reviews', methods=['POST'])
def add_review_route():
    # Отримання даних із запиту
    data = request.get_json()
    product_id = data.get('product_id')
    user_id = data.get('user_id')
    rating = data.get('rating', 0)
    review = data.get('review', '').strip()

    # Перевірка вхідних даних
    if not product_id or not user_id or not (1 <= rating <= 5):
        return jsonify({"error": "Invalid product ID, user ID, or rating"}), 400

    # Логіка статусу
    status = 1 if not review else 0  # Статус: 1 для оцінки без тексту, 0 для тексту з оцінкою

    try:
        add_review(review, rating, status, user_id, product_id)
        return jsonify({"message": "Review added successfully"}), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to add review"}), 500

@app.route('/api/get_reviews', methods=['GET'])
def get_reviews_route():
    reviews = get_reviews()
    if reviews:
        review_list = []
        for review in reviews:
            review_data = {
                "id": review[0],
                "review": review[1],
                "rating": review[2],
                "is_approved": review[3] == 1,
                "user_name": review[4],
                "product_name": review[5]
            }
            review_list.append(review_data)
        return jsonify(review_list), 200
    else:
        return jsonify(error="No products found"), 404

@app.route('/api/reviews/<int:review_id>/approve', methods=['PUT'])
def approve_review_route(review_id):
    try:
        approve_review(review_id)
        return jsonify({"message": "Review approved successfully"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to approve review"}), 500

@app.route('/api/reviews/<int:review_id>/delete', methods=['DELETE'])
def delete_review_route(review_id):
    try:
        delete_review(review_id)
        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to delete review"}), 500

@app.route('/api/orders', methods=['POST'])
def add_order_route():
    data = request.get_json()
    product_id = data.get('product_id')
    user_id = data.get('user_id')

    if not product_id or not user_id:
        return jsonify({"error": "Missing product_id or user_id"}), 400

    try:
        add_order(user_id, product_id)
        return jsonify({"message": "Product added to the cart."}), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to add product to the cart."}), 500

@app.route('/api/order', methods=['GET'])
def get_order_route():
    user_id = request.args.get('user_id')
    orders = get_orders(user_id)

    orders_list = []
    if orders:
        for order in orders:
            order_data = {
                "order_id": order[0],
                "name": order[1],
                "image": order[2],
                "price": order[3],
                "rating": order[4]
            }
            orders_list.append(order_data)
    
    return jsonify(orders_list), 200

@app.route('/api/orders', methods=['GET'])
def get_orders_route():
    orders = get_all_orders()
    orders_list = []
    for order in orders:
        order_data = {
            "order_id": order[0],
            "user_name": order[1],
            "name": order[2],
            "image": order[3],
            "price": order[4],
            "rating": order[5]
        }
        orders_list.append(order_data)
    return jsonify(orders_list), 200

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def remove_order_route(order_id):
    try:
        remove_order(order_id)
        return jsonify({"message": "Product removed from the cart."}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify("error"), 500

@app.route('/api/orders/clear', methods=['DELETE'])
def clear_cart_route():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM `order` WHERE users_id_users = %s", (user_id,))
            connection.commit()
        return jsonify({"message": "Cart cleared successfully"}), 200
    except Exception as e:
        print(f"Error clearing cart: {e}")
        return jsonify({"error": "Failed to clear cart"}), 500
    finally:
        connection.close()

@app.route('/api/checks', methods=['GET'])
def get_checks_route():
    checks = get_checks()
    return jsonify(checks), 200

@app.route('/api/checks/<int:id_check>/confirm', methods=['PUT'])
def confirm_check_route(id_check):
    if confirm_check(id_check):
        return jsonify({"message": "Check confirmed"}), 200
    return jsonify({"error": "Check not found"}), 404

@app.route('/api/checks/<int:id_check>', methods=['PUT'])
def update_check_route(id_check):
    data = request.get_json()
    quantity = data.get('quantity')
    if not quantity or quantity < 1:
        return jsonify({"error": "Invalid quantity"}), 400
    if update_check(id_check, quantity):
        return jsonify({"message": "Check updated"}), 200
    return jsonify({"error": "Check not found or no associated order"}), 404

@app.route('/api/checks/<int:id_check>', methods=['DELETE'])
def delete_check_route(id_check):
    if delete_check(id_check):
        return jsonify({"message": "Check deleted"}), 200
    return jsonify({"error": "Check not found"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout_route():
    data = request.get_json()
    user_id = data.get('user_id')
    order_details = data.get('order_details')

    if not user_id or not order_details:
        return jsonify({"error": "Missing user_id or order_details"}), 400

    receipt = checkout(user_id, order_details)
    if receipt:
        return jsonify({"receipt": receipt}), 200
    return jsonify({"error": "Failed to process checkout"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')