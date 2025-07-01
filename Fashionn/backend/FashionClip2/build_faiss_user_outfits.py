import json
import numpy as np
import faiss
import os

with open("embeddings_user_outfits.json", "r") as f:
    data = json.load(f)

id_list = []
embeddings = []

for item in data:
    id_list.append(item["id"])
    embeddings.append(item["embedding"])

embedding_matrix = np.array(embeddings).astype("float32")
index = faiss.IndexFlatL2(embedding_matrix.shape[1])
index.add(embedding_matrix)

os.makedirs("faiss_index_user_outfits", exist_ok=True)
faiss.write_index(index, "faiss_index_user_outfits/index.bin")
np.save("faiss_index_user_outfits/id_list.npy", np.array(id_list))

print("FAISS index for user outfits successfully created.")
