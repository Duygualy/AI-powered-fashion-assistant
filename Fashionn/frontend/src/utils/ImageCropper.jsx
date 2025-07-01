import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImage";
import "../style/HomePage.css";

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const generateCroppedImage = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  return (
    <div className="cropper-container">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={0.733} // it is for 220*300 pixel
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
      />

      <div className="cropper-controls">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn" onClick={generateCroppedImage}>Confirm</button>
      </div>
    </div>
  );
};

export default ImageCropper;