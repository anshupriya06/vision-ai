import React, { useState } from 'react';

const ProcessedVideoPlayer = ({ videoUrl }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `processed-output-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white/5 backdrop-blur-xl rounded-xl shadow-lg border border-white/10">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Processed AI Output</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-accent to-safe rounded-full"></div>
      </div>

      {/* Video Player or Placeholder */}
      {videoUrl ? (
        <div className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full rounded-lg shadow-2xl border border-white/20"
            onLoadedData={() => setIsLoaded(true)}
          >
            Your browser does not support the video tag.
          </video>

          {/* Download Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleDownload}
              className="group relative px-8 py-3 bg-accent text-white font-semibold rounded-xl overflow-hidden hover:shadow-lg hover:shadow-accent/50 transition-all duration-300"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-safe transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              <span className="relative flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Download Video</span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Processed Video Yet</h3>
          <p className="text-gray-400 max-w-md">
            Upload a video above and wait for the AI to process it. The analyzed output will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessedVideoPlayer;
