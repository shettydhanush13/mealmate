import React, { useState } from "react";
import "./styles.scss";

const HowItWorks = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  const handleThumbnailClick = (videoId) => {
    setActiveVideo(videoId); // Set the clicked video ID as active
  };

  return (
    <>
        <div className="how-it-works">
        <p className="sectionTitle">How It Works</p>
        <div className="how-it-works-content">
            <div className="steps">
                <div className="step">
                    <div className="icon purple-icon">👆</div>
                    <p>Pick from one of our services.</p>
                </div>
                <div className="step">
                    <div className="icon pink-icon">👨‍🍳</div>
                    <p>Customize Your Own Menu.</p>
                </div>
                <div className="step">
                    <div className="icon yellow-icon">😊</div>
                    <p>Place Your Order and Relax!!!</p>
                </div>
            </div>
        </div>
        </div>
        <div className="how-it-works">
        <p className="sectionTitle">How Does The App Work?</p>
        <div className="how-it-works-content">
            <div className="video-preview">
                <div className="video-container">
                    {/* Video 1 */}
                    <div className="thumbnail">
                    {activeVideo === "video1" ? (
                        <iframe
                        width="100%"
                        height="315"
                        src="https://www.youtube.com/embed/0P_X6QEFiCE?autoplay=1"
                        title="How the app works - Video 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>
                    ) : (
                        <img
                        src="https://img.youtube.com/vi/0P_X6QEFiCE/hqdefault.jpg"
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
                        height="315"
                        src="https://www.youtube.com/embed/TzC-EOfwOGE?autoplay=1"
                        title="How the app works - Video 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        ></iframe>
                    ) : (
                        <img
                        src="https://img.youtube.com/vi/TzC-EOfwOGE/hqdefault.jpg"
                        alt="Thumbnail for Video 2"
                        onClick={() => handleThumbnailClick("video2")}
                        className="thumbnail-image"
                        />
                    )}
                    </div>
                </div>
            </div>
        </div>
        </div>
    </>
  );
};

export default HowItWorks;
