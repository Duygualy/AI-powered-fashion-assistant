import pymysql
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
import json
import os

db = pymysql.connect(
    host="localhost",
    user="root",
    password="123456",
    database="fashion_assistant"
)

cursor = db.cursor()
cursor.execute("SELECT id, image_url FROM user_outfits")
rows = cursor.fetchall()

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

embeddings_data = []

for row in rows:
    outfit_id, image_url = row
    image_path = os.path.join("..", image_url.lstrip("/"))
    try:
        image = Image.open(image_path).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        outputs = model.get_image_features(**inputs)
        embedding = outputs[0].detach().numpy().tolist()

        embeddings_data.append({
            "id": outfit_id,
            "embedding": embedding
        })

        print(f"{outfit_id} processed successfully.")
    except Exception as e:
        print(f"Error ({outfit_id}): {e}")

with open("embeddings_user_outfits.json", "w") as f:
    json.dump(embeddings_data, f)

print(f"\n embeddings_user_outfits.json file created. Total: {len(embeddings_data)}")
