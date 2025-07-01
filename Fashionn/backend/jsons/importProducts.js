const fs = require("fs");
const path = require("path");
const pool = require("../db");

const files = [
  "top_with_urls.json",
  "bottom_with_urls.json",
  "dress_with_urls.json",
  "shoe_with_urls.json",
  "bag_with_urls.json"
];

(async () => {
  for (const filename of files) {
    const filePath = path.join(__dirname, "..", "jsons", filename);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const category = filename.split("_")[0];

    console.log(`${filename} → ${data.length} item`);

    for (const item of data) {
      const {
        id,
        name,
        imageUrl,
        detail_url,
        oldPrice,
        price,
        currency,
        discountPercentage,
        familyName,
        productColor,
        availability
      } = item;

      if (!id || !name || !price) {
        console.log(`Skipped: missing field → Clothes id: ${id}`);
        continue;
      }

      const original_price =
        oldPrice === "-" || oldPrice === undefined ? null : parseFloat(oldPrice);

      const sale_price = parseFloat(price);

      const discount =
        discountPercentage === "-" || discountPercentage === undefined
          ? null
          : parseInt(discountPercentage);

      const cleanImageUrl = imageUrl.replace(/\?ts=.*$/, "");

      try {
        await pool.query(
          `REPLACE INTO products 
          (id, name, image_url, detail_url, original_price, sale_price, currency, discount_percentage, category, family_name, color, availability)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            name,
            cleanImageUrl,
            detail_url,
            original_price,
            sale_price,
            currency,
            discount,
            category,
            familyName,
            productColor,
            availability
          ]
        );
      } catch (err) {
        console.error(`Error: ${name} (Clothes id: ${id}) → ${err.message}`);
      }
    }
  }

  console.log("Finished successfully!");
  process.exit();
})();
