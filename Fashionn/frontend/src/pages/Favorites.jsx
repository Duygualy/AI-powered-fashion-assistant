import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClothesCard from "../components/ClothesCard";
import NavBar from "../utils/NavBar";
import "../style/HomePage.css";

import discount from "../assets/discount.png";
import clicked_discount from "../assets/clicked_discount.png";
import stock from "../assets/stock.png";
import clicked_stock from "../assets/clicked_stock.png";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [clothesToUnsave, setClothesToUnsave] = useState(null);
  const [trackingTarget, setTrackingTarget] = useState(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [trackingToStop, setTrackingToStop] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [stopType, setStopType] = useState(null);

  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications/unread-count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        setUnreadCount(0);
        console.error("Failed to fetch unread notifications count:", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFavorites = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allProducts = await res.json();

        const favRes = await fetch("http://localhost:5000/api/products/favorites/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favoriteIds = await favRes.json();

        const favProducts = favoriteIds
        .map((id) => {
          const p = allProducts.find((prod) => prod.id === id);
          return p
          ? {
            ...p,
            is_favorited: 1,
            is_discount_tracked: p.is_discount_tracked || false,
            is_stock_tracked: p.is_stock_tracked || false,
          }
        : null;
      })
      .filter(Boolean);
      setFavorites(favProducts);
      } catch (err) {
        console.error("Failed to fetch favorite products:", err);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleUnfavoriteClick = (productId) => {
    setClothesToUnsave(productId);
  };

  const cancelUnsave = () => {
    setClothesToUnsave(null);
  };

  const confirmUnsave = async () => {
    const token = localStorage.getItem("token");
    if (!token || !clothesToUnsave) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/favorites/${clothesToUnsave}/toggle-favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (result.is_favorited === 0) {
        setFavorites((prev) => prev.filter((p) => p.id !== clothesToUnsave));

        await fetch(`http://localhost:5000/api/tracking/delete-all/${clothesToUnsave}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setClothesToUnsave(null);
    } catch (err) {
      console.error("Failed to remove from favorites:", err);
    }
  };

  const cancelTracking = () => {
    setTrackingTarget(null);
  };

  const handleTrackingSelect = async (type) => {
    const token = localStorage.getItem("token");
    const product = favorites.find((p) => p.id === trackingTarget);

    if (type === "discount") {
      setPriceModalOpen(true);
    } else {
      try {
        await fetch("http://localhost:5000/api/stock-tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            availability: product.availability,
          }),
        });

        setFavorites((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, is_stock_tracked: true } : p
          )
        );

        setMessage({ type: "success", text: "Stock tracking started!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch (err) {
        setMessage({ type: "error", text: "Failed to start stock tracking. Please try again." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }

      setTrackingTarget(null);
    }
  };

  const handlePriceSubmit = async () => {
    const token = localStorage.getItem("token");
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!token || isNaN(min) || isNaN(max)) {
      setMessage({ type: "error", text: "Please enter valid numbers." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (min < 0 || max < 0) {
      setMessage({ type: "error", text: "Price cannot be negative." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (min > max) {
      setMessage({ type: "error", text: "Minimum price cannot be greater than maximum price." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    try {
      await fetch("http://localhost:5000/api/price-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: trackingTarget,
          min_price: min,
          max_price: max,
        }),
      });

      setFavorites((prev) =>
        prev.map((p) =>
          p.id === trackingTarget ? { ...p, is_discount_tracked: true } : p
        )
      );

      setMessage({ type: "success", text: "Discount tracking started!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to start discount tracking. Please try again." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }

    setPriceModalOpen(false);
    setTrackingTarget(null);
    setMinPrice("");
    setMaxPrice("");
  };

  const handleStopTracking = async () => {
    const token = localStorage.getItem("token");
    const productId = trackingToStop;

    if (!token || !productId || !stopType) return;

    try {
      const endpoint = stopType === "discount" ? "price-tracking" : "stock-tracking";

      await fetch(`http://localhost:5000/api/${endpoint}/${productId}/stop`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                is_stock_tracked: stopType === "stock" ? false : p.is_stock_tracked,
                is_discount_tracked: stopType === "discount" ? false : p.is_discount_tracked,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to stop tracking:", err);
    }

    setTrackingToStop(null);
    setStopType(null);
  };

return (
  <>
    <NavBar />
    <div className="Ucontainer">
      <h1>♡ . ✧ Favorites ✧ . ♡</h1>
      <div onClick={() => navigate("/notifications")} className="notification-button-wrapper">
        <button className="u-button">
          Notifications 🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {favorites.length === 0 ? (
        <p>There is no favorites ...</p>
      ) : (
        <div className="product-list">
          {favorites.map((product) => (
            <div key={product.id} className="product-list">
              <div className="icon-bar">
                <div className="icon-tooltip">
                  <img
                    src={product.is_discount_tracked ? clicked_discount : discount}
                    alt="discount icon"
                    className="icon"
                    onClick={() => {
                      if (product.is_discount_tracked) {
                        setTrackingToStop(product.id);
                        setStopType("discount");
                      } else {
                        setTrackingTarget(product.id);
                        setPriceModalOpen(true);
                      }
                    }}
                  />
                  {product.is_discount_tracked && product.target_price && (
                    <span className="tooltip-text">
                      Desired price is ${product.min_price} - ${product.max_price}
                    </span>
                  )}
                </div>
                <img
                  src={product.is_stock_tracked ? clicked_stock : stock}
                  alt="stock icon"
                  className="icon"
                  onClick={() => {
                    if (product.is_stock_tracked) {
                      setTrackingToStop(product.id);
                      setStopType("stock");
                    } else {
                      setTrackingTarget(product.id);
                      setPriceModalOpen(false);
                    }
                  }}
                />
              </div>
              <ClothesCard
                product={product}
                onFavoriteClick={() => handleUnfavoriteClick(product.id)}
              />
            </div>
          ))}
        </div>
      )}

      {clothesToUnsave && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Are you sure?</h2>
            <p>Do you want to remove this combination from your saved ones?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={cancelUnsave}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmUnsave}>
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}

      {trackingTarget && !priceModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Track this product?</h2>
            <p>Do you want to stock track this clothes item?</p>
            <div className="modal-buttons">
              <button className="delete-btn" onClick={() => handleTrackingSelect("stock")}>
                Yes, I want it
              </button>
              <button className="cancel-btn" onClick={cancelTracking}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {priceModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Track this product?</h2>
            <p>Do you want to discount track this clothes item?</p>

            <div>
              <input
                type="number"
                placeholder="Minimum Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-input"
              />
              <input
                type="number"
                placeholder="Maximum Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
              />

              <div className="modal-buttons">
                <button className="delete-btn" onClick={handlePriceSubmit}>
                  Yes, I want it
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setPriceModalOpen(false);
                    setTrackingTarget(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {trackingToStop && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Stop tracking?</h2>
            <p>Do you want to stop {stopType} tracking for this item?</p>
            <div className="modal-buttons">
              <button className="delete-btn" onClick={handleStopTracking}>
                Yes, stop tracking
              </button>
              <button className="cancel-btn" onClick={() => setTrackingToStop(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {message.text && (
        <div className={`popupMessage ${message.type === "error" ? "error" : ""}`}>
          {message.text}
        </div>
      )}

    </div>
  </>
);
}