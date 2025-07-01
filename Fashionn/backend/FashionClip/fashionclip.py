import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import faiss
import numpy as np
import pymysql


model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

index = faiss.read_index("faiss_index/index.bin")
with open("faiss_index/id_list.npy", "rb") as f:
    id_list = np.load(f)
print("CLIP and FAISS uploaded.")

db = pymysql.connect(
    host="localhost",
    user="root",
    password="123456",
    database="fashion_assistant"
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageFilename(BaseModel):
    filename: str
    category: str | None = None
    color: str | None = None
    minPrice: float | None = None
    maxPrice: float | None = None
    searchTerm: str | None = None

def get_image_embedding(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embeddings = model.get_image_features(**inputs)
    return embeddings[0].cpu().numpy().astype("float32")

@app.post("/similar-products")
async def find_similar_products(data: ImageFilename):
    image_path = os.path.join("..", "clothes_upload", data.filename)

    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found.")

    try:
        query_vector = get_image_embedding(image_path).reshape(1, -1)
        distances, indices = index.search(query_vector, k=25)
        print("FAISS distances:", distances)
        print("FAISS indices:", indices)
    except Exception as e:
        raise HTTPException(status_code=500, detail="FAISS search error!")

    similar_ids = [int(id_list[i]) for i in indices[0]]
    print(f"Similar product IDs: {similar_ids}")

    if not similar_ids:
        return {"products": []}

    category = data.category
    color = data.color
    search_term = data.searchTerm
    min_price = data.minPrice
    max_price = data.maxPrice

    try:
        min_price = float(min_price) if min_price is not None else None
    except (TypeError, ValueError):
        min_price = None

    try:
        max_price = float(max_price) if max_price is not None else None
    except (TypeError, ValueError):
        max_price = None

    try:
        format_ids = ",".join(["%s"] * len(similar_ids))
        query = f"SELECT * FROM products WHERE id IN ({format_ids})"
        params = similar_ids.copy()

        if category:
            query += " AND category = %s"
            params.append(category)
        if color:
            query += " AND color = %s"
            params.append(color)
        if min_price is not None:
            query += " AND sale_price >= %s"
            params.append(min_price)
        if max_price is not None:
            query += " AND sale_price <= %s"
            params.append(max_price)
        if search_term:
            query += " AND name LIKE %s"
            params.append(f"%{search_term}%")

        cursor = db.cursor(pymysql.cursors.DictCursor)
        cursor.execute(query, params)
        products = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print("Database error:", e)
        raise HTTPException(status_code=500, detail="Database query error!")

    id_to_product = {p["id"]: p for p in products}
    sorted_products = [id_to_product[i] for i in similar_ids if i in id_to_product]
    print(f"Total number of products: {len(sorted_products)}")

    return {"products": sorted_products}

@app.delete("/cleanup-upload-folder")
async def cleanup_upload_folder():
    folder_path = os.path.join("..", "clothes_upload")
    try:
        deleted_files = []
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
                deleted_files.append(filename)
        print(f"Deleted files: {deleted_files}")
        return {"deleted": deleted_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to clean upload folder.")
