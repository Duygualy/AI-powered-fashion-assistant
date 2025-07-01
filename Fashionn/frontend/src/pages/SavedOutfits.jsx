import React, { useEffect, useState } from "react";
import NavBar from "../utils/NavBar";
import Select from "react-select";
import OutfitCard from "../components/OutfitCard";
import "../style/SavedOutits.css";
import { styleOptions } from "../components/styleOptions";

function SavedOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [outfitToUnsave, setOutfitToUnsave] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/saved-outfits", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Data couldn't be received");
        return res.json();
      })
      .then((data) => setOutfits(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredOutfits = outfits.filter((outfit) => {
    if (!selectedStyle) return true;
    return outfit.style_name === selectedStyle.value;
  });

  const askUnsave = (id) => setOutfitToUnsave(id);
  const cancelUnsave = () => setOutfitToUnsave(null);

  const confirmUnsave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5000/api/outfits/${outfitToUnsave}/toggle-save`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setOutfits((prev) =>
        prev.filter((o) => o.outfit_id !== outfitToUnsave)
      );
      setOutfitToUnsave(null);
    } catch (err) {
    }
  };

  return (
    <>
      <NavBar />
      <div className="Ucontainer">
        <h1>·˚*୨୧ Saved Outfits ୨୧*˚·</h1>

        <div className="filters-select">
          <h3>Style Category:</h3>
          <Select
            isClearable
            options={styleOptions}
            className="saved-select"
            classNamePrefix="saved"
            placeholder="Search with style"
            onChange={(selectedOption) => setSelectedStyle(selectedOption)}
          />
        </div>

        <div className="kombin-grid">
          {filteredOutfits.length === 0 && (
            <p>There is no saved outfits ...</p>
          )}
          {filteredOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.outfit_id}
              outfit={outfit}
              onBookmarkClick={askUnsave}
              alwaysSaved={true}
            />
          ))}
        </div>

        {outfitToUnsave && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h2>Are you sure?</h2>
              <p>Do you want to remove this combination from your saved ones?</p>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={cancelUnsave}>Cancel</button>
                <button className="delete-btn" onClick={confirmUnsave}>Yes, remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SavedOutfits;