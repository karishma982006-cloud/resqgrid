// RESQ-GRID API Service
// Automatically uses localhost during development
// and the same HTTPS domain in production (Render).

const getApiBase = () => {
  // Local development
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  // Production / Render
  // Frontend and backend are served from the same domain.
  return '/api';
};

const API_BASE = getApiBase();

const getHeaders = (isJson = true) => {
  const headers = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('resqgrid_token');

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'An API error occurred');
  }

  return data;
};

export const api = {
  // =========================================================
  // AUTH
  // =========================================================

  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  demoLogin: (role, departmentCode) =>
    fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        role,
        departmentCode
      })
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // REPORTS
  // =========================================================

  createReport: (body) =>
    fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  previewAnalysis: (body) =>
    fetch(`${API_BASE}/reports/preview-analysis`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getReports: () =>
    fetch(`${API_BASE}/reports`, {
      headers: getHeaders()
    }).then(handleResponse),

  getReportById: (id) =>
    fetch(`${API_BASE}/reports/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  analyzeReport: (id) =>
    fetch(`${API_BASE}/reports/${id}/analyze`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // CASES
  // =========================================================

  getCases: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return fetch(`${API_BASE}/cases${q ? `?${q}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  getCaseById: (id) =>
    fetch(`${API_BASE}/cases/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  verifyCase: (id, verified, feedbackNotes) =>
    fetch(`${API_BASE}/cases/${id}/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        verified,
        feedbackNotes
      })
    }).then(handleResponse),

  updateRecovery: (id, body) =>
    fetch(`${API_BASE}/cases/${id}/recovery`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getCaseProblems: (id) =>
    fetch(`${API_BASE}/cases/${id}/problems`, {
      headers: getHeaders()
    }).then(handleResponse),

  getCaseDependencies: (id) =>
    fetch(`${API_BASE}/cases/${id}/dependencies`, {
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // TASKS
  // =========================================================

  getTasks: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return fetch(`${API_BASE}/tasks${q ? `?${q}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  getDepartmentPriorityQueue: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return fetch(`${API_BASE}/tasks/queue${q ? `?${q}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  getTaskById: (id) =>
    fetch(`${API_BASE}/tasks/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  acceptTask: (id) =>
    fetch(`${API_BASE}/tasks/${id}/accept`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  startTask: (id) =>
    fetch(`${API_BASE}/tasks/${id}/start`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  updateTaskProgress: (id, workProgressStatus, progressNotes) =>
    fetch(`${API_BASE}/tasks/${id}/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        workProgressStatus,
        progressNotes
      })
    }).then(handleResponse),

  completeTask: (id, completionNotes, evidenceUrl) =>
    fetch(`${API_BASE}/tasks/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        completionNotes,
        evidenceUrl
      })
    }).then(handleResponse),

  rejectTask: (id, rejectionReason, customNotes) =>
    fetch(`${API_BASE}/tasks/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        rejectionReason,
        customNotes
      })
    }).then(handleResponse),

  // =========================================================
  // REASSIGNMENT & ESCALATION
  // =========================================================

  getReassignmentCandidates: (taskId) =>
    fetch(`${API_BASE}/reassignment/${taskId}/candidates`, {
      headers: getHeaders()
    }).then(handleResponse),

  reassignTask: (taskId, targetResourceId, reason) =>
    fetch(`${API_BASE}/reassignment/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        targetResourceId,
        reason
      })
    }).then(handleResponse),

  getEscalations: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return fetch(`${API_BASE}/escalations${q ? `?${q}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  resolveEscalation: (id, resolutionNotes, newAssignedTeam) =>
    fetch(`${API_BASE}/escalations/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        resolutionNotes,
        newAssignedTeam
      })
    }).then(handleResponse),

  manualEscalate: (taskId, reason, escalationLevel) =>
    fetch(`${API_BASE}/escalations/task/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        reason,
        escalationLevel
      })
    }).then(handleResponse),

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  getDepartments: () =>
    fetch(`${API_BASE}/departments`, {
      headers: getHeaders()
    }).then(handleResponse),

  getDepartmentById: (id) =>
    fetch(`${API_BASE}/departments/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // DISASTER MODE
  // =========================================================

  getDisasters: () =>
    fetch(`${API_BASE}/disasters`, {
      headers: getHeaders()
    }).then(handleResponse),

  getActiveDisaster: () =>
    fetch(`${API_BASE}/disasters/active`, {
      headers: getHeaders()
    }).then(handleResponse),

  activateDisaster: (body) =>
    fetch(`${API_BASE}/disasters/activate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deactivateDisaster: (id) =>
    fetch(`${API_BASE}/disasters/deactivate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id
      })
    }).then(handleResponse),

  // =========================================================
  // RESOURCES
  // =========================================================

  getResources: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return fetch(`${API_BASE}/resources${q ? `?${q}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  matchResource: (body) =>
    fetch(`${API_BASE}/resources/match`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  updateResourceStatus: (id, body) =>
    fetch(`${API_BASE}/resources/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  getNotifications: () =>
    fetch(`${API_BASE}/notifications`, {
      headers: getHeaders()
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // AUDIT
  // =========================================================

  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();

    return fetch(`${API_BASE}/audit${q ? `?${q}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  getCaseAudit: (caseId) =>
    fetch(`${API_BASE}/audit/cases/${caseId}`, {
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // ANALYTICS
  // =========================================================

  getDashboardAnalytics: () =>
    fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders()
    }).then(handleResponse),

  // =========================================================
  // ADMIN
  // =========================================================

  getAdminOverview: () =>
    fetch(`${API_BASE}/admin/overview`, {
      headers: getHeaders()
    }).then(handleResponse),

  updatePriorityWeights: (weights) =>
    fetch(`${API_BASE}/admin/priority-weights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        weights
      })
    }).then(handleResponse),

  createDepartment: (body) =>
    fetch(`${API_BASE}/admin/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  toggleDepartmentActive: (id) =>
    fetch(`${API_BASE}/admin/departments/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    }).then(handleResponse),

  createResource: (body) =>
    fetch(`${API_BASE}/admin/resources`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse)
};

export default api;