
# AI Fashion Assistant 👗✨

AI Fashion Assistant is an AI-powered fashion platform that helps users discover similar outfits and products based on uploaded clothing images using CLIP and FAISS, track price and stock changes of favorites, and share their personal style securely through a modern, full-stack architecture.

---

## 🚀 Features

- 🔐 Users must register to access the system.
- 🗝️ If a user forgets their password, they can request a reset link via email from the Reset Password page.
- 📸 Users can upload clothing images to find similar Zara products or user outfits.
- 🔍 CLIP model is used to generate image embeddings.
- ⚡ FAISS compares the uploaded image embeddings with product embeddings and returns the most similar items.
- 🧍 MediaPipe Pose verifies that uploaded outfit images contain a human body and an actual outfit.
- 🔞 NSFW filter blocks inappropriate content.
- ⭐ Users can add products to their favorites list.
- 📈 Users can track price or stock changes for favorite products. When a change occurs:
  - **A sound notification** is triggered.
  - **A notification message appears on the Notification page.**
- 👕 Users can upload their own outfits and view them on their profile.
- 👫 Users can browse other users' outfits (User's Outfits).
- 📌 Users can save other users' outfits and view them on the Saved Outfits page.

---

## 🛠 Technologies

| Layer | Technology |
|---------|-----------|
| **Frontend** | React, CSS |
| **Backend** | Node.js (Express), FastAPI (Python) |
| **Database** | MySQL |
| **Image Similarity** | CLIP (OpenAI), FAISS |
| **Image Analysis** | MediaPipe Pose, NSFW |
| **API** | Zara API |
| **Authentication** | JWT (JSON Web Token) |

---

## 💻 Installation

### Clone the repo
```bash
git clone https://github.com/your-username/ai-fashion-assistant.git


## Run the services

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd ../backend
npm install
node server.js

# AI services
cd FashionClip
uvicorn fashionclip:app --host 127.0.0.1 --port 8000 --reload

cd ../FashionClip2
uvicorn fashionclip2:app --host 127.0.0.1 --port 8001 --reload


##📄 Report and Presentation

Technical Report : ai-fashion-assistant-report.pdf
Presentation : ai-fashion-assistant-presentation.pptx
