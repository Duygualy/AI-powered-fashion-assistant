import heart from "../assets/heart.png";
import heart_clicked from "../assets/heart_clicked.png";

export default function ClothesCard({ product, onFavoriteClick }) {
  const isFavorited = product.is_favorited;

  return (
    <div className="product-card">
      <div className="image-wrapper">
        <img src={product.image_url} alt={product.name} />
        <div
          onClick={() => {
            onFavoriteClick(product.id);
          }}
          className="fav-button"
        >
          <img
            src={isFavorited ? heart_clicked : heart}
            alt="heart icon"
            className="heart-icon"
          />
        </div>
      </div>
      <h4>{product.name}</h4>
      <p>{product.sale_price} {product.currency}</p>
      <a href={product.detail_url} target="_blank" rel="noreferrer" className="product-link" >Click the link</a>
    </div>
  );
}