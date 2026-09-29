import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, AlertTriangle, Layers, GitMerge, Activity, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user } = useAuth();

  const workflowSteps = [
    {
      num: '01',
      title: 'REPORT',
      desc: 'Citizen explains the situation naturally without needing to know which department handles what.'
    },
    {
      num: '02',
      title: 'UNDERSTAND',
      desc: 'The triage engine decomposes complex multi-hazard reports into discrete problem entities.'
    },
    {
      num: '03',
      title: 'PRIORITIZE',
      desc: 'Multi-factor dynamic scoring calculates priority based on life safety, public impact, and dependencies.'
    },
    {
      num: '04',
      title: 'COORDINATE',
      desc: 'Dispatches dedicated work orders to agencies, resolves dependencies, and manages reassignments.'
    },
    {
      num: '05',
      title: 'RESOLVE & AUDIT',
      desc: 'Frontline crews submit proof, citizen verifies on-site resolution, and all actions persist in an immutable audit trail.'
    }
  ];

  return (
    <div className="font-sans text-slate-800">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Municipal Operations & Disaster Response Coordination
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            RESQ-GRID
            <span className="block text-2xl sm:text-3xl font-semibold text-slate-600 mt-2 font-mono">
              Unified Public Service & Disaster Coordination
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Report problems once. Connect responsibilities. Coordinate response.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/citizen/report"
              className="px-6 py-3 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              REPORT A PROBLEM <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-md bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-sm transition-colors"
            >
              COMMAND CENTER LOGIN
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Architecture</h2>
          <h3 className="text-2xl font-bold text-slate-900">How RESQ-GRID Solves Multi-Agency Bottlenecks</h3>
          <p className="text-sm text-slate-500 mt-2">
            Eliminates siloed department dispatch by maintaining a single master case relationship across the entire operational lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-5 bg-white border border-slate-200 rounded-md shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="font-mono text-xs font-bold text-blue-700 mb-2">{step.num}</div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">{step.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Demo Scenarios Showcase */}
      <section className="bg-slate-100 border-t border-b border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-slate-900">Multi-Agency Operational Scenarios</h3>
            <p className="text-xs text-slate-600 mt-1">Cross-department workflows for municipal maintenance and disaster coordination.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario 1 */}
            <div className="p-6 bg-white border border-slate-200 rounded-md shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  NORMAL MODE
                </span>
                <span className="text-xs font-mono text-slate-500">Case RG-1042</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">
                Multi-Hazard Municipal Breakdown
              </h4>
              <blockquote className="text-xs text-slate-600 bg-slate-50 border-l-2 border-blue-600 p-2.5 rounded-r mb-3 italic">
                "There is a damaged electrical pole near my street. The drainage is blocked, water is accumulating on the road, the road is damaged and vehicles cannot cross properly."
              </blockquote>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Decomposes into <strong>4 distinct department problems</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Calculates Electricity as <strong>CRITICAL (blocks road excavation)</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>PWD rejection triggers automatic reassignment to Team B</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>On completion, citizen conducts on-site verification</span>
                </li>
              </ul>
              <Link
                to="/cases/RG-1042"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                Inspect Case RG-1042 →
              </Link>
            </div>

            {/* Scenario 2 */}
            <div className="p-6 bg-white border border-slate-200 rounded-md shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  DISASTER MODE
                </span>
                <span className="text-xs font-mono text-slate-500">Event EQ-2026-001</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">
                Urban Earthquake & Infrastructure Breach
              </h4>
              <blockquote className="text-xs text-slate-600 bg-slate-50 border-l-2 border-red-600 p-2.5 rounded-r mb-3 italic">
                47 citizen reports consolidated into single master earthquake disaster event with mass casualty triage.
              </blockquote>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>Search & Rescue extrication prioritized at <strong>Score 98 (CRITICAL)</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>Coordinates Ambulances, Fire Engines, and Relief Shelters</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>Detects resource responsibility gaps and auto-escalates to Command</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>Seamless transition from emergency response to post-disaster recovery</span>
                </li>
              </ul>
              <Link
                to="/command/disaster"
                className="text-xs font-semibold text-red-700 hover:text-red-900 inline-flex items-center gap-1"
              >
                Inspect Disaster Center →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-700 font-semibold">RESQ-GRID</strong> — Unified Public Service & Disaster Coordination Platform
          </div>
          <div>
            Enterprise Municipal Platform • Live Operations Engine
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
