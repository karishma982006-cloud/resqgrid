import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2, Sparkles, MapPin, Users } from 'lucide-react';

export const ReportProblem = () => {
  const { user } = useAuth();
  const { isDisasterMode, activeDisaster } = useDisaster();
  const navigate = useNavigate();

  // Form State
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(user?.address || 'Main Commercial Road & 4th Cross, Indiranagar');
  const [affectedPeople, setAffectedPeople] = useState(25);
  const [immediateDanger, setImmediateDanger] = useState(true);
  const [severityHint, setSeverityHint] = useState('HIGH');
  const [imageUrl, setImageUrl] = useState('');

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

  // Quick Demo Preset Fillers
  const fillScenarioNormal = () => {
    setDescription('There is a damaged electrical pole near my street. The drainage is blocked, water is accumulating on the road, the road is damaged and vehicles cannot cross.');
    setAddress('Main Commercial Road & 4th Cross, Indiranagar');
    setAffectedPeople(45);
    setImmediateDanger(true);
    setSeverityHint('HIGH');
  };

  const fillScenarioDisaster = () => {
    setDescription('Earthquake hit our sector: building partially collapsed, people trapped under rubble, 5 individuals injured and bleeding, active ground floor gas fire, and road blocked by heavy concrete debris.');
    setAddress('Sector 4 Commercial Plaza, East District');
    setAffectedPeople(120);
    setImmediateDanger(true);
    setSeverityHint('CRITICAL');
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
      // 1. Submit Report to Backend
      const repRes = await api.createReport({
        description,
        address,
        latitude: 12.9716,
        longitude: 77.5946,
        affectedPeople,
        immediateDanger,
        severityHint,
        imageUrl,
        mode: isDisasterMode ? 'DISASTER' : 'NORMAL'
      });

      const reportId = repRes.report._id;

      // 2. Animate the 7 Analysis steps for realism & clarity
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStepIndex(i);
        await new Promise((r) => setTimeout(r, 280));
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

      {/* Analysis Screen Modal / View (Prompt Requirement 11) */}
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
                          : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 inline-block flex-shrink-0"></span>
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ANALYSIS COMPLETE
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    Master Case Generated: {analysisResult.case?.caseId}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Overall Priority</span>
                  <PriorityBadge level={analysisResult.case?.priorityLevel} score={analysisResult.case?.priorityScore} showScore={true} />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Decomposed Problems & Mapped Responsibilities ({analysisResult.problems?.length})
                </h4>
                <div className="space-y-2.5">
                  {analysisResult.problems?.map((prob, i) => (
                    <div key={i} className="p-3 border border-slate-200 rounded bg-slate-50 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900">
                          Problem {i + 1}: {prob.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">{prob.departmentName}</span>
                          <PriorityBadge level={prob.severity || prob.priorityLevel} score={prob.priorityScore} />
                        </div>
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
          {/* Preset Buttons for Easy Hackathon Demo Testing */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
            <span className="font-semibold text-slate-700 block mb-2">
              Demo Presets (1-Click Fillers):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillScenarioNormal}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-600 hover:text-blue-700 rounded text-slate-700 font-medium transition-colors"
              >
                Fill Demo Case RG-1042 (Electrical + Drainage + Road + Traffic)
              </button>
              <button
                type="button"
                onClick={fillScenarioDisaster}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-red-600 hover:text-red-700 rounded text-slate-700 font-medium transition-colors"
              >
                Fill Earthquake Disaster Report (Search & Rescue, Medical, Fire)
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Incident Location / Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, nearest landmark, cross road..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Description (Describe what you see naturally)
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: There is a damaged electrical pole near my street. The drainage is blocked, water is accumulating on the road, the road is damaged and vehicles cannot cross..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 outline-none leading-relaxed"
              ></textarea>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Do not worry about selecting departments. RESQ-GRID automatically decomposes problems and maps them.
              </span>
            </div>

            {/* Optional Details */}
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
                  <option value="yes">YES — Active Safety Threat</option>
                  <option value="no">NO — Non-Life Threatening</option>
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
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
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
