import React, { useState, useEffect } from "react";
import NavBar from "../utils/NavBar";
import upload from "../assets/upload.png";
import Select from "react-select";
import OutfitCard from "../components/OutfitCard";
import "../style/SavedOutits.css";
import { styleOptions } from "../components/styleOptions";
import PhotoUploader from "../components/PhotoUploader";

function OutfitSuggestions() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [sortOption, setSortOption] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const cleanupUploads = async () => {
      try {
        await fetch("http://127.0.0.1:8001/cleanup-upload-folder", {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error:", err);
      }
    };
    window.addEventListener("beforeunload", cleanupUploads);

    handleFilter();
    return () => {
      window.removeEventListener("beforeunload", cleanupUploads);
    };
  }, []);

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

  const applyFilters = (data) => {
    let filtered = data;
    if (searchTerm) {
      filtered = filtered.filter((o) =>
        o.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedStyle) {
      filtered = filtered.filter((o) => o.style_name === selectedStyle.value);
    }
    if (sortOption) {
      if (sortOption.value === "popular") {
        filtered.sort((a, b) => b.saved_count - a.saved_count);
      } else if (sortOption.value === "newest") {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortOption.value === "oldest") {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
    }
    return filtered;
  };

  const handleFilter = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const hasFile = selectedImage?.file instanceof File;
    const hasBlob = selectedImage?.previewUrl?.startsWith("blob:");

    if (hasFile || hasBlob) {
      await handleFindSimilar();
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/suggestions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setOutfits(applyFilters(data));
    } catch (err) {
      setMessage({ type: "error", text: "Couldn't load suggestions." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleFindSimilar = async () => {
    const token = localStorage.getItem("token");
    if (!selectedImage || !token) return;

    const formData = new FormData();
    if (selectedImage.file instanceof File) {
      formData.append("file", selectedImage.file);
    } else if (selectedImage.previewUrl?.startsWith("blob:")) {
      const blob = await (await fetch(selectedImage.previewUrl)).blob();
      formData.append("file", blob, "photo.png");
    } else {
      setMessage({ type: "error", text: "Invalid image format." });
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

      const res = await fetch("http://127.0.0.1:8001/similar-user-outfits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename }),
      });

      if (!res.ok) throw new Error("Similarity search failed");
      const data = await res.json();
      setOutfits(applyFilters(data.outfits)); 
    } catch (err) {
      setMessage({ type: "error", text: "Couldn't find similar outfits." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const toggleSave = async (outfitId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/outfits/${outfitId}/toggle-save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Favorite error");
      const result = await res.json();

      setOutfits((prev) =>
        prev.map((o) =>
          o.outfit_id === outfitId
            ? { ...o, is_saved: result.is_saved, saved_count: result.is_saved ? o.saved_count + 1 : o.saved_count - 1 }
            : o
        )
      );
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <>
      <NavBar />
      <div className="Ucontainer">
        <h1>₊˚⊹♡ User's Outfits ♡⊹˚₊</h1>

        <div className="filters">
          <div className="filters-select">
            <label>Username:</label>
            <input
              type="text"
              placeholder="Search with username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-select">
            <label>Style:</label>
            <Select
              isClearable
              isMulti={false}
              options={styleOptions}
              className="saved-select"
              classNamePrefix="saved"
              placeholder="Search with style"
              onChange={(selectedOption) => setSelectedStyle(selectedOption)}
            />
          </div>

          <div className="upload-section">
            <label>Search with photo: </label>
            <img
              src={upload}
              alt="Upload Icon"
              className="upload-icon"
              onClick={() => setShowUploader((prev) => !prev)}
            />
          </div>

          <div className="sort-section">
            <label>Sort:</label>
            <Select
              isClearable
              isSearchable={false}
              options={[
                { value: "popular", label: "Most Popular" },
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
              ]}
              className="saved-select"
              classNamePrefix="saved"
              placeholder="Sort by"
              onChange={(selectedOption) => setSortOption(selectedOption || null)}
            />
          </div>
        </div>

        <button onClick={handleFilter} className="u-button">
          {loadingSimilar
            ? "Loading"
            : selectedImage?.file
            ? "Find Similar"
            : "Filter"}
        </button>

        {showUploader && <PhotoUploader onImageSelected={handleImageSelected} />}

        {selectedImage?.previewUrl && (
          <div className="imagePreviewU">
            <img src={selectedImage.previewUrl} alt="Selected" className="previewImageU" />
            <button className="removeImageButton" onClick={handleRemoveImage}>✖</button>
          </div>
        )}

        <div className="kombin-grid">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.outfit_id} outfit={outfit} onBookmarkClick={toggleSave} />
          ))}
        </div>

        {message.text && (
          <div
            className={`popupMessage ${message.type === "error" ? "error" : ""}`}
          >
            {message.text}
          </div>
        )}
      </div>
    </>
  );
}

export default OutfitSuggestions;
