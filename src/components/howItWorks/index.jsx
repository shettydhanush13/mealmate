import React, { useState } from "react";
import demo_bulk from '../../assets/demo_bulk.webp';
import demo_menu from '../../assets/demo_menu.webp';
import "./styles.scss";

const HowItWorks = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  const handleThumbnailClick = (videoId) => {
    setActiveVideo(videoId); // Set the clicked video ID as active
  };

  return (
    <>
        <section className="landingSection whiteBG">
        <div className="how-it-works-content">
            <div className="steps how-it-works-steps">
                <div className="step">
                    <div className="icon purple-icon">👆</div>
                    <p>Pick From Our Services.</p>
                </div>
                <div className="step">
                    <div className="icon pink-icon">👨‍🍳</div>
                    <p>Customize Your Own Menu.</p>
                </div>
                <div className="step">
                    <div className="icon yellow-icon">😊</div>
                    <p>Place Your Order and Relax !!!</p>
                </div>
            </div>
        </div>
        </section>
        <section className="landingSection">
        <h3 className="sectionTitle">How To Order</h3>
        <div className="how-it-works-content">
            <div className="video-preview">
                <div className="video-container">
                    {/* Video 1 */}
                    <div className="thumbnail">
                    {activeVideo === "video1" ? (
                        <iframe
                        width="100%"
                        height="295px"
                        src="https://www.youtube.com/embed/0P_X6QEFiCE?autoplay=1"
                        title="How the app works - Video 1"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>
                    ) : (
                        <img
                        src={demo_bulk}
                        alt="Thumbnail for Video 1"
                        onClick={() => handleThumbnailClick("video1")}
                        className="thumbnail-image"
                        />
                    )}
                    </div>

                    {/* Video 2 */}
                    <div className="thumbnail">
                    {activeVideo === "video2" ? (
                        <iframe
                        width="100%"
                        height="295px"
                        src="https://www.youtube.com/embed/TzC-EOfwOGE?autoplay=1"
                        title="How the app works - Video 2"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>
                    ) : (
                        <img
                        src={demo_menu}
                        alt="Thumbnail for Video 2"
                        onClick={() => handleThumbnailClick("video2")}
                        className="thumbnail-image"
                        />
                    )}
                    </div>
                </div>
            </div>
        </div>
        </section>
    </>
  );
};

export default HowItWorks;
