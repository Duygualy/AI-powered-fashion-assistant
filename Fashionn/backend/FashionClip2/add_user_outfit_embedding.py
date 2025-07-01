import sys
import numpy as np
import faiss
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
import os

outfit_id = int(sys.argv[1])
image_path = sys.argv[2]

script_dir = os.path.dirname(os.path.abspath(__file__))

index_path = os.path.join(script_dir, "faiss_index_user_outfits", "index.bin")
id_list_path = os.path.join(script_dir, "faiss_index_user_outfits", "id_list.npy")

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

image = Image.open(image_path).convert("RGB")
inputs = processor(images=image, return_tensors="pt")
with torch.no_grad():
    embedding = model.get_image_features(**inputs)[0].cpu().numpy().astype("float32")

index = faiss.read_index(index_path)
id_list = np.load(id_list_path).tolist()

index.add(np.expand_dims(embedding, axis=0))
id_list.append(outfit_id)

faiss.write_index(index, index_path)
np.save(id_list_path, np.array(id_list))

print(f"Outfit {outfit_id} embedding added to FAISS!")
