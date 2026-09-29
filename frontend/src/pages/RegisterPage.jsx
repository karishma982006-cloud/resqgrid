import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    areaName: 'Central District',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      areaName: 'Central District'
    }
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');
    setGpsLoading(true);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: {
            lat: latitude,
            lng: longitude,
            areaName: prev.areaName
          }
        }));

        // Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
              const city = data.address?.city || data.address?.town || data.address?.county || '';
              const fullAddr = [road, city].filter(Boolean).join(', ') || data.display_name;
              setFormData(prev => ({
                ...prev,
                address: fullAddr
              }));
              setGpsSuccess(true);
              setGpsLoading(false);
              return;
            }
          }
        } catch (e) {
          // ignore network error for geocoding
        }

        // Fallback GPS coordinate address
        setFormData(prev => ({
          ...prev,
          address: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        }));
        setGpsSuccess(true);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setError(`GPS error: ${err.message || 'Could not retrieve your location. Please allow browser location access.'}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address || 'Detected Location',
        location: {
          lat: formData.location?.lat || 12.9716,
          lng: formData.location?.lng || 77.5946,
          areaName: formData.areaName
        }
      });
      navigate('/citizen');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Registration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register to report municipal and disaster incidents and track live resolution.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Rohan Sharma"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rohan@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* GPS Location & Street Address Feature (Requested by User) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Street Address</label>
                <button
                  type="button"
                  onClick={handleGetGPS}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors shadow-2xs"
                  title="Detect your exact location via GPS"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3 text-blue-700" />
                      <span>📍 Use Current Location (GPS)</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Click 'Use Current Location' or type address"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
              />

              {gpsSuccess && (
                <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>GPS Acquired: <strong>{formData.location?.lat.toFixed(4)}, {formData.location?.lng.toFixed(4)}</strong></span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">Geo-tagged</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ward / District Area</label>
              <select
                name="areaName"
                value={formData.areaName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-white"
              >
                <option value="Central District">Central District</option>
                <option value="North Ward">North Ward</option>
                <option value="South-East Zone">South-East Zone</option>
                <option value="West Industrial Suburb">West Industrial Suburb</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded shadow-sm transition-colors mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="text-blue-700 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
