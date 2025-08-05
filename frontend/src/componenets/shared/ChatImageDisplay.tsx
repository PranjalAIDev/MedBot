import React, { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';

interface ChatImageDisplayProps {
  fileUrl: string;
  fileName: string;
  isCurrentUser: boolean;
  onDownload?: () => void;
}

const ChatImageDisplay: React.FC<ChatImageDisplayProps> = ({
  fileUrl,
  fileName,
  isCurrentUser,
  onDownload
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Make sure the URL is properly formatted
  const fullUrl = fileUrl.startsWith('http')
    ? fileUrl
    : `${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

  // Create a direct access URL as fallback
  const filename = fileUrl.split('/').pop();
  const directUrl = `/api/files/direct/${filename}`;

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', fullUrl);
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', fullUrl, e);

    // Try direct access URL as fallback
    const target = e.target as HTMLImageElement;

    // If we're already using the direct URL, mark as error
    if (target.src === directUrl) {
      console.log('Direct URL also failed, marking as error');
      setImageError(true);
      return;
    }

    console.log('Trying direct URL:', directUrl);
    target.src = directUrl;
  };

  const toggleFullImage = () => {
    setShowFullImage(!showFullImage);
  };

  return (
    <div className="w-full">
      {imageError ? (
        <div className="flex items-center space-x-2 mb-2">
          <FileText size={16} className="flex-shrink-0" />
          <p className="break-all">{fileName}</p>
        </div>
      ) : (
        <>
          <div
            className="relative mb-2 cursor-pointer"
            onClick={toggleFullImage}
          >
            <img
              src={fullUrl}
              alt={fileName}
              className="rounded-lg max-w-full max-h-64 object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoaded && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-opacity">
                <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  Click to {showFullImage ? 'close' : 'enlarge'}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm break-all mb-2">{fileName}</p>

          {showFullImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={toggleFullImage}>
              <div className="relative max-w-[90%] max-h-[90%]">
                <button
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullImage();
                  }}
                >
                  <X size={20} />
                </button>
                <img
                  src={fullUrl}
                  alt={fileName}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              </div>
            </div>
          )}
        </>
      )}

      {onDownload && (
        <button
          onClick={onDownload}
          className={`mt-1 px-3 py-1 rounded-full text-xs ${
            isCurrentUser
              ? 'bg-green-700 hover:bg-green-800 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-1">
            <Download size={12} className="flex-shrink-0" />
            <span>Download</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatImageDisplay;
