import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDisaster } from '../../context/DisasterContext';
import api from '../../services/api';
import DependencyList from '../../components/DependencyList';
import { ArrowLeft, GitMerge, AlertTriangle } from 'lucide-react';

export const DepartmentDependencies = () => {
  const { user } = useAuth();
  const { isDisasterMode, activeDisaster } = useDisaster();
  const [tasks, setTasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const [taskRes, casesRes] = await Promise.all([
          api.getTasks({ departmentCode: user?.departmentCode }),
          api.getCases()
        ]);
        if (taskRes.success) setTasks(taskRes.tasks || []);

        // Aggregate dependencies across all active cases
        const allDeps = [];
        if (casesRes.success && casesRes.cases) {
          for (const c of casesRes.cases) {
            const dRes = await api.getCaseDependencies(c.caseId);
            if (dRes.success && dRes.dependencies) {
              allDeps.push(...dRes.dependencies);
            }
          }
        }
        setDependencies(allDeps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeps();
  }, [user]);

  // Filter dependencies relevant to current department
  const relevantDeps = dependencies.filter(d => 
    d.blockingDept === user?.departmentName ||
    d.dependentDept === user?.departmentName ||
    tasks.some(t => t._id === d.blockingTaskId || t._id === d.dependentTaskId)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Emergency Alert Banner when Disaster Mode is active */}
      {isDisasterMode && (
        <div className="mb-6 p-4 bg-red-700 text-white rounded-md flex items-center justify-between text-xs font-semibold shadow-sm border border-red-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm tracking-wide">
                🚨 DISASTER PROTOCOL ACTIVE — {activeDisaster?.disasterCode || 'EQ-2026-001'}
              </div>
              <div className="text-red-100 text-xs font-normal mt-0.5">
                Upstream safety dependencies (gas/electrical isolation, debris removal) must be cleared immediately.
              </div>
            </div>
          </div>
          <span className="bg-red-900/80 text-amber-200 text-[10px] px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
            EMERGENCY BOTTLENECK PRIORITY
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/department" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            {isDisasterMode ? (
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded animate-pulse">
                🚨 DISASTER PRIORITY ACTIVE
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                NORMAL MUNICIPAL OPERATIONS
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Department Inter-Dependencies</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational bottlenecks, sequence constraints, and multi-agency handoffs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading dependencies...</div>
      ) : (
        <div className="space-y-6">
          <DependencyList dependencies={relevantDeps.length > 0 ? relevantDeps : dependencies} tasks={tasks} />
        </div>
      )}
    </div>
  );
};

export default DepartmentDependencies;
