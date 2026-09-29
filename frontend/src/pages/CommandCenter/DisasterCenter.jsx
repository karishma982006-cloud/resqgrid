import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import {
  AlertTriangle,
  Radio,
  Users,
  Shield,
  Truck,
  HeartPulse,
  Flame,
  Search,
  HardHat,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const DisasterCenter = () => {
  const { isDisasterMode, activeDisaster, activateDisaster, deactivateDisaster } = useDisaster();

  const [resources, setResources] = useState([]);
  const [criticalTasks, setCriticalTasks] = useState([]);
  const [disasterCases, setDisasterCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recovery Phase Tracking
  const [recoveryItems, setRecoveryItems] = useState([
    { id: 1, name: 'Search & Rescue Extrication', phase: 'Response', done: true },
    { id: 2, name: 'Emergency Trauma Triage & Hospital Transport', phase: 'Response', done: true },
    { id: 3, name: 'Gas Line Rupture & Structural Fire Suppression', phase: 'Response', done: true },
    { id: 4, name: 'Arterial Emergency Corridor Debris Clearing', phase: 'Recovery', done: false },
    { id: 5, name: 'Substation & High-Voltage Grid Restoration', phase: 'Recovery', done: false },
    { id: 6, name: 'Drinking Water Tankers & Hygiene Station Setup', phase: 'Recovery', done: false },
    { id: 7, name: 'Displaced Civilian Shelter Capacity & Rations', phase: 'Recovery', done: false },
    { id: 8, name: 'Structural Engineering Damage Assessment', phase: 'Recovery', done: false }
  ]);

  const fetchDisasterDetails = async () => {
    try {
      const [resRes, taskRes, casesRes] = await Promise.all([
        api.getResources(),
        api.getTasks({ priority: 'CRITICAL' }),
        api.getCases({ mode: 'DISASTER' })
      ]);

      if (resRes.success) setResources(resRes.resources || []);
      if (taskRes.success) setCriticalTasks(taskRes.tasks || []);
      if (casesRes.success) setDisasterCases(casesRes.cases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasterDetails();
  }, [isDisasterMode]);

  const toggleRecoveryItem = (id) => {
    setRecoveryItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              MASS INCIDENT EMERGENCY COORDINATION
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              isDisasterMode ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
            }`}>
              {isDisasterMode ? 'DISASTER MODE: ACTIVE' : 'DISASTER MODE: STANDBY'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeDisaster?.title || 'Earthquake EQ-2026-001 Operations Center'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated disaster telemetry, cross-agency emergency resources, and recovery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDisasterMode ? (
            <button
              onClick={() => deactivateDisaster()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-sm transition-colors"
            >
              Transition to Normal Mode
            </button>
          ) : (
            <button
              onClick={() => activateDisaster({
                title: 'Seismic Magnitude 6.4 Urban Center Earthquake',
                disasterType: 'Earthquake'
              })}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
            >
              Activate Disaster Mode
            </button>
          )}
        </div>
      </div>

      {/* Disaster Correlation Banner (Prompt Requirement 32) */}
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-md mb-6 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-200/60 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0" />
            <div>
              <strong className="text-sm font-bold text-red-950 font-mono">
                MASTER INCIDENT: {activeDisaster?.disasterCode || 'EQ-2026-001'} (Seismic Tremor)
              </strong>
              <div className="text-xs text-red-800">
                Epicenter: {activeDisaster?.epicenter || 'District Fault Line 3 (12 km depth)'} • Affected Radius: ~25 km
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-red-900 bg-white px-2.5 py-1 rounded border border-red-200">
              47 Citizen Reports Correlated
            </span>
          </div>
        </div>

        <p className="text-xs text-red-900 leading-relaxed">
          {activeDisaster?.description || 'High-magnitude tremor causing structural collapse, trapped citizens, electrical line rupture, active ground-floor gas fire, and major road blockages across Central and South Zones.'}
        </p>
      </div>

      {/* Emergency Department Work Queues (Prompt Requirement 36) */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Specialized Disaster Operational Queues
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Search & Rescue */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-red-600" /> SEARCH & RESCUE
              </span>
              <PriorityBadge level="CRITICAL" score={98} />
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div className="font-semibold text-slate-900">#1 Trapped People — Sector 4 Plaza</div>
              <p className="text-[11px] text-slate-500">Civilians extrication under collapsed masonry.</p>
              <div className="text-[10px] text-emerald-700 font-mono">Unit: Search Squad Alpha (On-Site)</div>
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-red-600" /> MEDICAL / AMBULANCE
              </span>
              <PriorityBadge level="CRITICAL" score={95} />
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div className="font-semibold text-slate-900">#1 Severe Injuries & Mass Casualty</div>
              <p className="text-[11px] text-slate-500">Trauma triage and field paramedic stabilization.</p>
              <div className="text-[10px] text-emerald-700 font-mono">Unit: Ambulance ALS-02 (En Route)</div>
            </div>
          </div>

          {/* Fire & Rescue */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" /> FIRE & RESCUE
              </span>
              <PriorityBadge level="CRITICAL" score={92} />
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div className="font-semibold text-slate-900">#1 Active Commercial Ground Fire</div>
              <p className="text-[11px] text-slate-500">Gas piping rupture containment & thermal barrier.</p>
              <div className="text-[10px] text-emerald-700 font-mono">Unit: Fire Engine 1 Heavy (Active)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Resource Registry & Matching (Prompt Requirement 35) */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Emergency Resource Registry & Matching Engine
            </h3>
            <span className="text-[11px] text-slate-500">
              Real-time fleet availability, capability matrix, and distance dispatch.
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {resources.filter(r => r.status === 'AVAILABLE').length} of {resources.length} Available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-4">Resource Squad / Unit</th>
                <th className="py-2.5 px-4">Agency</th>
                <th className="py-2.5 px-4">Capability</th>
                <th className="py-2.5 px-4">Proximity</th>
                <th className="py-2.5 px-4">Workload</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Dispatch Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resources.map((res) => (
                <tr key={res._id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{res.name}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">{res.departmentCode}</td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {Array.isArray(res.capabilities) ? res.capabilities.join(', ') : 'Standard'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 font-mono">{res.distanceKm || 4.2} km</td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {res.activeTaskCount || 0} active incidents
                  </td>
                  <td className="py-2.5 px-4">
                    <StatusBadge status={res.status} />
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[11px]">
                    {res.status === 'AVAILABLE' ? (
                      <span className="text-emerald-700 font-semibold">✓ Recommended Ready</span>
                    ) : (
                      <span className="text-slate-400">Engaged on-site</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recovery Phase Tracker (Prompt Requirement 40) */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm font-sans mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Post-Disaster Pipeline</span>
            <h3 className="text-sm font-bold text-slate-900">
              Recovery Phase & Long-Term Restoration Tracking
            </h3>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            Emergency Response → Recovery → Municipal Normalization
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {recoveryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleRecoveryItem(item.id)}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                item.done
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold">{item.name}</span>
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block flex-shrink-0"></span>
                )}
              </div>
              <span className="text-[10px] opacity-75 font-mono">
                Phase: {item.phase} • {item.done ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisasterCenter;
