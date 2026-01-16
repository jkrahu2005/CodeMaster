import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(!secureUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleError = () => setHasError(true);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [hasError]);

  const togglePlayPause = () => {
    if (!videoRef.current || hasError) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (hasError) {
    return (
      <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-500 mb-4">Video Unavailable</div>
          <p className="text-gray-400 text-sm">The video content is currently unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video cursor-pointer"
      />
      
      {(isHovering || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="bg-black/50 rounded-full p-4"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" />
            )}
          </button>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-4 transition-transform ${
        isHovering || !isPlaying ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            if (videoRef.current) {
              videoRef.current.currentTime = Number(e.target.value);
            }
          }}
          className="w-full h-1 mb-3"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={togglePlayPause} className="text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button onClick={toggleMute} className="text-white">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value);
              }}
              className="w-20"
            />
            
            <span className="text-white text-sm">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          <button 
            onClick={() => videoRef.current?.requestFullscreen()}
            className="text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editorial;