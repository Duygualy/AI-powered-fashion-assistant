import React, { useEffect, useState } from "react";
import NavBar from "../utils/NavBar";
import "../style/HomePage.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/notifications?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setNotifications(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Notification error:", err);
      }
    };

    fetchNotifications();
  }, [page]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
  <>
    <NavBar />
    <div className="Ucontainer">
      <h1>⋆✴︎˚｡⋆ Notifications ⋆｡˚✴︎⋆</h1>

      {notifications.length === 0 ? (
        <p className="empty-message">No notifications yet ...</p>
      ) : (
        <div className="notification-wrapper">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.is_read ? "read" : "unread"}`}
            >
              <p>
                <span className="product-name">{n.product_name}</span>
                <span className="arrow"> ┈➤ </span>
                {n.message}
              </p>
              <p className="notification-time">
                {new Date(n.created_at).toLocaleString()}
              </p>
              {!n.is_read && (
                <button
                  className="u-button"
                  onClick={() => markAsRead(n.id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`page-button ${page === index + 1 ? "active" : ""}`}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  </>
);

}