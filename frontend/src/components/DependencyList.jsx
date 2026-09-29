import React from 'react';
import { ArrowDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DependencyList = ({ dependencies = [], tasks = [] }) => {
  if (!dependencies || dependencies.length === 0) {
    return (
      <div className="p-4 border border-slate-200 rounded-md bg-white text-xs text-slate-500">
        No active dependency bottlenecks recorded. Tasks can proceed independently.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-md bg-white p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dependency Pipeline</span>
          <h4 className="text-sm font-semibold text-slate-800">Operational Preconditions & Sequence</h4>
        </div>
      </div>

      <div className="space-y-3">
        {dependencies.map((dep, idx) => {
          const blockingTask = tasks.find(t => t._id === dep.blockingTaskId);
          const dependentTask = tasks.find(t => t._id === dep.dependentTaskId);
          const isSatisfied = blockingTask?.status === 'COMPLETED';

          return (
            <div
              key={dep._id || idx}
              className={`p-3.5 border rounded-md text-xs ${
                isSatisfied
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-amber-200 bg-amber-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-1.5 font-medium">
                  {isSatisfied ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Prerequisite Completed
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Prerequisite Active (Blocking Downstream)
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500">Step {idx + 1}</span>
              </div>

              {/* Visual flow */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-medium text-slate-800 my-2 bg-white/70 p-2.5 rounded border border-slate-200">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Upstream Prerequisite</span>
                  <span className="font-semibold text-slate-900">{dep.blockingDept || 'Upstream Unit'}</span>: {dep.blockingTaskName}
                  {blockingTask && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border text-slate-600">
                      {blockingTask.status}
                    </span>
                  )}
                </div>

                <div className="text-slate-400 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 sm:-rotate-90 text-slate-500" />
                </div>

                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Blocked Dependent Task</span>
                  <span className="font-semibold text-slate-900">{dep.dependentDept || 'Downstream Unit'}</span>: {dep.dependentTaskName}
                  {dependentTask && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border text-slate-600">
                      {dependentTask.status}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-600 mt-1 italic">
                Reason: {dep.reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DependencyList;
