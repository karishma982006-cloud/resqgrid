import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  MapPin,
  Users,
  Camera,
  Upload,
  X,
  Crosshair,
  Navigation,
  Image as ImageIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Custom Pin Marker Icon
const incidentPinIcon = L.divIcon({
  className: 'custom-incident-pin',
  html: `<div style="background-color:#2563eb; width:30px; height:30px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2.5px solid #ffffff; box-shadow:0 3px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;">
    <div style="width:10px; height:10px; background-color:#ffffff; border-radius:50%; transform:rotate(45deg);"></div>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

// Map event handler component for clicking and dragging
const LocationMarker = ({ position, setPosition, onLocationChange }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
      map.panTo([lat, lng]);
    }
  });

  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onLocationChange(lat, lng);
        }
      }
    }),
    [onLocationChange, setPosition]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={incidentPinIcon}
    />
  );
};

// Pan helper
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom() || 15);
    }
  }, [center]);
  return null;
};

export const ReportProblem = () => {
  const { user } = useAuth();
  const { isDisasterMode, activeDisaster } = useDisaster();
  const navigate = useNavigate();

  // Location State
  const initialLat = user?.location?.lat || 12.9716;
  const initialLng = user?.location?.lng || 77.5946;
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [address, setAddress] = useState(user?.address || 'Main Commercial Road & 4th Cross, Indiranagar');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [affectedPeople, setAffectedPeople] = useState(1);
  const [immediateDanger, setImmediateDanger] = useState(false);
  const [severityHint, setSeverityHint] = useState('MEDIUM');

  // Photo Upload State (Feature Requested by User)
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const fileInputRef = useRef(null);

  // Triage / Analysis Screen State
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [createdCaseId, setCreatedCaseId] = useState(null);
  const [error, setError] = useState('');

  const analysisSteps = [
    'Reading natural language incident report',
    'Identifying discrete infrastructural & safety problems',
    'Identifying affected municipal services',
    'Mapping responsible frontline departments & capabilities',
    'Evaluating safety risk hazards & public impact',
    'Calculating multi-factor dynamic priority scores',
    'Analyzing structural dependencies & sequence constraints'
  ];

  // Reverse Geocoding: Updates address when map marker moves
  const handleLocationChange = async (lat, lng) => {
    setGeocodingLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
          const city = data.address?.city || data.address?.town || data.address?.county || '';
          const fullAddr = [road, city].filter(Boolean).join(', ') || data.display_name;
          setAddress(fullAddr);
          setGeocodingLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore network errors
    }
    setAddress(`Pinned Spot (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    setGeocodingLoading(false);
  };

  // GPS "Use Current Location" (Feature Requested by User)
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition([lat, lng]);
        setGpsLoading(false);
        await handleLocationChange(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        setError(`GPS error: ${err.message || 'Could not retrieve location. Please check browser permissions.'}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Image File Upload Handler (Feature Requested by User)
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image file must be under 20MB.');
      return;
    }

    setImageFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide an incident description.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setCurrentStepIndex(0);
    setAnalysisResult(null);

    try {
      // 1. Submit Report to Backend with Geo & Uploaded Image
      const repRes = await api.createReport({
        description,
        address,
        latitude: position[0],
        longitude: position[1],
        affectedPeople,
        immediateDanger,
        severityHint,
        imageUrl: imageUrl || null,
        mode: isDisasterMode ? 'DISASTER' : 'NORMAL'
      });

      const reportId = repRes.report._id;

      // 2. Animate the 7 Analysis steps
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise((r) => setTimeout(r, 260));
      }

      // 3. Trigger Backend Decomposition & Master Case Generation
      const caseRes = await api.analyzeReport(reportId);

      setAnalysisResult({
        report: repRes.report,
        case: caseRes.case,
        problems: caseRes.problems,
        tasks: caseRes.tasks
      });
      setCreatedCaseId(caseRes.case.caseId);
    } catch (err) {
      setError(err.message || 'Report triage failed. Please retry.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="pb-4 border-b border-slate-200 mb-6">
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Public Incident Intake</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Report a Problem</h1>
        <p className="text-xs text-slate-500 mt-1">
          Describe the situation in plain language. RESQ-GRID automatically decomposes problems, assigns responsible departments, and calculates response priority.
        </p>
      </div>

      {isDisasterMode && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>
            <strong>ACTIVE DISASTER MODE:</strong> This report will be prioritized under emergency disaster operations ({activeDisaster?.disasterCode || 'EQ-2026-001'}).
          </span>
        </div>
      )}

      {/* Analysis Screen Modal / View */}
      {analyzing ? (
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm font-sans">
          {!analysisResult ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-50 border border-blue-200 text-blue-700 mb-4">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">ANALYZING REPORT</h2>
              <p className="text-xs text-slate-500 mb-6">
                Decomposing report and calculating inter-departmental priorities...
              </p>

              <div className="max-w-md mx-auto space-y-2 text-left text-xs">
                {analysisSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2 rounded border transition-colors ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                          : isCurrent
                          ? 'border-blue-300 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-blue-700 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded mb-4 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Problem Analysis Complete: Master Case Generated</span>
              </div>

              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-700">
                      {analysisResult.case?.caseId}
                    </span>
                    <PriorityBadge level={analysisResult.case?.priorityLevel} score={analysisResult.case?.priorityScore} showScore={true} />
                  </div>
                  <span className="text-xs text-slate-500">
                    {analysisResult.problems?.length} discrete problems identified
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-sans italic">
                  "{analysisResult.report?.description}"
                </p>

                {/* Show uploaded image if present */}
                {analysisResult.report?.imageUrl && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">Attached Incident Photo:</span>
                    <img
                      src={analysisResult.report.imageUrl}
                      alt="Incident Evidence"
                      className="max-h-40 rounded border border-slate-300 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Decomposed Problems Grid */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Decomposed Problems & Mapped Departments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.problems?.map((prob, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded shadow-xs text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-slate-900">{prob.category}</span>
                        <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">
                          {prob.departmentCode}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{prob.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 mb-5">
                <strong className="font-semibold">Coordinated Response: </strong>
                All responsible departments have been alerted in their respective priority work orders with dependency locking enabled.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate(`/citizen/track/${createdCaseId}`)}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  TRACK THIS CASE IN REAL TIME <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Report Form */
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Auto-filled User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
              <div>
                <span className="text-slate-500 block">Reporting Citizen:</span>
                <span className="font-semibold text-slate-900">{user?.name || 'Anonymous Citizen'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Contact:</span>
                <span className="font-semibold text-slate-900">{user?.phone || 'Not specified'}</span>
              </div>
            </div>

            {/* Location Section with GPS & Interactive Map (Feature Requested by User) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>Incident Location / Street Address</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGetGPS}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors shadow-2xs"
                    title="Detect exact GPS location"
                  >
                    {gpsLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        <span>Acquiring GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3 text-blue-700" />
                        <span>📍 Use Current Location (GPS)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative mb-2">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or move pin on map below..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none pr-10"
                />
                {geocodingLoading && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>

              {/* Interactive Map: Click or Drag Pin to Change Location */}
              <div className="border border-slate-300 rounded-md overflow-hidden bg-slate-100">
                <div className="p-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-blue-700" />
                    <strong>Map Pinning:</strong> Click map or drag the blue marker to update address.
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
                  </span>
                </div>

                <div className="h-56 w-full relative z-0">
                  <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap center={position} />
                    <LocationMarker
                      position={position}
                      setPosition={setPosition}
                      onLocationChange={handleLocationChange}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Description (Describe what you see naturally)
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in plain words (e.g. fallen tree blocking traffic, sparking transformer, road cave-in)..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none leading-relaxed"
              ></textarea>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Do not worry about selecting departments. RESQ-GRID automatically decomposes problems and maps them.
              </span>
            </div>

            {/* Upload Photo of the Problem (Feature Requested by User) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-700" />
                <span>Upload Problem Photo / Evidence (Optional)</span>
              </label>

              {!imageUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-md p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      Click to choose or take a photo from your device
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP (Max 20MB)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Problem Preview"
                      className="w-16 h-16 object-cover rounded border border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 truncate max-w-xs">
                        {imageFileName || 'Incident Photo Attached'}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Photo ready for upload
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Severity & Danger Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" /> Estimated People Affected
                </label>
                <input
                  type="number"
                  min="1"
                  value={affectedPeople}
                  onChange={(e) => setAffectedPeople(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Immediate Danger Present?
                </label>
                <select
                  value={immediateDanger ? 'yes' : 'no'}
                  onChange={(e) => setImmediateDanger(e.target.value === 'yes')}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                >
                  <option value="no">NO — Non-Life Threatening</option>
                  <option value="yes">YES — Active Safety Threat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citizen Severity Assessment
                </label>
                <select
                  value={severityHint}
                  onChange={(e) => setSeverityHint(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                >
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded shadow-sm transition-colors mt-4 flex items-center justify-center gap-2"
            >
              SUBMIT REPORT & INITIATE TRIAGE
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReportProblem;
