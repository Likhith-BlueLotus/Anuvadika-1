import React, { useState } from "react";
import { useHistory } from 'react-router-dom';

const VideoUpload = ({ onVideoSelect }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const history = useHistory();

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleLinkChange = (event) => {
    setVideoLink(event.target.value);
  };

  const handleUpload = () => {
    if (videoFile) {
      onVideoSelect({ type: "file", content: videoFile });
      history.push('/video-upload'); // Redirect to the upload video page
    } else if (videoLink) {
      onVideoSelect({ type: "link", content: videoLink });
      history.push('/video-upload'); // Redirect to the upload video page
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Enter video link (e.g., YouTube)"
        value={videoLink}
        onChange={handleLinkChange}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default VideoUpload;
