import { useNavigate } from "react-router-dom";
import outfit from "../assets/outfit.png";
import "../style/LandingPage.css";
import logo from "../assets/logo.png";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
    <div className="nav-container">
        <img src={logo} alt="FashionAI Logo" className="logo2-image" />
        <nav>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
        </nav>
        <button onClick={() => navigate("/login")} className="cta-button">Log In</button>
      </div>

      <section className="hero">
        <h1>Your Personal AI Fashion Assistant</h1>
        <p>Discover, match, and track your favorite fashion pieces with our intelligent fashion companion</p>
        <button onClick={() => navigate("/login")} className="cta-button">Start Your Fashion Journey</button>
        <div className="hero-image">
          <img src={outfit} alt="FashionAI Poster" />
        </div>
      </section>

      <section className="features" id="features">
        <h2 className="section-title">Discover Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">👚</div>
            <h3>Clothes Scanning</h3>
            <p>Scan any clothing item to find identical or similar pieces online.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👗</div>
            <h3>Outfit Discovery</h3>
            <p>Upload your outfits and discover what others are wearing with the same items you love.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📉</div>
            <h3>Price & Stock Tracking</h3>
            <p>Track the stock availability and price changes of your favorite fashion items and get notified about discounts.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          {[1,2,3].map((n, i) => (
            <div className="step" key={n}>
              <div className="step-number">{n}</div>
              <div className="step-content">
                <h3>{[
                  "Scan Your Clothes",
                  "Discover Outfits",
                  "Track Your Favorites"
                ][i]}</h3>
                <p>{[
                  "Simply take a photo of any clothing piece you like, and our AI finds it or something even better. You can filter by style, color, or category for smarter results. No more endless scrolling, overpriced dupes, or guessing your favorite influencer fits.",
                  "Simply upload a clothing item you like and our AI finds real outfits that include it. Filter by popularity, recency, style category, or even with your favorite fashion creator's username. Want coquette vibes with that basic white tee? We've got you covered. See how others style the same pieces and share your own looks to inspire.",
                  "Love a clothing item? Add it to your favorites. And if you want get notified when it's back in stock or drops to your desired price. No more missing out on perfect finds. Your dream fit, at your dream price."
                  ][i]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonial-grid">
          {["Duygu Harlow", "Aleyna Armani", "Yaren Versace"].map((name, i) => (
            <div className="testimonial-card" key={name}>
              <p className="quote">{
                [
                  "This website completely changed how I shop! I found an exact match for a designer dress at half the price.",
                  "I love seeing how other people style the same pieces I own. It's like having a personal stylist in my pocket!",
                  "The price tracking feature saved me over $200 last month alone. Best fashion app I've ever used!"
                ][i]
              }</p>
              <div className="user">
                <div className="user-image"></div>
                <div>
                  <p className="user-name">{name}</p>
                  <p>{["Channel Model", "Fashion Designer", "Fashion Influencer"][i]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-about">
            <div className="footer-logo">FashionAI</div>
            <p>To reflect your own style, discover, shape, and share it just give our website a chance.</p>
            <p>It is blended with a little sparkle, a dash of AI, and a whole lot of pink.</p>
            <p>Don't forget;</p>
            <p>✨ Scan it, style it, slay it! ✨</p>
            <div className="footer-logo"><br/>Contact Us:</div> 
            <p>Email: <a href="mailto:fashiongirly@gmail.com">fashiongirly@gmail.com</a></p>
         </div>
          
        </div>
        <div className="copyright">
          <p>&copy; 2025 FashionAI. All rights reserved.</p>
        </div>
      </footer>  
    </>
  );
}