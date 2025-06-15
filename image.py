import io
import os
import uuid
import base64
import boto3
from PIL import Image
from botocore.exceptions import ClientError

session = boto3.session.Session()
s3_client = session.client(
    's3',
    region_name=os.environ.get('DO_SPACES_REGION'),
    endpoint_url=os.environ.get('DO_SPACES_ENDPOINT'),
    aws_access_key_id=os.environ.get('DO_SPACES_KEY'),
    aws_secret_access_key=os.environ.get('DO_SPACES_SECRET')
)

def save_image_from_base64(base64_string, folder):
    try:
        img_data = base64.b64decode(base64_string.split(',')[1] if ',' in base64_string else base64_string)
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.jpg"
        object_key = f"{folder}/{filename}"
        
        # Upload to DigitalOcean Spaces
        s3_client.upload_fileobj(
            BytesIO(img_data),
            os.environ.get('DO_SPACES_BUCKET'),
            object_key,
            ExtraArgs={'ContentType': 'image/jpeg', 'ACL': 'private'}
        )
        
        return filename
    except ClientError as e:
        raise Exception(f"Failed to upload image to Spaces: {str(e)}")
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")

def presigned_url(filename):
    try:
        # Generate a pre-signed URL for the private object
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': os.environ.get('DO_SPACES_BUCKET'), 'Key': filename},
            ExpiresIn=3600  # URL valid for 1 hour
        )
        return redirect(presigned_url), 302
    except ClientError as e:
        return jsonify({"error": f"Failed to generate pre-signed URL: {str(e)}"}), 500
