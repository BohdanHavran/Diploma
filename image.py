import io
import os
import uuid
import base64
from PIL import Image

UPLOAD_FOLDER = './products'  # Define the upload folder within this module

def save_image_from_base64(base64_image, upload_folder=UPLOAD_FOLDER):
    try:
        image_data = base64.b64decode(base64_image)

        image = Image.open(io.BytesIO(image_data))

        filename = f"{uuid.uuid4()}.JPG"

        print(filename)

        image.save(os.path.join(upload_folder, filename))

        return filename
    except Exception as e:
        print("1")
        raise ValueError(f"Invalid image data: {str(e)}")
