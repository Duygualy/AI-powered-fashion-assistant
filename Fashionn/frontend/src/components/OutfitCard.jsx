import React from "react";
import clickedBookmark from "../assets/clickedbookmark.png";
import bookmark from "../assets/bookmark.png";

export default function OutfitCard({ outfit, onBookmarkClick, alwaysSaved = false }) {
  const isSaved = alwaysSaved || outfit.is_saved === 1;

  return (
    <div className="kombin-carda" key={outfit.outfit_id}>
      <div className="bookmark-icon" onClick={() => onBookmarkClick(outfit.outfit_id)}>
        <img
          src={isSaved ? clickedBookmark : bookmark}
          alt="Bookmark Icon"
          className="bookmark"
        />
      </div>
      <img
        src={`http://localhost:5000${outfit.image_url}`}
        alt="Saved Outfit"
        className="outfit-image"
      />
      <div className="outfit-category">{outfit.style_name || "Unknown Style"}</div>
      <div className="outfit-username">❀ {outfit.username || "Unknown User"} ❀</div>
      <div className="outfit-saved-count">{outfit.saved_count ?? 0} saved</div>
    </div>
  );
}
