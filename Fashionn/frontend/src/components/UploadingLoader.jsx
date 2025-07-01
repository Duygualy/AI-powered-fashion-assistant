import React, { useState, useEffect } from "react";

const uploadMessages = [
  "Uploading... Please wait, it can took 30-60 seconds.",
  "Sorry for the delay... Your outfit just got a standing ovation from the code.",
  "It takes long cause you're a real diva girlll !",
  "Calling a real model agency cause this look can't be wasted!",
  "Sorry for waiting girl... the computer crashed because of your beauty!",
  "I'm writing your name for this year's Met Gala. ",
  "Girl... the internet's shaking. Your style just broke the algorithm.",
  "Too much slay detected. Initiating fashion emergency protocols.",
  "Hold on queen, even the servers are gossiping about your iconic look.",
  "Your outfit just made the AI question its own fashion sense ...",
  "This look deserves its own documentary. Stay tuned babe! ",
  "Stitching your look into digital fashion history... please wait. ",
  "Uploading this outfit to the Hall of Slay. Sparkles included.",
  "Warning: Viewers may faint due to extreme glam. "
];

export default function UploadingLoader({ isUploading }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isUploading) return;

    let firstTime = true;
    const interval = setInterval(() => {
      if (firstTime) {
        setMessageIndex(0);
        firstTime = false;
      } else {
        const randomIndex = Math.floor(Math.random() * (uploadMessages.length - 1)) + 1; 
        setMessageIndex(randomIndex);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isUploading]);

  if (!isUploading) return null;

  return (
    <div className="upload-loading">
      <div className="spinner"></div>
      <p>{uploadMessages[messageIndex]}</p>
    </div>
  );
}