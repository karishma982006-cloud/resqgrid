import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import IncidentMap from '../../components/IncidentMap';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const CommandMap = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const res = await api.getCases();
      if (res.success) setCases(res.cases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <Link to="/command" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Hub
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">City Incident GIS Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial visualization of multi-department incidents and emergency units.
          </p>
        </div>

        <button
          onClick={fetchCases}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded bg-white"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Coordinates
        </button>
      </div>

      <IncidentMap cases={cases} height="600px" />
    </div>
  );
};

export default CommandMap;
