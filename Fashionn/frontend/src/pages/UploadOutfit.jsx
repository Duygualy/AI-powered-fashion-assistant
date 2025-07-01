import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import NavBar from "../utils/NavBar";
import Photo from "../components/PhotoUploader";
import { styleOptions } from "../components/styleOptions";
import "../style/UploadOutfit.css";
import "../style/SavedOutits.css"
import UploadingLoader from "../components/UploadingLoader";


export default function UploadOutfit() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errorPopup, setErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
  setIsUploading(true);
  setShowPopup(false);
  setErrorPopup(false);

  if (!selectedImage) {
    setIsUploading(false);
    return;
  }

  if (!selectedCategory) {
    setIsUploading(false);
    return;
  }

  const formData = new FormData();
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(selectedImage);
    const blob = await response.blob();
    formData.append("image", blob, "image.jpg");

    const validationForm = new FormData();
    validationForm.append("image", blob, "image.jpg");

    const validationRes = await fetch("http://localhost:5000/api/validate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: validationForm,
    });

    const validationResult = await validationRes.json();
    if (!validationResult.valid) {
      setErrorMessage("This image is not a valid outfit. Please upload a proper outfit image.");
      setErrorPopup(true);
      setIsUploading(false);
      return;
    }
  } catch (err) {
    setIsUploading(false);
    alert("Invalid image format.");
    return;
  }

  formData.append("category", selectedCategory);

  try {
    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      setShowPopup(true);
      setTimeout(() => navigate("/profile"), 3000);
    } else {
      alert("Upload failed, please try again.");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Something went wrong.");
  }

  setIsUploading(false);
};

  return (
    <>
      <NavBar />
      <div className="Ucontainer">
        <h1>⋆. 𐙚 ̊  Upload Your Outfit ˚ 𐙚 .⋆</h1>
        
        <div className="filters-select">
          <h3>Style Category: </h3>
          <Select
            isClearable
            isMulti={false}
            options={styleOptions}
            className="saved-select"
            classNamePrefix="saved"
            placeholder="Select one style"
            onChange={(selectedOption) => {
              if (selectedOption) setSelectedCategory(selectedOption.value);
              else setSelectedCategory("");
            }}
          />
        </div>
        
        <Photo onImageSelected={setSelectedImage} />

        {selectedImage && (
          <div className="imagePreviewU">
            <img src={selectedImage} alt="Outfit image" className="previewImageU" />
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleSubmit}
          disabled={!selectedImage || !selectedCategory}
        >
          Upload Outfit
        </button>

        {showPopup && (
          <div className="popupMessage">
            <p>✨ Your outfit has been uploaded! Redirecting to your profile...</p>
          </div>
        )}

        {errorPopup && (
          <div className="popupMessage error">
            <p>{errorMessage}</p>
            <button onClick={() => setErrorPopup(false)}>Close</button>
          </div>
        )}

        <UploadingLoader isUploading={isUploading} />

        </div>
    </>
  );
}