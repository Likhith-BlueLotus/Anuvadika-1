import React, { useState } from "react";
import VideoUpload from "./VideoUpload";

const VideoDubbing = () => {
  const [videoData, setVideoData] = useState(null);

  const handleVideoSelect = (video) => {
    setVideoData(video);
  };

  const handleDubbing = async () => {
    const formData = new FormData();
    if (videoData.type === "file") {
      formData.append("videoFile", videoData.content);
    } else {
      formData.append("videoLink", videoData.content);
    }

    try {
      const response = await fetch("http://localhost:5173/dub", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Dubbed video URL:", result.dubbedVideoUrl);
        // Handle success, e.g., display the dubbed video URL
      } else {
        console.error("Error dubbing video");
        // Handle error
      }
    } catch (error) {
      console.error("Error dubbing video:", error.message);
      // Handle network error
    }
  };

  return (
    <div>
      <h1>Video Dubbing</h1>
      <VideoUpload onVideoSelect={handleVideoSelect} />
      <button onClick={handleDubbing}>Dub Video</button>
    </div>
  );
};

export default VideoDubbing;
