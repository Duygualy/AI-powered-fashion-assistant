const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const authRoutes = require("./routes/auth");
const outfitRoutes = require("./routes/outfitbabe");
const savedOutfitRoutes = require("./routes/savedoutfits");
const suggestionsRoutes = require("./routes/suggestions");
const validateRoutes = require("./routes/validate"); 
const productRoutes = require("./routes/products");
const favoriteRoutes = require("./routes/favorites");
const trackingRoutes = require("./routes/tracking");
const runAllTrackingChecks = require("./utils/checkTracking");
const notificationsRoutes = require("./routes/notifications");
const homeUploadRoutes = require("./routes/homeupload");

app.use("/api/auth", authRoutes);
app.use("/api", outfitRoutes);
app.use("/api", suggestionsRoutes);
app.use("/api", savedOutfitRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/clothes_upload", express.static("clothes_upload")); 
app.use("/api", validateRoutes);          
app.use("/api", productRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", trackingRoutes);
app.use("/api", notificationsRoutes);
app.use("/api", homeUploadRoutes); 

setInterval(runAllTrackingChecks, 5 * 60 * 1000); 

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend works !!!`);
});