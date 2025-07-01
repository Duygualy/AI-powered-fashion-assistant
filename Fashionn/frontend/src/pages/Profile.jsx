import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";

import "../style/Profile.css";
import NavBar from "../utils/NavBar";

function Profile() {
  const [username, setUsername] = useState("");
  const [outfits, setOutfits] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }      

      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);

        const response = await fetch("http://localhost:5000/api/user-outfits", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOutfits(data);
        }
      } catch (err) {
        console.error(err);
      } 
    };

    fetchProfileData();
  }, [location]);

  const handleDelete = (outfitId) => {
    setOutfitToDelete(outfitId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/delete-outfit/${outfitToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setOutfits(prev => prev.filter(outfit => outfit.outfit_id !== outfitToDelete));
        setShowDeleteModal(false);
        setOutfitToDelete(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOutfitToDelete(null);
  };

  return (
    <>
      <NavBar />
      <div className="Ucontainer">
        <h1>⋆˙⟡ Welcome, {username || "..."} ⟡˙⋆</h1>

        <div className="profile-buttons">
          <button className="button-upload" onClick={() => navigate("/upload")}>Upload Outfit</button>
          <button className="button-saved" onClick={() => navigate("/saved-outfits")}>Saved Outfits</button>
        </div>
 
          <div className="kombin-grid">
            {outfits.length === 0 && (
              <p>No outfits uploaded yet ...</p>
            )}
            {outfits.map((outfit) => (
              <div className="kombin-card" key={outfit.outfit_id}>
                <div className="delete-icon" onClick={() => handleDelete(outfit.outfit_id)}>🗑️</div>

                <img
                  src={`http://localhost:5000${outfit.image_url}`}
                  alt="Outfit"
                  className="outfit-image"
                />
                <div className="outfit-category">{outfit.style_name || "No Style"}</div>
              </div>
            ))}
          </div>

        {showDeleteModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h2>Are you sure?</h2>
              <p>Do you really want to delete this outfit?</p>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
                <button className="delete-btn" onClick={confirmDelete}>Yes, delete it</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;