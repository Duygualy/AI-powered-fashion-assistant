import React, { useState, useEffect } from "react";
import NavBar from "../utils/NavBar";
import PhotoUploader from "../components/PhotoUploader";
import Select from "react-select";
import ClothesCard from "../components/ClothesCard";
import "../style/HomePage.css";
import "../style/UploadOutfit.css";
import upload from "../assets/upload.png";

const categoryList = ["Top", "Bottom", "Dress", "Shoe", "Bag"];
const colorList = [
  "Black", "White", "Blue", "Red", "Pink",
  "Gray", "Beige", "Green", "Yellow", "Brown", "Multi-color"
];

const categoryOptions = categoryList.map((cat) => ({
  value: cat.toLowerCase(),
  label: cat,
}));

const colorOptions = colorList.map((color) => ({
  value: color,
  label: color,
}));

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [category, setCategory] = useState(null);
  const [color, setColor] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleImageSelected = (input) => {
    if (input instanceof File) {
      setSelectedImage({
        file: input,
        previewUrl: URL.createObjectURL(input),
      });
    } else if (typeof input === "string") {
      setSelectedImage({
        file: null,
        previewUrl: input,
      });
    } else {
      console.warn("Invalid:", input);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleFilter = async () => {
    if (!category) {
      setMessage({ type: "error", text: "Please select a category first." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    const hasFile = selectedImage?.file instanceof File;
    const hasBlob = selectedImage?.previewUrl?.startsWith("blob:");

    if (hasFile || hasBlob) {
      await handleFindSimilar();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const params = new URLSearchParams();
    if (category) params.append("category", category.value);
    if (color) params.append("color", color.value);
    if (minPrice) params.append("min", minPrice);
    if (maxPrice) params.append("max", maxPrice);
    if (searchTerm) params.append("name", searchTerm);

    const url = `http://localhost:5000/api/products?${params.toString()}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error("Fetch failed");
      }

      const data = await res.json();
      const merged = await fetchFavorites(data);
      setProducts(merged);
    } catch (err) {
      setMessage({ type: "error", text: "Products couldn't be loaded!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleFindSimilar = async () => {
    if (!category) {
      setMessage({ type: "error", text: "Please select a category first." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    const token = localStorage.getItem("token");
    if (!selectedImage || !token) return;

    const formData = new FormData();

    if (selectedImage.file instanceof File) {
      formData.append("file", selectedImage.file);
    } else if (selectedImage.previewUrl?.startsWith("blob:")) {
      const blob = await (await fetch(selectedImage.previewUrl)).blob();
      formData.append("file", blob, "photo.png");
    } else {
      setMessage({ type: "error", text: "Unvalid image format. Please upload a valid image." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    try {
      setLoadingSimilar(true);
      const uploadRes = await fetch("http://localhost:5000/api/upload-home-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { filename } = await uploadRes.json();

      const res = await fetch("http://127.0.0.1:8000/similar-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename,
          category: category?.value,
          color: color?.value,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          searchTerm: searchTerm || null,
        }),
      });

      if (!res.ok) throw new Error("Similarity search failed");
      const data = await res.json();
      const merged = await fetchFavorites(data.products);
      setProducts(merged);
    } catch (err) {
      setMessage({ type: "error", text: "There is no similar products please try with an another image." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const fetchFavorites = async (productsData) => {
    const token = localStorage.getItem("token");
    if (!token) return productsData;

    try {
      const res = await fetch("http://localhost:5000/api/products/favorites/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Favorites couldn't be taken");
      const favorites = await res.json();

      return productsData.map((p) => ({
        ...p,
        is_favorited: favorites.includes(p.id) ? 1 : 0,
      }));
    } catch {
      return productsData;
    }
  };

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/favorites/${productId}/toggle-favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Favorite error.");
      const result = await res.json();

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, is_favorited: result.is_favorited } : p
        )
      );
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update heart icon." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  useEffect(() => {
    const cleanupUploads = async () => {
      try {
        await fetch("http://127.0.0.1:8000/cleanup-upload-folder", {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error:", err);
      }
    };

    window.addEventListener("beforeunload", cleanupUploads);

    return () => {
      window.removeEventListener("beforeunload", cleanupUploads);
    };
  }, []);

  return (
  <>
    <NavBar />
    <div className="Ucontainer">
      <h1>⋆ ｡ ʚ Clothes Finder ɞ ｡ ⋆</h1>

      <div className="filters">
        <div className="filters-select">
          <label>Category:</label>
          <Select
            className="saved-select"
            classNamePrefix="saved"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            placeholder="Select category"
            isClearable
          />
        </div>

        <div className="filters-select">
          <label>Color:</label>
          <Select
            className="saved-select"
            classNamePrefix="saved"
            options={colorOptions}
            value={color}
            onChange={setColor}
            placeholder="Select color"
            isClearable
          />
        </div>

        <div className="filters-select">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search with name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters">
        <div className="filters-select">
          <label>Price:</label>
        <input
          type="number"
          placeholder="Min price"
          className="search-input"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max price"
          className="search-input"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        </div>
        
        <div className="upload-section">
          <label>Search with photo: </label>
          <img
            src={upload}
            alt="Upload File"
            className="upload-icon"
            onClick={() => setShowUploader((prev) => !prev)}
          />
        </div>

        <button onClick={handleFilter} className="u-button">
          {loadingSimilar
            ? "Loading"
            : selectedImage?.file
            ? "Find Similar"
            : "Filter"}
        </button>
      </div>

      {showUploader && (
        <PhotoUploader onImageSelected={handleImageSelected} />
      )}

      {selectedImage?.previewUrl && (
        <div className="imagePreviewU">
          <img
            src={selectedImage.previewUrl}
            alt="Selected"
            className="previewImageU"
          />
          <button
            className="removeImageButton"
            onClick={handleRemoveImage}
          >
            ✖
          </button>
        </div>
      )}

      {products.length > 0 && (
        <div className="product-list">
          {products.map((product) => (
            <ClothesCard
              key={product.product_id || product.id}
              product={product}
              onFavoriteClick={toggleFavorite}
            />
          ))}
        </div>
      )}

      {message.text && (
        <div
          className={`popupMessage ${
            message.type === "error" ? "error" : ""
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  </>
);
}