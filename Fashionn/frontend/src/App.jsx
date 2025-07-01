import LogIn from "./pages/LogIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Profile from "./pages/Profile";
import UploadOutfit from "./pages/UploadOutfit";
import SavedOutfits from "./pages/SavedOutfits";
import OutfitSuggestions from "./pages/OutfitSuggestions";
import LandingPage from "./pages/LandingPage";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import { useEffect, useState } from "react";

function NotificationListener() {
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const checkNewNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications/unread-count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { count } = await res.json();

        if (count > previousCount) {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(err => {
            console.error("Voice error:", err);
          });
        }

        setPreviousCount(count);
      } catch (err) {
        console.error("Error checking notifications:", err);
      }
    };

    checkNewNotifications();
    const interval = setInterval(checkNewNotifications, 5000);

    return () => clearInterval(interval);
  }, [previousCount]);

  return null;
}

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <NotificationListener />
      <Routes>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/login" element={<LogIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"element={<ResetPassword />} />
        <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
        <Route path="/outfit-suggestions" element={<PrivateRoute element={<OutfitSuggestions />} />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/upload" element={<PrivateRoute element={<UploadOutfit />} />} />
        <Route path="/saved-outfits" element={<PrivateRoute element={<SavedOutfits />} />} />
        <Route path="/favorites" element={<PrivateRoute element={<Favorites />} />} />
        <Route path="/notifications" element={<PrivateRoute element={<Notifications />} />} />
      </Routes>
    </Router>
  );
}

export default App;
