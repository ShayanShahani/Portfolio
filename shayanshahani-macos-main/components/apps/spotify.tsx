"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
} from "lucide-react";

interface SpotifyProps {
  isDarkMode?: boolean;
}

const playlist = [
  {
    title: "Honey bee",
    artist: "Madrugada",
    cover: "/HoneyBee.png",
    file: "/HoneyBee-Madrugada.mp3",
    duration: "5:32",
  },
  {
    title: "Space to bakersfield",
    artist: "Black Mountain",
    cover: "/SpaceToBakersfield.png",
    file: "/BlackMountain-SpaceToBakersfield.mp3",
    duration: "9:04",
  },
  {
    title: "Jayne",
    artist: "Kwoon",
    cover: "/Jayne.png",
    file: "/Kwoon-Jayne.mp3",
    duration: "4:12",
  },
];

export default function Spotify({ isDarkMode = true }: SpotifyProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  const audioRef = useRef<HTMLAudioElement>(null);

  const repeatModeRef = useRef(repeatMode);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  const isShuffleRef = useRef(isShuffle);
  const isPlayingRef = useRef(isPlaying);

  const currentTrack = playlist[currentTrackIndex];

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const secondaryBg = isDarkMode ? "bg-gray-800" : "bg-gray-100";
  const hoverBg = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const playlistHoverBg = isDarkMode
    ? "hover:bg-gray-700/30"
    : "hover:bg-gray-200";

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      setError(
        "Playback was prevented by the browser. Try clicking play again.",
      );
    }
  };

  const handleNext = (forcePlay = false) => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const shouldPlayAfterChange = forcePlay || isPlayingRef.current;

    setIsPlaying(false);

    if (isShuffleRef.current) {
      let randomIndex = currentTrackIndexRef.current;

      while (
        playlist.length > 1 &&
        randomIndex === currentTrackIndexRef.current
      ) {
        randomIndex = Math.floor(Math.random() * playlist.length);
      }

      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) =>
        prev === playlist.length - 1 ? 0 : prev + 1,
      );
    }

    if (shouldPlayAfterChange && audio) {
      audio.addEventListener(
        "canplaythrough",
        () => {
          setIsPlaying(true);
        },
        { once: true },
      );
    }
  };

  const handlePrevious = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const shouldPlayAfterChange = isPlayingRef.current;

    setIsPlaying(false);

    setCurrentTrackIndex((prev) =>
      prev === 0 ? playlist.length - 1 : prev - 1,
    );

    if (shouldPlayAfterChange && audio) {
      audio.addEventListener(
        "canplaythrough",
        () => {
          setIsPlaying(true);
        },
        { once: true },
      );
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsAudioReady(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }

      setIsAudioReady(true);
    };

    const handleCanPlayThrough = () => {
      setIsAudioReady(true);
    };

    const handleEnd = () => {
      if (repeatModeRef.current === "one") {
        audio.currentTime = 0;

        audio.play().catch((error) => {
          console.error("Error replaying audio:", error);
          setIsPlaying(false);
          setError(
            "Playback was prevented by the browser. Try clicking play again.",
          );
        });

        return;
      }

      if (
        repeatModeRef.current === "off" &&
        currentTrackIndexRef.current === playlist.length - 1
      ) {
        setIsPlaying(false);
        return;
      }

      handleNext(true);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setError("Error loading audio");
      setIsPlaying(false);
      setIsAudioReady(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("error", handleError);

    audio.load();

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!isAudioReady) return;

    if (isPlaying) {
      playAudio();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, isAudioReady]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!isAudioReady) return;

    setIsPlaying((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number.parseFloat(e.target.value);

    try {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } catch (error) {
      console.error("Error setting time:", error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);

    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const selectTrack = (index: number) => {
    if (index === currentTrackIndex) {
      togglePlay();
      return;
    }

    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const shouldPlayAfterChange = isPlayingRef.current;

    setIsPlaying(false);
    setCurrentTrackIndex(index);

    if (shouldPlayAfterChange && audio) {
      audio.addEventListener(
        "canplaythrough",
        () => {
          setIsPlaying(true);
        },
        { once: true },
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }

      if (e.key === "ArrowRight") {
        handleNext();
      }

      if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAudioReady]);

  return (
    <div className={`h-full ${bgColor} ${textColor} flex flex-col`}>
      {/* Header */}
      <div className={`${secondaryBg} p-4 flex items-center justify-between`}>
        <div className="flex items-center">
          <img src="/spotify.png" alt="Spotify" className="w-8 h-8 mr-3" />
          <h2 className="font-semibold">Spotify</h2>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
            onClick={() => setIsShuffle((prev) => !prev)}
            className={`p-1 rounded-full ${hoverBg} ${
              isShuffle ? "text-green-500" : ""
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-label={
              repeatMode === "off"
                ? "Repeat off"
                : repeatMode === "all"
                  ? "Repeat all"
                  : "Repeat one"
            }
            title={
              repeatMode === "off"
                ? "Repeat Off"
                : repeatMode === "all"
                  ? "Repeat All"
                  : "Repeat One"
            }
            onClick={toggleRepeat}
            className={`p-1 rounded-full ${hoverBg} ${
              repeatMode !== "off" ? "text-green-500" : ""
            }`}
          >
            <div className="relative">
              <Repeat className="w-4 h-4" />

              {repeatMode === "one" && (
                <span className="absolute -bottom-1 -right-1 text-[10px]">
                  1
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div
          className={`
            w-48 h-48 mb-6 rounded-md overflow-hidden shadow-lg
            transition-transform duration-500
            ${isPlaying ? "scale-105" : ""}
          `}
        >
          <img
            src={currentTrack.cover || "/placeholder.svg"}
            alt={`${currentTrack.title} cover`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold">{currentTrack.title}</h3>
          <p className="text-sm text-gray-400">{currentTrack.artist}</p>

          <p className="text-xs text-green-500 mt-1">
            Track {currentTrackIndex + 1} of {playlist.length}
          </p>

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>
              {isAudioReady ? formatTime(duration) : currentTrack.duration}
            </span>
          </div>

          <input
            type="range"
            aria-label="Track progress"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleTimeChange}
            disabled={!isAudioReady}
            className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${
                (currentTime / (duration || 1)) * 100
              }%, #4D4D4D ${
                (currentTime / (duration || 1)) * 100
              }%, #4D4D4D 100%)`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <button
            type="button"
            aria-label="Previous track"
            className={`p-2 rounded-full ${hoverBg} text-gray-300 hover:text-white`}
            onClick={handlePrevious}
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`p-3 ${
              isAudioReady ? "bg-white hover:scale-105" : "bg-gray-400"
            } rounded-full transition-transform disabled:cursor-not-allowed`}
            onClick={togglePlay}
            disabled={!isAudioReady}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black" />
            ) : (
              <Play className="w-8 h-8 text-black" />
            )}
          </button>

          <button
            type="button"
            aria-label="Next track"
            className={`p-2 rounded-full ${hoverBg} text-gray-300 hover:text-white`}
            onClick={() => handleNext()}
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center w-full max-w-xs gap-2">
          <button
            type="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={`p-2 rounded-full ${hoverBg} mr-2`}
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            aria-label="Volume"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${
                (isMuted ? 0 : volume) * 100
              }%, #4D4D4D ${(isMuted ? 0 : volume) * 100}%, #4D4D4D 100%)`,
            }}
          />

          <span className="text-xs text-gray-400 w-10 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* Playlist */}
      <div className={`${secondaryBg} p-4`}>
        <h3 className="font-medium mb-2">Playlist</h3>

        <div className="space-y-2">
          {playlist.map((track, index) => (
            <div
              key={track.file}
              role="button"
              tabIndex={0}
              className={`flex items-center p-2 rounded cursor-pointer ${
                currentTrackIndex === index
                  ? "bg-green-900/30"
                  : playlistHoverBg
              }`}
              onClick={() => selectTrack(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectTrack(index);
                }
              }}
            >
              <div className="w-10 h-10 mr-3 rounded overflow-hidden">
                <img
                  src={track.cover || "/placeholder.svg"}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div
                  className={`text-sm font-medium flex items-center gap-2 ${
                    currentTrackIndex === index ? "text-green-500" : ""
                  }`}
                >
                  {currentTrackIndex === index && isPlaying && (
                    <div className="flex gap-0.5" aria-hidden="true">
                      <span className="w-1 h-3 bg-green-500 animate-pulse" />
                      <span className="w-1 h-4 bg-green-500 animate-pulse" />
                      <span className="w-1 h-2 bg-green-500 animate-pulse" />
                    </div>
                  )}

                  <span>{track.title}</span>
                </div>

                <p className="text-xs text-gray-400">{track.artist}</p>
              </div>

              <div className="text-xs text-gray-400">{track.duration}</div>
            </div>
          ))}
        </div>
      </div>

      <audio ref={audioRef} src={currentTrack.file} preload="auto" />
    </div>
  );
}
