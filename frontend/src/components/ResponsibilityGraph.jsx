import React from 'react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export const ResponsibilityGraph = ({ caseId, problems = [], tasks = [] }) => {
  if (!problems || problems.length === 0) {
    return (
      <div className="p-4 border border-slate-200 rounded-md bg-white text-sm text-slate-500">
        No decomposed problems recorded for this case.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-md bg-white p-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsibility Architecture</span>
          <h4 className="text-base font-semibold text-slate-800">Master Case: {caseId}</h4>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {problems.length} Problems → {tasks.length} Assigned Department Units
        </span>
      </div>

      {/* Tree Visualization with clean boxes and connecting border lines */}
      <div className="space-y-4">
        {problems.map((prob, idx) => {
          const matchingTask = tasks.find(t => 
            t.problemId === prob._id || 
            t.category === prob.category || 
            t.departmentCode === prob.departmentCode
          );

          const isLast = idx === problems.length - 1;

          return (
            <div key={prob._id || idx} className="relative pl-6">
              {/* Vertical connector line */}
              <div
                className="absolute left-2.5 top-0 w-0.5 bg-slate-300"
                style={{ bottom: isLast ? '50%' : '-16px' }}
              ></div>
              {/* Horizontal branch line */}
              <div className="absolute left-2.5 top-6 w-3.5 h-0.5 bg-slate-300"></div>

              <div className="p-3.5 border border-slate-200 rounded-md bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      P-{prob.problemNumber || idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">{prob.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge level={prob.severity || prob.priorityLevel} score={prob.priorityScore} showScore={true} />
                    {matchingTask && <StatusBadge status={matchingTask.status} />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-2.5">
                  {prob.description}
                </p>

                {/* Sub-node: Responsible Agency & Assigned Crew */}
                <div className="bg-white border border-slate-200 rounded p-2.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">Mapped Department: </span>
                    <span className="font-semibold text-slate-900">{prob.departmentName || prob.departmentCode}</span>
                    {matchingTask?.assignedTeamName && (
                      <span className="text-slate-500 ml-2">
                        • Assigned Unit: <strong className="text-slate-700">{matchingTask.assignedTeamName}</strong>
                      </span>
                    )}
                  </div>
                  {matchingTask?.blockedBy && (
                    <span className="inline-flex items-center text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                      Waiting for: {matchingTask.blockedBy.departmentName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsibilityGraph;
