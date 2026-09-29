import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, PlusCircle, ArrowRight } from 'lucide-react';

export const CitizenReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.getReports();
        if (res.success) setReports(res.reports || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <Link to="/citizen" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Reports & Tracking</h1>
        </div>
        <Link
          to="/citizen/report"
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> New Report
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No incident reports found.{' '}
            <Link to="/citizen/report" className="text-blue-700 hover:underline font-semibold ml-1">
              Submit your first report
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-4">Report Code</th>
                <th className="py-2.5 px-4">Submitted Date</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Incident Description</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <tr key={rep._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{rep.reportCode}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{rep.location?.address}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{rep.description}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rep.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {rep.caseId ? (
                      <Link
                        to={`/citizen/track/${rep.caseId}`}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        Track Case {rep.caseId} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-slate-400">Processing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CitizenReports;
