const styleList = [
    "Casual", "Business Casual", "Formal / Elegant", "Streetwear", "Sporty / Athleisure",
    "Boho", "Minimalist", "Vintage", "Y2K", "Old Money", "Dark Feminine",
    "Coquette", "Gothic", "Cottagecore", "Retro", "Monochrome", "Fairycore",
    "Clean Girl", "Balletcore", "Baddie", "Beach Style", "Other Styles"
  ];
  
  export const styleOptions = styleList.map(style => ({
    value: style,
    label: style
  }));
  