import json
import numpy as np
import faiss
import os

with open("embeddings.json", "r") as f:
    data = json.load(f)

id_list = []
embeddings = []

for item in data:
    id_list.append(item["id"])
    embeddings.append(item["embedding"])

embedding_matrix = np.array(embeddings).astype("float32")
index = faiss.IndexFlatL2(embedding_matrix.shape[1])
index.add(embedding_matrix)

os.makedirs("faiss_index", exist_ok=True)
faiss.write_index(index, "faiss_index/index.bin")
np.save("faiss_index/id_list.npy", np.array(id_list))

print("FAISS index successfully created.")
