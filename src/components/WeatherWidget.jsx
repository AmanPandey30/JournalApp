import React, { useState, useEffect } from 'react';
import api from '../api/api';

const WEATHER_ICONS = {
  'Clear': '☀️', 'Sunny': '☀️', 'Partly cloudy': '⛅', 'Partly Cloudy': '⛅',
  'Cloudy': '☁️', 'Overcast': '☁️', 'Mist': '🌫️', 'Fog': '🌫️', 'Haze': '🌫️',
  'Rain': '🌧️', 'Drizzle': '🌦️', 'Light rain': '🌦️', 'Heavy rain': '🌧️',
  'Thunderstorm': '⛈️', 'Thunder': '⛈️', 'Snow': '❄️', 'Blizzard': '🌨️',
  'Hot': '🔥', 'Wind': '🌬️',
};

function getWeatherIcon(description) {
  if (!description) return '🌡️';
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (description.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '🌡️';
}

function WeatherWidget() {
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    // Step 1 — Request location from the browser
    if (!navigator.geolocation) {
      fetchWeather('Mumbai'); // fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Step 2 — Send lat,lon to the backend
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        setGeoError('Location access denied');
        fetchWeather('Mumbai'); // fallback on denial
      },
      { timeout: 8000, maximumAge: 300000 } // 5 min cache
    );
  }, []);

  const fetchWeather = async (cityOrCoords) => {
    setLoading(true);
    try {
      const res = await api.get(`/user/weather?city=${encodeURIComponent(cityOrCoords)}`);
      setWeather(res.data);
    } catch {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 animate-pulse">
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">📍 Weather</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="h-8 w-8 bg-gray-700 rounded-full" />
          <div className="h-8 w-20 bg-gray-700 rounded-lg" />
        </div>
        <div className="h-3 bg-gray-700 rounded mt-2 w-3/4" />
        <div className="h-3 bg-gray-800 rounded mt-1 w-1/2" />
      </div>
    );
  }

  // ── Error / Unavailable ─────────────────────────────────────────────
  if (!weather || weather.error) {
    return (
      <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800">
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">📍 Weather</p>
        <p className="text-gray-600 text-xs mt-2">
          {geoError ? `${geoError} — showing Mumbai` : 'Weather data unavailable'}
        </p>
      </div>
    );
  }

  const icon = getWeatherIcon(weather.description);

  // ── Weather Card ────────────────────────────────────────────────────
  return (
    <div className="glass rounded-2xl p-4 border border-blue-500/15 hover:border-blue-500/30 transition-all">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[9px] text-blue-400/60 font-bold uppercase tracking-widest">📍 Current Location</span>
      </div>

      {/* Main temp */}
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-float">{icon}</span>
        <div>
          <p className="text-2xl font-black text-white leading-none">{weather.temperature}°<span className="text-blue-400">C</span></p>
          <p className="text-blue-300/50 text-[10px] mt-0.5">Feels {weather.feelsLike}°C</p>
        </div>
      </div>

      {/* City & description */}
      <p className="text-gray-300 font-semibold text-sm mt-3">{weather.city}</p>
      <p className="text-gray-600 text-xs mt-0.5">{weather.description}</p>

      {geoError && (
        <p className="text-yellow-600/60 text-[9px] mt-2 italic">⚠️ {geoError}</p>
      )}
    </div>
  );
}

export default WeatherWidget;
