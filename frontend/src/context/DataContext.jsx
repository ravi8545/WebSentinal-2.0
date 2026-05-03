import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  AI_SUMMARY,
  DASHBOARD_STATS,
  INTEGRATIONS_LIST,
  RECENT_ALERTS,
  REPORT_BARS,
  REPORT_KPIS,
  RESPONSE_TIMES,
  STATUS_INCIDENTS,
  STATUS_PAGE_SERVICES,
  UPTIME_BREAKDOWN,
} from '../utils/dummyData.js';
import { useAuth } from './AuthContext.jsx';
import {
  createWebsite as apiCreateWebsite,
  deleteWebsite as apiDeleteWebsite,
  listWebsites as apiListWebsites,
  updateWebsite as apiUpdateWebsite,
} from '../services/websiteService.js';
import {
  listAlerts as apiListAlerts,
  markAllAlertsRead as apiMarkAllRead,
} from '../services/alertService.js';
import { listLogs as apiListLogs } from '../services/logService.js';
import {
  fetchDashboard as apiFetchDashboard,
  fetchReports as apiFetchReports,
} from '../services/reportService.js';
import {
  listIntegrations as apiListIntegrations,
  connectEmailIntegration as apiConnectEmail,
  disconnectEmailIntegration as apiDisconnectEmail,
} from '../services/integrationService.js';

const DataContext = createContext(null);

const REFRESH_INTERVAL_MS = 30_000;

function alertToNotification(alert) {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    time: alert.time,
    tone: alert.tone,
    read: Boolean(alert.read),
  };
}

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [websites, setWebsites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [integrations, setIntegrations] = useState(INTEGRATIONS_LIST);

  const [dashboard, setDashboard] = useState({
    stats: DASHBOARD_STATS,
    uptimeBreakdown: UPTIME_BREAKDOWN,
    uptimePercent: 100,
    responseTimes: RESPONSE_TIMES,
    recentAlerts: RECENT_ALERTS,
    activityLogs: [],
    aiSummary: AI_SUMMARY,
  });
  const [reports, setReports] = useState({
    reportKpis: REPORT_KPIS,
    reportBars: REPORT_BARS,
    statusServices: STATUS_PAGE_SERVICES,
    statusIncidents: STATUS_INCIDENTS,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const [siteRes, alertRes, logRes, dashRes, reportRes, intRes] = await Promise.allSettled([
        apiListWebsites(),
        apiListAlerts(),
        apiListLogs(),
        apiFetchDashboard(),
        apiFetchReports(),
        apiListIntegrations(),
      ]);

      if (siteRes.status === 'fulfilled') setWebsites(siteRes.value);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value);
      if (logRes.status === 'fulfilled') setLogs(logRes.value);
      if (intRes.status === 'fulfilled' && Array.isArray(intRes.value)) {
        setIntegrations(intRes.value);
      }
      if (dashRes.status === 'fulfilled') {
        setDashboard({
          stats: dashRes.value.stats || DASHBOARD_STATS,
          uptimeBreakdown: dashRes.value.uptimeBreakdown || UPTIME_BREAKDOWN,
          uptimePercent:
            typeof dashRes.value.uptimePercent === 'number'
              ? dashRes.value.uptimePercent
              : 100,
          responseTimes: dashRes.value.responseTimes || RESPONSE_TIMES,
          recentAlerts: dashRes.value.recentAlerts || RECENT_ALERTS,
          activityLogs: dashRes.value.activityLogs || [],
          aiSummary: dashRes.value.aiSummary || AI_SUMMARY,
        });
      }
      if (reportRes.status === 'fulfilled') {
        setReports({
          reportKpis: reportRes.value.reportKpis || REPORT_KPIS,
          reportBars: reportRes.value.reportBars || REPORT_BARS,
          statusServices: reportRes.value.statusServices || [],
          statusIncidents: reportRes.value.statusIncidents || [],
        });
      }

      const firstFailed = [siteRes, alertRes, logRes, dashRes, reportRes].find(
        (r) => r.status === 'rejected',
      );
      if (firstFailed) setError(firstFailed.reason?.message || 'Failed to load data');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial + auth-driven load
  useEffect(() => {
    if (!isAuthenticated) {
      setWebsites([]);
      setAlerts([]);
      setLogs([]);
      return undefined;
    }
    refreshAll();
    const id = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isAuthenticated, refreshAll]);

  const addWebsite = useCallback(
    async ({ name, url }) => {
      if (!url) return null;
      try {
        const created = await apiCreateWebsite({ name, url });
        setWebsites((current) => [created, ...current]);
        // Refresh dashboard/alerts soon after to reflect the new monitor.
        refreshAll();
        return created;
      } catch (err) {
        setError(err.message || 'Failed to add website');
        return null;
      }
    },
    [refreshAll],
  );

  const updateWebsite = useCallback(
    async (id, patch) => {
      try {
        const updated = await apiUpdateWebsite(id, patch);
        setWebsites((current) => current.map((row) => (row.id === id ? updated : row)));
        return updated;
      } catch (err) {
        setError(err.message || 'Failed to update website');
        return null;
      }
    },
    [],
  );

  const deleteWebsite = useCallback(
    async (id) => {
      try {
        await apiDeleteWebsite(id);
        setWebsites((current) => current.filter((row) => row.id !== id));
      } catch (err) {
        setError(err.message || 'Failed to delete website');
      }
    },
    [],
  );

  const toggleIntegration = useCallback(
    async (id) => {
      const target = integrations.find((i) => i.id === id);
      // Email integration is the only API-backed one for now
      if (id === 'email' || id === 'int2') {
        try {
          const updated = target?.connected
            ? await apiDisconnectEmail()
            : await apiConnectEmail();
          setIntegrations((current) =>
            current.map((item) =>
              item.id === id || item.id === updated.id
                ? { ...item, ...updated, id: item.id }
                : item,
            ),
          );
          return updated;
        } catch (err) {
          setError(err.message || 'Failed to update integration');
          return null;
        }
      }
      // Local-only toggle for other integrations
      setIntegrations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, connected: !item.connected } : item,
        ),
      );
      return null;
    },
    [integrations],
  );

  const markAllNotificationsRead = useCallback(async () => {
    setAlerts((current) => current.map((a) => ({ ...a, read: true })));
    try {
      await apiMarkAllRead();
    } catch (err) {
      setError(err.message || 'Failed to mark notifications read');
    }
  }, []);

  const notifications = useMemo(
    () => alerts.slice(0, 12).map(alertToNotification),
    [alerts],
  );
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo(() => {
    return {
      websites,
      alerts,
      recentAlerts: dashboard.recentAlerts,
      logs,
      integrations,
      stats: dashboard.stats,
      uptimeBreakdown: dashboard.uptimeBreakdown,
      uptimePercent: dashboard.uptimePercent,
      responseTimes: dashboard.responseTimes,
      activityLogs: dashboard.activityLogs,
      aiSummary: dashboard.aiSummary,
      statusServices: reports.statusServices,
      statusIncidents: reports.statusIncidents,
      reportKpis: reports.reportKpis,
      reportBars: reports.reportBars,
      notifications,
      unreadCount,
      loading,
      error,
      refreshAll,
      addWebsite,
      updateWebsite,
      deleteWebsite,
      toggleIntegration,
      markAllNotificationsRead,
    };
  }, [
    websites,
    alerts,
    logs,
    integrations,
    dashboard,
    reports,
    notifications,
    unreadCount,
    loading,
    error,
    refreshAll,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    toggleIntegration,
    markAllNotificationsRead,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
