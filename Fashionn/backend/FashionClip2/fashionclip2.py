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

index = faiss.read_index("faiss_index_user_outfits/index.bin")
with open("faiss_index_user_outfits/id_list.npy", "rb") as f:
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
        embedding = model.get_image_features(**inputs)
    return embedding[0].cpu().numpy().astype("float32")

@app.post("/similar-user-outfits")
async def find_similar_user_outfits(data: ImageFilename):
    image_path = os.path.join("..", "clothes_upload", data.filename)

    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found.")

    try:
        query_vector = get_image_embedding(image_path).reshape(1, -1)
        distances, indices = index.search(query_vector, k=15)
        similar_ids = [int(id_list[i]) for i in indices[0]]
        print(f"Similar product IDs: {similar_ids}")

        cursor = db.cursor(pymysql.cursors.DictCursor)
        format_ids = ",".join(["%s"] * len(similar_ids))
        query = f"""
        SELECT 
            uo.id AS outfit_id,
            uo.image_url,
            uo.created_at,
            os.style_name,
            us.username,
            (
                SELECT COUNT(*) FROM user_saved_outfits so 
                WHERE so.outfit_id = uo.id AND so.is_saved = 1
            ) AS saved_count
        FROM user_outfits uo
        JOIN outfit_styles os ON os.outfit_id = uo.id
        JOIN users us ON uo.user_id = us.id
        WHERE uo.id IN ({format_ids})
        """
        cursor.execute(query, similar_ids)
        outfits = cursor.fetchall()
        cursor.close()

        id_to_outfit = {o["outfit_id"]: o for o in outfits}
        sorted_outfits = [id_to_outfit[i] for i in similar_ids if i in id_to_outfit]

        return {"outfits": sorted_outfits}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database query error!")

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

@app.post("/refresh-user-outfits-index")
async def refresh_user_outfits_index():
    global index, id_list
    index = faiss.read_index("faiss_index_user_outfits/index.bin")
    with open("faiss_index_user_outfits/id_list.npy", "rb") as f:
        id_list = np.load(f)
    return {"message": "FAISS index refreshed!"}
