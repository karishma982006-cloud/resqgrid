import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';
import { MapPin, List, Eye } from 'lucide-react';

// Fix Leaflet's default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin markers for priority levels
const createMarkerIcon = (priority = 'MEDIUM') => {
  const colors = {
    CRITICAL: '#dc2626', // Red
    HIGH: '#d97706',     // Orange
    MEDIUM: '#ca8a04',   // Yellow
    LOW: '#16a34a'       // Green
  };
  const color = colors[priority.toUpperCase()] || colors.MEDIUM;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28" stroke="#ffffff" stroke-width="1.5">
    <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 14 1-1 8-8.75 8-14 0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

export const IncidentMap = ({ cases = [], height = '450px' }) => {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const defaultCenter = [12.9716, 77.5946]; // Bangalore central demo coordinate

  return (
    <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm">
      {/* Map Control Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Operational Incident Grid
          </span>
          <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            {cases.length} Geo-tagged Incidents
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Legend */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-600 mr-2">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> High</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-600 inline-block"></span> Medium</span>
          </div>

          <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded font-medium ${
                viewMode === 'map' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded font-medium ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Render Leaflet Map or Fallback List */}
      {viewMode === 'map' ? (
        <div style={{ height }} className="relative w-full z-0">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {cases.map((c) => {
              const lat = c.location?.lat || defaultCenter[0];
              const lng = c.location?.lng || defaultCenter[1];
              const priority = c.priorityLevel || c.severity || 'MEDIUM';

              return (
                <Marker
                  key={c.caseId || c._id}
                  position={[lat, lng]}
                  icon={createMarkerIcon(priority)}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs max-w-[220px]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <strong className="font-bold text-slate-900">{c.caseId}</strong>
                        <PriorityBadge level={priority} />
                      </div>
                      <p className="text-slate-700 line-clamp-2 mb-1.5">{c.description}</p>
                      <div className="text-[11px] text-slate-500 mb-2">
                        <span className="font-medium text-slate-700">Location:</span> {c.location?.address || 'Metropolitan Area'}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <StatusBadge status={c.status} />
                        <Link
                          to={`/cases/${c.caseId}`}
                          className="text-blue-700 font-semibold text-[11px] hover:underline"
                        >
                          View Case →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        <div className="p-4 overflow-y-auto max-h-[450px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase text-[10px]">
                <th className="py-2 px-3">Case ID</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Summary</th>
                <th className="py-2 px-3">Departments</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.caseId || c._id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{c.caseId}</td>
                  <td className="py-2.5 px-3">
                    <PriorityBadge level={c.priorityLevel || c.severity} score={c.priorityScore} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-[160px] truncate">
                    {c.location?.address || 'Central Ward'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">{c.description}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {Array.isArray(c.departments) ? c.departments.join(', ') : 'Multi-agency'}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      to={`/cases/${c.caseId}`}
                      className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IncidentMap;
