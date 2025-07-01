import React, { useState, useRef, useEffect } from "react";
import ImageCropper from "../utils/ImageCropper";

export default function PhotoUploader({ onImageSelected }) {
  const [showCamera, setShowCamera] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const videoRef = useRef(null);

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const toggleCamera = () => {
    if (showCamera) {
      stopCamera();
      setShowCamera(false);
    } else {
      setShowCamera(true);
    }
  };

  const handleFileUpload = (event) => {
    if (showCamera) {
      stopCamera();
      setShowCamera(false);
    }
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const canvasWidth = 220;
        const canvasHeight = 300;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        const x = (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);

        canvas.toBlob((blob) => {
          const resizedImageUrl = URL.createObjectURL(blob);
          setTempImage(resizedImageUrl);
          setShowCropper(true);
          URL.revokeObjectURL(url);
        }, "image/jpeg", 0.9);
      };
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      alert("Camera is not ready yet.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const targetWidth = 220;
    const targetHeight = 300;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const targetAspectRatio = targetWidth / targetHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;

    if (videoAspectRatio > targetAspectRatio) {
      sourceWidth = video.videoHeight * targetAspectRatio;
      sourceX = (video.videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = video.videoWidth / targetAspectRatio;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }
    
    ctx.translate(targetWidth, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

    const imageUrl = canvas.toDataURL("image/png");
    setTempImage(imageUrl);
    setShowCropper(true);
    stopCamera();
    setShowCamera(false);
  };

  const startCountdown = (seconds) => {
    setCountdown(1);
    let count = 1;
    const interval = setInterval(() => {
      count++;
      if (count > seconds) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!showCamera || !videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      } catch (err) {
        alert("Camera access denied.");
      }
    };

    startCamera();

    return () => {
      stopCamera(); 
    };
    
  }, [showCamera]);

  return (
    <div className="photoUploader">
      {showCropper && tempImage && (
        <ImageCropper
          imageSrc={tempImage}
          onCropComplete={(croppedImageUrl) => {
            onImageSelected(croppedImageUrl);
            setShowCropper(false);
            setTempImage(null);
          }}
          onCancel={() => {
            setShowCropper(false);
            setTempImage(null);
          }}
        />
      )}

      {!showCropper && (
        <>
          {showCamera && (
            <div className="cameraContainerU" style={{ position: "relative" }}>
              <video ref={videoRef} autoPlay playsInline className="cameraFeedU" />

              {countdown !== null && (
                <div className="countdown-overlay">{countdown}</div>
              )}

              <div className="cameraButtonsContainer">
                <button className="camera-btn" onClick={() => startCountdown(5)}>↪ 5 Seconds</button>
                <button className="camera-btn" onClick={capturePhoto}>Take Photo</button>
                <button className="camera-btn" onClick={() => startCountdown(10)}>↪ 10 Seconds</button>
              </div>
            </div>
          )}

          {!showCamera && (
            <div className="uploadMethodsU">
              <label className="uploadMethodU fileUploadBox">
                <div className="uploadIconU">📁</div>
                <h3>Upload File</h3>
                <p>Select an image from your device</p>
                <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
              </label>

              <div className="uploadMethodU cameraUploadBox" onClick={toggleCamera}>
                <div className="uploadIconU">📷</div>
                <h3>Use Camera</h3>
                <p>Take a photo</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}