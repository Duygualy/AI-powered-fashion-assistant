const fs = require("fs");
const path = require("path");

function generateDetailUrl(name, reference) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const refMatch = reference.match(/^C(\d{8})/);
  const refCode = refMatch ? refMatch[1] : "00000000";
  return `https://www.zara.com/us/en/${slug}-p${refCode}.html`;
}

const files = ["top.json", "bottom.json", "dress.json", "shoe.json", "bag.json"];

files.forEach((filename) => {
  const filePath = path.join(__dirname, filename);
  const rawData = fs.readFileSync(filePath, "utf8");
  const products = JSON.parse(rawData);

  const updated = products.map((item) => ({
    ...item,
    detail_url: generateDetailUrl(item.name, item.reference),
  }));

  const outputFilename = filename.replace(".json", "_with_urls.json");
  fs.writeFileSync(outputFilename, JSON.stringify(updated, null, 2), "utf8");
  console.log(`${outputFilename} is maded!`);
});
