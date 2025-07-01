import pymysql
from PIL import Image
import requests
from io import BytesIO
from transformers import CLIPProcessor, CLIPModel
import torch
import json

db = pymysql.connect(
    host="localhost",
    user="root",
    password="123456",
    database="fashion_assistant"
)

cursor = db.cursor()
cursor.execute("SELECT id, image_url FROM products")
rows = cursor.fetchall()

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

embeddings_data = []

headers = {
    "User-Agent": "Mozilla/5.0"
}

for row in rows:
    product_id, image_url = row
    try:
        response = requests.get(image_url, headers=headers, timeout=20, allow_redirects=True)
        content_type = response.headers.get("Content-Type", "")

        if not any(t in content_type for t in ["image/jpeg", "image/png", "image/webp"]):
            raise Exception(f"Invalid content type: {content_type}")

        image = Image.open(BytesIO(response.content)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt")
        outputs = model.get_image_features(**inputs)
        embedding = outputs[0].detach().numpy().tolist()

        embeddings_data.append({
            "id": product_id,
            "embedding": embedding
        })

        print(f"{product_id} processed successfully.")
    except Exception as e:
        print(f"Error ({product_id}): {e}")

with open("embeddings.json", "w") as f:
    json.dump(embeddings_data, f)

print(f"\n embeddings.json file created. Total: {len(embeddings_data)} products processed.")