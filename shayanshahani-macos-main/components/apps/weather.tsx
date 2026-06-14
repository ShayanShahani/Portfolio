"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
  Loader2,
  AlertCircle,
  RefreshCw,
  Navigation,
  Thermometer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WeatherProps {
  isDarkMode?: boolean;
}

type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "stormy"
  | "foggy";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface LocationResult {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingApiResponse {
  results?: LocationResult[];
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

interface ForecastDay {
  date: string;
  day: string;
  maxTemp: number;
  minTemp: number;
  condition: WeatherCondition;
  label: string;
}

interface WeatherViewModel {
  city: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  updatedAt: string;
  current: {
    temp: number;
    condition: WeatherCondition;
    label: string;
    humidity: number;
    windSpeed: number;
    sunrise: string;
    sunset: string;
    feelsLike: number;
  };
  forecast: ForecastDay[];
}

const DEFAULT_LOCATION: LocationResult = {
  id: 112931,
  name: "Tehran",
  country: "Iran",
  admin1: "Tehran",
  latitude: 35.6944,
  longitude: 51.4215,
  timezone: "Asia/Tehran",
};

const POPULAR_CITIES = [
  "Tehran",
  "Rasht",
  "London",
  "Tokyo",
  "Paris",
  "Dubai",
  "New York",
];

const getWeatherInfo = (
  weatherCode: number,
): { label: string; condition: WeatherCondition } => {
  if (weatherCode === 0) {
    return { label: "Clear Sky", condition: "sunny" };
  }

  if ([1, 2].includes(weatherCode)) {
    return { label: "Partly Cloudy", condition: "partly-cloudy" };
  }

  if (weatherCode === 3) {
    return { label: "Cloudy", condition: "cloudy" };
  }

  if ([45, 48].includes(weatherCode)) {
    return { label: "Foggy", condition: "foggy" };
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return { label: "Rainy", condition: "rainy" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return { label: "Snowy", condition: "snowy" };
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return { label: "Thunderstorm", condition: "stormy" };
  }

  return { label: "Cloudy", condition: "cloudy" };
};

const formatTime = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatDay = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(new Date(value));
};

const formatUpdatedAt = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getLocationSubtitle = (location: LocationResult) => {
  return [location.admin1, location.country].filter(Boolean).join(", ");
};

const getWeatherIcon = (condition: WeatherCondition, className = "w-6 h-6") => {
  switch (condition) {
    case "sunny":
      return <Sun className={className} />;
    case "partly-cloudy":
      return <CloudSun className={className} />;
    case "rainy":
    case "stormy":
      return <CloudRain className={className} />;
    case "snowy":
      return <CloudSnow className={className} />;
    case "foggy":
    case "cloudy":
    default:
      return <Cloud className={className} />;
  }
};

const buildWeatherViewModel = (
  location: LocationResult,
  data: OpenMeteoForecastResponse,
): WeatherViewModel => {
  const currentInfo = getWeatherInfo(data.current.weather_code);

  const forecast = data.daily.time.map((date, index) => {
    const info = getWeatherInfo(data.daily.weather_code[index]);

    return {
      date,
      day: formatDay(date),
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      condition: info.condition,
      label: info.label,
    };
  });

  return {
    city: location.name,
    country: location.country,
    region: location.admin1,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: data.timezone,
    updatedAt: data.current.time,
    current: {
      temp: Math.round(data.current.temperature_2m),
      condition: currentInfo.condition,
      label: currentInfo.label,
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      feelsLike: Math.round(data.current.apparent_temperature),
      sunrise: formatTime(data.daily.sunrise[0]),
      sunset: formatTime(data.daily.sunset[0]),
    },
    forecast,
  };
};

export default function Weather({ isDarkMode = true }: WeatherProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [weather, setWeather] = useState<WeatherViewModel | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult>(DEFAULT_LOCATION);
  const [condition, setCondition] = useState<WeatherCondition>("partly-cloudy");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const weatherAbortRef = useRef<AbortController | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const bgColor = isDarkMode
    ? "bg-zinc-950 text-zinc-100"
    : "bg-sky-50 text-slate-900";

  const glassBg = isDarkMode ? "bg-black/20" : "bg-white/20";
  const strongGlassBg = isDarkMode ? "bg-black/30" : "bg-white/35";
  const borderColor = isDarkMode ? "border-white/10" : "border-white/50";
  const mutedText = isDarkMode ? "text-zinc-300/80" : "text-slate-600";
  const softText = isDarkMode ? "text-zinc-200/90" : "text-slate-700";

  const inputClass = isDarkMode
    ? "bg-black/25 border-white/10 text-zinc-100 placeholder:text-zinc-400"
    : "bg-white/45 border-white/60 text-slate-900 placeholder:text-slate-500";

  const initParticles = useCallback(() => {
    particles.current = [];

    const count =
      condition === "rainy" || condition === "stormy"
        ? 130
        : condition === "snowy"
          ? 100
          : condition === "sunny"
            ? 75
            : condition === "foggy"
              ? 50
              : 60;

    for (let i = 0; i < count; i += 1) {
      let particle: Particle;

      if (condition === "rainy" || condition === "stormy") {
        particle = {
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 7 + 9,
          opacity: Math.random() * 0.45 + 0.4,
          color: isDarkMode
            ? "rgba(125, 170, 255, 0.75)"
            : "rgba(37, 99, 235, 0.45)",
        };
      } else if (condition === "snowy") {
        particle = {
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1.5,
          speedX: Math.random() * 0.8 - 0.4,
          speedY: Math.random() * 0.9 + 0.5,
          opacity: Math.random() * 0.4 + 0.45,
          color: "rgba(255, 255, 255, 0.85)",
        };
      } else if (condition === "sunny") {
        particle = {
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.35,
          opacity: Math.random() * 0.45 + 0.25,
          color: `rgba(251, ${190 + Math.random() * 50}, 36, ${
            Math.random() * 0.45 + 0.25
          })`,
        };
      } else if (condition === "foggy") {
        particle = {
          x: Math.random() * 120 - 10,
          y: Math.random() * 100,
          size: Math.random() * 60 + 50,
          speedX: Math.random() * 0.08 + 0.02,
          speedY: 0,
          opacity: Math.random() * 0.08 + 0.04,
          color: isDarkMode
            ? "rgba(220, 220, 230, 0.16)"
            : "rgba(255, 255, 255, 0.45)",
        };
      } else {
        particle = {
          x: Math.random() * 120 - 10,
          y: Math.random() * 55,
          size: Math.random() * 35 + 25,
          speedX: Math.random() * 0.12 + 0.03,
          speedY: 0,
          opacity: Math.random() * 0.12 + 0.06,
          color: isDarkMode
            ? "rgba(210, 210, 225, 0.22)"
            : "rgba(255, 255, 255, 0.62)",
        };
      }

      particles.current.push(particle);
    }
  }, [condition, isDarkMode]);

  const updateParticles = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      particles.current.forEach((particle) => {
        const x = (particle.x / 100) * width;
        const y = (particle.y / 100) * height;

        ctx.beginPath();

        if (condition === "rainy" || condition === "stormy") {
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size / 2;
          ctx.moveTo(x, y);
          ctx.lineTo(x + particle.speedX * 2, y + particle.size * 5);
          ctx.stroke();
        } else {
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;
          ctx.arc(x, y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        particle.x += particle.speedX * 0.12;
        particle.y += particle.speedY * 0.12;

        if (
          condition === "rainy" ||
          condition === "stormy" ||
          condition === "snowy"
        ) {
          if (particle.y > 105) {
            particle.y = -5;
            particle.x = Math.random() * 100;
          }

          if (particle.x < -10 || particle.x > 110) {
            particle.x = Math.random() * 100;
          }
        } else if (condition === "sunny") {
          if (particle.x < 0) particle.x = 100;
          if (particle.x > 100) particle.x = 0;
          if (particle.y < 0) particle.y = 100;
          if (particle.y > 100) particle.y = 0;
        } else {
          if (particle.x > 135) {
            particle.x = -35;
            particle.y = Math.random() * 55;
          }
        }
      });
    },
    [condition],
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;

      if (!parent) return;

      const ratio = window.devicePixelRatio || 1;

      canvas.width = parent.clientWidth * ratio;
      canvas.height = parent.clientHeight * ratio;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();
    initParticles();

    const resizeObserver = new ResizeObserver(resizeCanvas);

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const animate = () => {
      const logicalWidth = canvas.clientWidth;
      const logicalHeight = canvas.clientHeight;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      updateParticles(ctx, logicalWidth, logicalHeight);

      animationRef.current = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();

      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [condition, initParticles, updateParticles]);

  const fetchWeather = useCallback(async (location: LocationResult) => {
    weatherAbortRef.current?.abort();

    const controller = new AbortController();
    weatherAbortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
        timezone: "auto",
        forecast_days: "5",
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error("Weather request failed.");
      }

      const data = (await response.json()) as OpenMeteoForecastResponse;
      const nextWeather = buildWeatherViewModel(location, data);

      setWeather(nextWeather);
      setCondition(nextWeather.current.condition);
      setSelectedLocation(location);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Failed to fetch weather:", error);
      setError("Could not load weather data. Please try another city.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCitySuggestions = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    searchAbortRef.current?.abort();

    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearchingLocation(true);

    try {
      const params = new URLSearchParams({
        name: trimmedQuery,
        count: "6",
        language: "en",
        format: "json",
      });

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error("Location request failed.");
      }

      const data = (await response.json()) as GeocodingApiResponse;

      setSuggestions(data.results ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Failed to fetch city suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchCitySuggestions(searchQuery);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, fetchCitySuggestions]);

  const selectLocation = async (location: LocationResult) => {
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    await fetchWeather(location);
  };

  const searchCity = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    if (suggestions.length > 0) {
      await selectLocation(suggestions[0]);
      return;
    }

    setIsSearchingLocation(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        name: trimmedQuery,
        count: "1",
        language: "en",
        format: "json",
      });

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Location request failed.");
      }

      const data = (await response.json()) as GeocodingApiResponse;
      const firstResult = data.results?.[0];

      if (!firstResult) {
        setError(`No city found for "${trimmedQuery}".`);
        return;
      }

      await selectLocation(firstResult);
    } catch (error) {
      console.error("Failed to search city:", error);
      setError("Could not search that city. Please try again.");
    } finally {
      setIsSearchingLocation(false);
    }
  }, [searchQuery, suggestions]);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsSearchingLocation(true);
    setError(null);
    setIsSuggestionsOpen(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: LocationResult = {
          id: Date.now(),
          name: "Current Location",
          country: "Nearby",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        await fetchWeather(location);
        setIsSearchingLocation(false);
      },
      () => {
        setError("Could not access your location.");
        setIsSearchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, [fetchWeather]);

  useEffect(() => {
    fetchWeather(DEFAULT_LOCATION);

    return () => {
      weatherAbortRef.current?.abort();
      searchAbortRef.current?.abort();
    };
  }, [fetchWeather]);

  const loadPopularCity = async (cityName: string) => {
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setError(null);

    setIsSearchingLocation(true);

    try {
      const params = new URLSearchParams({
        name: cityName,
        count: "1",
        language: "en",
        format: "json",
      });

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Location request failed.");
      }

      const data = (await response.json()) as GeocodingApiResponse;
      const firstResult = data.results?.[0];

      if (!firstResult) {
        setError(`No city found for "${cityName}".`);
        return;
      }

      await fetchWeather(firstResult);
    } catch (error) {
      console.error("Failed to load popular city:", error);
      setError("Could not load that city. Please try again.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleRefresh = () => {
    fetchWeather(selectedLocation);
  };

  const locationSubtitle = weather
    ? [weather.region, weather.country].filter(Boolean).join(", ")
    : "";

  return (
    <div className={`h-full ${bgColor} relative overflow-hidden`}>
      <div
        className={`
          absolute inset-0
          ${
            condition === "sunny"
              ? isDarkMode
                ? "bg-gradient-to-br from-sky-950 via-zinc-950 to-amber-950"
                : "bg-gradient-to-br from-sky-300 via-white to-amber-200"
              : condition === "rainy" || condition === "stormy"
                ? isDarkMode
                  ? "bg-gradient-to-br from-slate-950 via-zinc-950 to-blue-950"
                  : "bg-gradient-to-br from-slate-400 via-blue-200 to-slate-100"
                : condition === "snowy"
                  ? isDarkMode
                    ? "bg-gradient-to-br from-slate-900 via-zinc-950 to-blue-950"
                    : "bg-gradient-to-br from-blue-100 via-white to-slate-200"
                  : isDarkMode
                    ? "bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-900"
                    : "bg-gradient-to-br from-slate-200 via-white to-blue-100"
          }
        `}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        <div className="shrink-0 p-4">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onFocus={() => setIsSuggestionsOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    searchCity();
                  }

                  if (e.key === "Escape") {
                    setIsSuggestionsOpen(false);
                  }
                }}
                className={`pl-10 pr-10 rounded-2xl backdrop-blur-xl ${inputClass}`}
              />

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {isSuggestionsOpen && searchQuery.trim().length >= 2 && (
                <div
                  className={`
                    absolute left-0 right-0 top-[calc(100%+0.5rem)]
                    rounded-3xl border ${borderColor}
                    ${isDarkMode ? "bg-zinc-950/75" : "bg-white/80"}
                    backdrop-blur-2xl shadow-2xl overflow-hidden z-30
                  `}
                >
                  {isSearchingLocation ? (
                    <div className="px-4 py-4 flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className={mutedText}>Searching cities...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((location) => (
                        <button
                          key={`${location.id ?? location.name}-${location.latitude}-${location.longitude}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectLocation(location)}
                          className={`
                            w-full px-4 py-3 flex items-center gap-3 text-left
                            ${isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-900/5"}
                          `}
                        >
                          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium truncate">
                              {location.name}
                            </span>
                            <span
                              className={`block text-xs truncate ${mutedText}`}
                            >
                              {getLocationSubtitle(location) ||
                                "Unknown region"}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm">
                      <span className={mutedText}>
                        No matching cities found.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={searchCity}
              disabled={isLoading || isSearchingLocation}
              className="rounded-2xl backdrop-blur-xl"
              variant={isDarkMode ? "outline" : "default"}
            >
              {isSearchingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>

            <Button
              type="button"
              onClick={useCurrentLocation}
              disabled={isLoading || isSearchingLocation}
              variant="outline"
              size="icon"
              className={`rounded-2xl backdrop-blur-xl ${
                isDarkMode
                  ? "border-white/10 bg-black/20 hover:bg-white/10"
                  : "bg-white/35"
              }`}
              title="Use current location"
            >
              <Navigation className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="icon"
              className={`rounded-2xl backdrop-blur-xl ${
                isDarkMode
                  ? "border-white/10 bg-black/20 hover:bg-white/10"
                  : "bg-white/35"
              }`}
              title="Refresh weather"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="max-w-5xl mx-auto space-y-4">
            {error && (
              <div
                className="
                  rounded-3xl border border-red-500/30
                  bg-red-500/15 backdrop-blur-xl px-4 py-3
                  flex items-center gap-2 text-sm text-red-200
                "
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isLoading && !weather ? (
              <div className="h-[420px] flex flex-col items-center justify-center text-center">
                <Loader2 className="w-9 h-9 animate-spin text-blue-400 mb-3" />
                <p className={mutedText}>Loading live weather...</p>
              </div>
            ) : weather ? (
              <>
                <section className="min-h-[315px] flex items-center">
                  <div className="w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 items-center">
                    <div
                      className={`
                        rounded-[2rem] border ${borderColor}
                        ${glassBg} backdrop-blur-md shadow-2xl
                        p-6 md:p-7
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />

                        <div>
                          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            {weather.city}
                          </h2>

                          {locationSubtitle && (
                            <p className={`text-sm ${mutedText}`}>
                              {locationSubtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className={`text-xs mt-3 ${mutedText}`}>
                        Updated {formatUpdatedAt(weather.updatedAt)} ·{" "}
                        {weather.timezone}
                      </p>

                      <div className="mt-7 flex items-center gap-6">
                        <div
                          className={`
                            w-24 h-24 rounded-[2rem]
                            flex items-center justify-center
                            ${strongGlassBg}
                            border ${borderColor}
                          `}
                        >
                          {getWeatherIcon(
                            weather.current.condition,
                            "w-12 h-12 text-amber-300",
                          )}
                        </div>

                        <div>
                          <div className="flex items-start">
                            <span className="text-7xl font-light leading-none tabular-nums">
                              {weather.current.temp}
                            </span>
                            <span className="text-3xl mt-1">°</span>
                          </div>

                          <p className="text-lg font-medium mt-1">
                            {weather.current.label}
                          </p>

                          <p className={`text-sm ${mutedText}`}>
                            Feels like {weather.current.feelsLike}°
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`rounded-3xl border ${borderColor} ${glassBg} backdrop-blur-md p-4`}
                      >
                        <Droplets className="w-5 h-5 text-blue-400 mb-3" />
                        <p className={`text-xs ${mutedText}`}>Humidity</p>
                        <p className="text-xl font-semibold">
                          {weather.current.humidity}%
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl border ${borderColor} ${glassBg} backdrop-blur-md p-4`}
                      >
                        <Wind className="w-5 h-5 text-sky-400 mb-3" />
                        <p className={`text-xs ${mutedText}`}>Wind</p>
                        <p className="text-xl font-semibold">
                          {weather.current.windSpeed} km/h
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl border ${borderColor} ${glassBg} backdrop-blur-md p-4`}
                      >
                        <Sunrise className="w-5 h-5 text-orange-400 mb-3" />
                        <p className={`text-xs ${mutedText}`}>Sunrise</p>
                        <p className="text-xl font-semibold">
                          {weather.current.sunrise}
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl border ${borderColor} ${glassBg} backdrop-blur-md p-4`}
                      >
                        <Sunset className="w-5 h-5 text-orange-400 mb-3" />
                        <p className={`text-xs ${mutedText}`}>Sunset</p>
                        <p className="text-xl font-semibold">
                          {weather.current.sunset}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section
                  className={`
                    rounded-[2rem] border ${borderColor}
                    ${glassBg} backdrop-blur-md shadow-xl p-5
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">5-Day Forecast</h3>

                    <div
                      className={`flex items-center gap-1 text-xs ${softText}`}
                    >
                      <Thermometer className="w-3.5 h-3.5" />
                      Celsius
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {weather.forecast.map((day) => (
                      <div
                        key={day.date}
                        className={`
                          rounded-3xl border ${borderColor}
                          ${strongGlassBg} backdrop-blur-sm
                          p-4 text-center
                        `}
                      >
                        <p className="font-medium">{day.day}</p>

                        <div className="my-3 flex justify-center text-blue-300">
                          {getWeatherIcon(day.condition, "w-7 h-7")}
                        </div>

                        <p className="text-lg font-semibold">{day.maxTemp}°</p>

                        <p className={`text-xs ${mutedText}`}>
                          {day.minTemp}° min
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="flex flex-wrap gap-2 pt-1">
                  {POPULAR_CITIES.map((cityName) => (
                    <Button
                      key={cityName}
                      type="button"
                      variant={
                        weather.city.toLowerCase() === cityName.toLowerCase()
                          ? "default"
                          : "outline"
                      }
                      className={`rounded-2xl backdrop-blur-xl ${
                        weather.city.toLowerCase() === cityName.toLowerCase()
                          ? ""
                          : isDarkMode
                            ? "border-white/10 bg-black/20 hover:bg-white/10"
                            : "bg-white/30 hover:bg-white/50"
                      }`}
                      onClick={() => loadPopularCity(cityName)}
                      disabled={isLoading || isSearchingLocation}
                    >
                      {cityName}
                    </Button>
                  ))}
                </section>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
