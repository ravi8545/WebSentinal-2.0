import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowUpRight,
  FiBell,
  FiCheckCircle,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiInfo,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSun,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

import { DASHBOARD_NAV_ITEMS } from '../utils/dummyData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function getToneClass(tone) {
  return `is-${tone}`;
}

const REPORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'url', label: 'URL' },
  { key: 'status', label: 'Status' },
  { key: 'responseTime', label: 'Response Time' },
  { key: 'uptime', label: 'Uptime %' },
  { key: 'lastChecked', label: 'Last Checked' },
];

function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildWebsitesCsv(rows) {
  const header = REPORT_COLUMNS.map((c) => c.label).join(',');
  const lines = rows.map((row) =>
    REPORT_COLUMNS.map((c) => escapeCsvCell(row[c.key] ?? '')).join(','),
  );
  return [header, ...lines].join('\r\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildLinePath(values, width = 640, height = 220, padding = 28) {
  const safeValues = values.length ? values : [0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const spread = Math.max(max - min, 1);
  const step = (width - padding * 2) / Math.max(safeValues.length - 1, 1);

  return safeValues
    .map((value, index) => {
      const x = padding + step * index;
      const normalized = (value - min) / spread;
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function createSparkline(values) {
  return values.map((value, index) => {
    return (
      <span
        key={`${value}-${index}`}
        style={{
          height: `${Math.max(16, Math.min(48, value / 6))}px`,
        }}
      />
    );
  });
}

function DashboardSidebar({
  activeItem,
  isOpen,
  onSelect,
  onClose,
  onLogout,
  user,
}) {
  return (
    <aside
      className={`dashboard__sidebar ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
    >
      <div className="dashboard__brandRow">
        <div className="dashboard__brand">
          <img
            className="dashboard__brandLogo"
            src="/websentinal-logo.png"
            alt="WebSentinal"
          />
          <div>
            <strong>WebSentinal</strong>
            <span>Monitoring SaaS</span>
          </div>
        </div>
      </div>

      <div className="dashboard__profile">
        <div className="dashboard__avatar">{user?.name?.slice(0, 2)?.toUpperCase() || 'WS'}</div>
        <div className="dashboard__profileText">
          <strong>{user?.name || 'Test User'}</strong>
          <span>{user?.email || 'test@gmail.com'}</span>
        </div>
      </div>

      <button
        type="button"
        className="dashboard__mobileClose"
        onClick={onClose}
        aria-label="Close menu"
      >
        <FiX aria-hidden="true" />
      </button>

      <nav className="dashboard__nav" aria-label="Dashboard navigation">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`dashboard__navItem ${activeItem === item.id ? 'is-active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
              <FiChevronRight className="dashboard__navArrow" aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      <button className="dashboard__logout" type="button" onClick={onLogout}>
        <FiLogOut aria-hidden="true" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

function NotificationsDropdown({ open, onClose }) {
  const { notifications, markAllNotificationsRead } = useData();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    function onEsc(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dashboard__notifications" ref={ref} role="dialog" aria-label="Notifications">
      <div className="dashboard__notificationsHead">
        <strong>Notifications</strong>
        <button
          type="button"
          className="dashboard__notificationsMark"
          onClick={markAllNotificationsRead}
        >
          Mark all read
        </button>
      </div>
      <div className="dashboard__notificationsList">
        {notifications.length === 0 ? (
          <p className="dashboard__notificationsEmpty">You're all caught up.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`dashboard__notificationItem ${getToneClass(n.tone)} ${
                n.read ? 'is-read' : ''
              }`}
            >
              <span className="dashboard__notificationDot" aria-hidden="true" />
              <div>
                <strong>{n.title}</strong>
                <p>{n.description}</p>
                <em>{n.time}</em>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddWebsiteModal({ open, onClose, initial, onSubmit }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setUrl(initial?.url || '');
      setError('');
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return undefined;
    function onEsc(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !url.trim()) {
      setError('Both name and URL are required.');
      return;
    }
    onSubmit({ name, url });
    onClose();
  }

  const isEdit = Boolean(initial?.id);

  return (
    <div className="dashboard__modalBackdrop" onMouseDown={onClose}>
      <div
        className="dashboard__modal card"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit website' : 'Add website'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="dashboard__modalHead">
          <div>
            <p className="dashboard__eyebrow">{isEdit ? 'Edit' : 'New monitor'}</p>
            <h3>{isEdit ? 'Edit website' : 'Add website'}</h3>
          </div>
          <button
            type="button"
            className="dashboard__iconButton"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <form className="dashboard__settingsForm" onSubmit={handleSubmit}>
          <label className="dashboard__field">
            <span>Website Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
              autoFocus
            />
          </label>
          <label className="dashboard__field">
            <span>Website URL</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myapp.com"
            />
          </label>

          {error ? <p className="dashboard__formError">{error}</p> : null}

          <div className="dashboard__modalActions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEdit ? 'Save changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardTopbar({
  theme,
  onThemeToggle,
  title,
  onToggleSidebar,
  isSidebarOpen,
  onAddWebsite,
  notificationsOpen,
  onToggleNotifications,
  onCloseNotifications,
  unreadCount,
}) {
  return (
    <header className="dashboard__topbar">
      <button
        type="button"
        className="dashboard__iconButton dashboard__mobileMenu"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isSidebarOpen}
      >
        <FiMenu aria-hidden="true" />
      </button>

      <div className="dashboard__search">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          placeholder={title ? `Search in ${title}...` : 'Search websites, alerts, logs...'}
          aria-label="Search dashboard"
        />
      </div>

      <div className="dashboard__topActions">
        <button
          className="dashboard__iconButton"
          type="button"
          onClick={onThemeToggle}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
        </button>
        <div className="dashboard__notificationsWrap">
          <button
            className="dashboard__iconButton"
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={onToggleNotifications}
          >
            <FiBell aria-hidden="true" />
            {unreadCount > 0 ? <span className="dashboard__badge" /> : null}
          </button>
          <NotificationsDropdown
            open={notificationsOpen}
            onClose={onCloseNotifications}
          />
        </div>
        <button
          className="btn btn--primary dashboard__addButton"
          type="button"
          onClick={onAddWebsite}
        >
          <FiPlus aria-hidden="true" />
          <span>Add Website</span>
        </button>
      </div>
    </header>
  );
}

function StatsGrid() {
  const { stats } = useData();
  const sparkData = [18, 26, 22, 31, 34, 28, 39];

  return (
    <section className="dashboard__stats section-reveal is-visible" aria-label="Dashboard statistics">
      {stats.map((stat, index) => (
        <article key={stat.id} className={`dashboard__stat card ${getToneClass(stat.tone)}`}>
          <div className="dashboard__statHead">
            <p>{stat.label}</p>
            <span>{stat.change}</span>
          </div>
          <div className="dashboard__statValue">{stat.value}</div>
          <div className="dashboard__statSpark" aria-hidden="true">
            {createSparkline(sparkData.map((value) => value + index * 4))}
          </div>
        </article>
      ))}
    </section>
  );
}

function UptimeOverview() {
  const { uptimeBreakdown, uptimePercent } = useData();
  const uptime = Math.max(
    0,
    Math.min(100, Math.round((Number(uptimePercent) || 0) * 10) / 10),
  );
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (uptime / 100) * circumference;

  return (
    <article className="dashboard__panel dashboard__panel--uptime card">
      <div className="dashboard__panelHead">
        <div>
          <p className="dashboard__eyebrow">Uptime Overview</p>
          <h3>Current service health</h3>
        </div>
        <span className="dashboard__trend is-success">+2.4%</span>
      </div>

      <div className="dashboard__ringWrap">
        <svg viewBox="0 0 140 140" className="dashboard__ring" aria-hidden="true">
          <circle cx="70" cy="70" r="54" />
          <circle
            cx="70"
            cy="70"
            r="54"
            style={{ strokeDasharray: circumference, strokeDashoffset }}
          />
        </svg>
        <div className="dashboard__ringLabel">
          <strong>{uptime}%</strong>
          <span>uptime</span>
        </div>
      </div>      <div className="dashboard__legend">
        {uptimeBreakdown.map((item) => (
          <div key={item.label} className={`dashboard__legendItem ${getToneClass(item.tone)}`}>
            <span />
            <strong>{item.label}</strong>
            <em>{item.value}%</em>
          </div>
        ))}
      </div>
    </article>
  );
}

function ResponseChart() {
  const { responseTimes } = useData();
  const labels = useMemo(() => responseTimes.map((item) => item.label), [responseTimes]);
  const values = useMemo(() => responseTimes.map((item) => item.value), [responseTimes]);
  const path = useMemo(() => buildLinePath(values), [values]);
  const areaPath = `${path} L 612 192 L 28 192 Z`;

  return (
    <article className="dashboard__panel card dashboard__panel--chart">
      <div className="dashboard__panelHead">
        <div>
          <p className="dashboard__eyebrow">Response Time</p>
          <h3>7-day performance trend</h3>
        </div>
        <span className="dashboard__trend is-warning">Avg 218 ms</span>
      </div>

      <svg className="dashboard__lineChart" viewBox="0 0 640 220" aria-hidden="true">
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>
        </defs>
        <path d={areaPath} className="dashboard__area" />
        <path d={path} className="dashboard__line" />
        {values.map((value, index) => {
          const x = 28 + ((640 - 56) / Math.max(values.length - 1, 1)) * index;
          const min = Math.min(...values);
          const max = Math.max(...values);
          const normalized = (value - min) / Math.max(max - min, 1);
          const y = 220 - 28 - normalized * (220 - 56);

          return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" className="dashboard__dot" />;
        })}
      </svg>

      <div className="dashboard__chartAxis">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </article>
  );
}

function IncidentSummary() {
  const { aiSummary } = useData();
  return (
    <article className="dashboard__panel card dashboard__incident">
      <div className="dashboard__panelHead">
        <div>
          <p className="dashboard__eyebrow">AI Incident Summary</p>
          <h3>Quick signal overview</h3>
        </div>
        <FiAlertTriangle className="dashboard__incidentIcon" aria-hidden="true" />
      </div>

      <p>{aiSummary}</p>
    </article>
  );
}

function AlertsPanel() {
  const { recentAlerts } = useData();
  return (
    <article className="dashboard__panel card dashboard__alerts">
      <div className="dashboard__panelHead">
        <div>
          <p className="dashboard__eyebrow">Recent Alerts</p>
          <h3>Latest notifications</h3>
        </div>
      </div>

      <div className="dashboard__alertsList">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className={`dashboard__alert ${getToneClass(alert.tone)}`}>
            <strong>{alert.title}</strong>
            <p>{alert.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ActivityPanel() {
  const { activityLogs } = useData();
  return (
    <article className="dashboard__panel card dashboard__activity">
      <div className="dashboard__panelHead">
        <div>
          <p className="dashboard__eyebrow">Activity Log</p>
          <h3>Recent platform events</h3>
        </div>
      </div>

      <div className="dashboard__activityList">
        {activityLogs.map((item) => (
          <div key={item.id} className="dashboard__activityItem">
            <div>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{item.time}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function WebsitesTable({ rows, onEdit, onDelete, onViewAll, showActions = true, compact = false }) {
  return (
    <article className="dashboard__panel card dashboard__tablePanel">
      <div className="dashboard__panelHead">
        <div>
          <p className="dashboard__eyebrow">Website Status</p>
          <h3>Monitored endpoints</h3>
        </div>
        {compact ? (
          <button
            className="dashboard__ghostButton"
            type="button"
            onClick={onViewAll}
          >
            View all <FiArrowUpRight aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="dashboard__tableWrap">
        <table className="dashboard__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Website URL</th>
              <th>Status</th>
              <th className="dashboard__col--md">Response Time</th>
              <th className="dashboard__col--md">Uptime %</th>
              <th className="dashboard__col--lg">Last Checked</th>
              {showActions ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="dashboard__tableEmpty">
                  No websites yet. Click "Add Website" to start monitoring.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id || row.url}>
                  <td><strong>{row.name || '—'}</strong></td>
                  <td>{row.url}</td>
                  <td>
                    <span className={`dashboard__status ${getToneClass(row.tone)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="dashboard__col--md">{row.responseTime}</td>
                  <td className="dashboard__col--md">{row.uptime}</td>
                  <td className="dashboard__col--lg">{row.lastChecked}</td>
                  {showActions ? (
                    <td>
                      <div className="dashboard__rowActions">
                        {onEdit ? (
                          <button
                            className="dashboard__rowAction"
                            type="button"
                            onClick={() => onEdit(row)}
                            aria-label={`Edit ${row.url}`}
                            title="Edit"
                          >
                            <FiEdit2 aria-hidden="true" />
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            className="dashboard__rowAction dashboard__rowAction--danger"
                            type="button"
                            onClick={() => onDelete(row)}
                            aria-label={`Delete ${row.url}`}
                            title="Delete"
                          >
                            <FiTrash2 aria-hidden="true" />
                          </button>
                        ) : null}
                        {!onEdit && !onDelete ? (
                          <button className="dashboard__rowAction" type="button">
                            Inspect
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

/* ------------------------- Sub-views ------------------------- */

function DashboardOverview({ onAddWebsite, onViewAllWebsites }) {
  const { websites } = useData();

  return (
    <>
      <div className="dashboard__hero card section-reveal is-visible">
        <div>
          <p className="dashboard__eyebrow">Welcome back</p>
          <h1>
            Monitoring everything from <span>one control plane</span>.
          </h1>
          <p>
            Live uptime, alerting, and incident visibility for your sites and APIs.
          </p>
        </div>
        <button className="btn btn--primary" type="button" onClick={onAddWebsite}>
          <FiPlus aria-hidden="true" /> Add Website
        </button>
      </div>

      <StatsGrid />

      <section className="dashboard__layout">
        <div className="dashboard__mainColumn section-reveal is-visible">
          <WebsitesTable
            rows={websites.slice(0, 3)}
            compact
            showActions={false}
            onViewAll={onViewAllWebsites}
          />
          <ResponseChart />
          <ActivityPanel />
        </div>

        <aside className="dashboard__sideColumn section-reveal is-visible">
          <UptimeOverview />
          <IncidentSummary />
          <AlertsPanel />
        </aside>
      </section>
    </>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="dashboard__pageHeader card section-reveal is-visible">
      <div>
        <p className="dashboard__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function WebsitesView({ onAddWebsite, onEditWebsite }) {
  const { websites, deleteWebsite } = useData();

  function handleDelete(row) {
    if (window.confirm(`Delete ${row.url}? This cannot be undone.`)) {
      deleteWebsite(row.id);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Monitors"
        title="All websites"
        description="Track status, response time, and uptime for every endpoint you monitor."
        action={
          <button className="btn btn--primary" type="button" onClick={onAddWebsite}>
            <FiPlus aria-hidden="true" /> Add Website
          </button>
        }
      />
      <section className="dashboard__mainColumn section-reveal is-visible">
        <WebsitesTable
          rows={websites}
          onEdit={onEditWebsite}
          onDelete={handleDelete}
        />
      </section>
    </>
  );
}

function severityIcon(severity) {
  if (severity === 'critical') return <FiAlertCircle aria-hidden="true" />;
  if (severity === 'warning') return <FiAlertTriangle aria-hidden="true" />;
  return <FiInfo aria-hidden="true" />;
}

function AlertsView() {
  const { alerts } = useData();
  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Alert center"
        description="Review every critical, warning, and informational alert across your services."
      />
      <section className="dashboard__mainColumn section-reveal is-visible">
        <article className="dashboard__panel card">
          <div className="dashboard__alertsList dashboard__alertsList--full">
            {alerts.map((alert) => (
              <div key={alert.id} className={`dashboard__alertRow ${getToneClass(alert.tone)}`}>
                <div className="dashboard__alertIcon" aria-hidden="true">
                  {severityIcon(alert.severity)}
                </div>
                <div className="dashboard__alertBody">
                  <strong>{alert.title}</strong>
                  <p>{alert.description}</p>
                </div>
                <div className="dashboard__alertMeta">
                  <span className={`dashboard__status ${getToneClass(alert.tone)}`}>
                    {alert.severity}
                  </span>
                  <em>{alert.time}</em>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function LogsView() {
  const { logs } = useData();
  return (
    <>
      <PageHeader
        eyebrow="Logs"
        title="Request logs"
        description="A live feed of every check executed across your monitored services."
      />
      <section className="dashboard__mainColumn section-reveal is-visible">
        <article className="dashboard__panel card dashboard__tablePanel">
          <div className="dashboard__tableWrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td>{log.target}</td>
                    <td>
                      <span className={`dashboard__status ${getToneClass(log.tone)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.responseTime}</td>
                    <td>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}

function StatusPagesView() {
  const { statusServices, statusIncidents } = useData();
  const overall = Math.round(
    statusServices.reduce((sum, s) => sum + s.uptime, 0) / statusServices.length * 100,
  ) / 100;

  return (
    <>
      <PageHeader
        eyebrow="Status"
        title="Public status page"
        description="What your customers see. Service health, uptime, and incident updates."
      />
      <section className="dashboard__mainColumn section-reveal is-visible">
        <article className="dashboard__panel card">
          <div className="dashboard__panelHead">
            <div>
              <p className="dashboard__eyebrow">Overall status</p>
              <h3>
                <FiCheckCircle
                  aria-hidden="true"
                  style={{ verticalAlign: '-3px', marginRight: '0.4rem', color: 'var(--success)' }}
                />
                All major services running
              </h3>
            </div>
            <span className="dashboard__trend is-success">{overall}% uptime</span>
          </div>

          <div className="dashboard__statusList">
            {statusServices.map((service) => (
              <div key={service.id} className="dashboard__statusItem">
                <div>
                  <strong>{service.name}</strong>
                  <p>Last 30 days uptime</p>
                </div>
                <div className="dashboard__statusMeta">
                  <em>{service.uptime}%</em>
                  <span className={`dashboard__status ${getToneClass(service.tone)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard__panel card">
          <div className="dashboard__panelHead">
            <div>
              <p className="dashboard__eyebrow">Incident history</p>
              <h3>Recent incidents</h3>
            </div>
          </div>
          <div className="dashboard__alertsList">
            {statusIncidents.map((inc) => (
              <div key={inc.id} className={`dashboard__alert ${getToneClass(inc.tone)}`}>
                <strong>{inc.title}</strong>
                <p>{inc.description}</p>
                <em>{inc.date}</em>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function ReportsView() {
  const { reportKpis, reportBars, websites } = useData();
  const max = Math.max(...reportBars.map((b) => b.value));
  const [isDownloading, setIsDownloading] = useState(false);

  function handleDownloadCsv() {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const csv = buildWebsitesCsv(websites);
      downloadFile(csv, 'websentinal-report.csv', 'text/csv;charset=utf-8;');
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Analytics & reports"
        description="Performance KPIs, uptime trends, and weekly health summaries."
        action={
          <button
            className="btn btn--primary"
            type="button"
            onClick={handleDownloadCsv}
            disabled={isDownloading}
          >
            <FiDownload aria-hidden="true" />
            <span>{isDownloading ? 'Preparing...' : 'Download Report'}</span>
          </button>
        }
      />

      <section className="dashboard__stats section-reveal is-visible">
        {reportKpis.map((kpi) => (
          <article key={kpi.id} className={`dashboard__stat card ${getToneClass(kpi.tone)}`}>
            <div className="dashboard__statHead">
              <p>{kpi.label}</p>
              <span>{kpi.change}</span>
            </div>
            <div className="dashboard__statValue">{kpi.value}</div>
          </article>
        ))}
      </section>

      <section className="dashboard__mainColumn section-reveal is-visible">
        <article className="dashboard__panel card">
          <div className="dashboard__panelHead">
            <div>
              <p className="dashboard__eyebrow">Weekly uptime</p>
              <h3>Daily availability (%)</h3>
            </div>
            <span className="dashboard__trend is-success">+0.3% WoW</span>
          </div>
          <div className="dashboard__bars">
            {reportBars.map((bar) => (
              <div key={bar.label} className="dashboard__bar">
                <span style={{ height: `${(bar.value / max) * 100}%` }} />
                <em>{bar.label}</em>
              </div>
            ))}
          </div>
        </article>

        <ResponseChart />
      </section>
    </>
  );
}

function IntegrationsView() {
  const { integrations, toggleIntegration } = useData();
  return (
    <>
      <PageHeader
        eyebrow="Integrations"
        title="Connected tools"
        description="Send WebSentinal alerts to the apps your team already uses."
      />
      <section className="dashboard__mainColumn section-reveal is-visible">
        <article className="dashboard__panel card">
          <div className="dashboard__integrations">
            {integrations.map((item) => (
              <div key={item.id} className="dashboard__integration">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </div>
                <button
                  className={`btn ${item.connected ? 'btn--secondary' : 'btn--primary'}`}
                  type="button"
                  onClick={() => toggleIntegration(item.id)}
                >
                  {item.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function SettingsView() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savedNotice, setSavedNotice] = useState('');

  function handleSave(event) {
    event.preventDefault();
    updateProfile({ name, email });
    setSavedNotice('Profile updated.');
    setTimeout(() => setSavedNotice(''), 2200);
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Account & preferences"
        description="Manage your profile and personalize the WebSentinal experience."
      />
      <section className="dashboard__mainColumn section-reveal is-visible">
        <article className="dashboard__panel card">
          <div className="dashboard__panelHead">
            <div>
              <p className="dashboard__eyebrow">Profile</p>
              <h3>Your details</h3>
            </div>
          </div>

          <form className="dashboard__settingsForm" onSubmit={handleSave}>
            <label className="dashboard__field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="dashboard__field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <button className="btn btn--primary" type="submit">
              Save changes
            </button>
            {savedNotice ? (
              <p className="dashboard__formNotice">{savedNotice}</p>
            ) : null}
          </form>
        </article>

        <article className="dashboard__panel card">
          <div className="dashboard__panelHead">
            <div>
              <p className="dashboard__eyebrow">Appearance</p>
              <h3>Theme</h3>
            </div>
          </div>
          <div className="dashboard__themeRow">
            <div>
              <strong>{theme === 'dark' ? 'Dark theme' : 'Light theme'}</strong>
              <p>Switch between dark and light. Your choice is saved on this device.</p>
            </div>
            <button className="btn btn--secondary" type="button" onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
              {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            </button>
          </div>
        </article>
      </section>
    </>
  );
}

const VIEWS = {
  dashboard: { title: 'Dashboard', render: (ctx) => <DashboardOverview {...ctx} /> },
  websites: { title: 'Websites', render: (ctx) => <WebsitesView {...ctx} /> },
  alerts: { title: 'Alerts', render: () => <AlertsView /> },
  logs: { title: 'Logs', render: () => <LogsView /> },
  'status-pages': { title: 'Status Pages', render: () => <StatusPagesView /> },
  reports: { title: 'Reports', render: () => <ReportsView /> },
  integrations: { title: 'Integrations', render: () => <IntegrationsView /> },
  settings: { title: 'Settings', render: () => <SettingsView /> },
};

const MOBILE_QUERY = '(max-width: 768px)';

function getIsMobile() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

export default function DashboardPage({ user, onLogout }) {
  const [isMobile, setIsMobile] = useState(() => getIsMobile());
  // Desktop: open by default (push mode). Mobile: closed by default (overlay).
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getIsMobile());
  const [activeItem, setActiveItem] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modalState, setModalState] = useState({ open: false, initial: null });
  const { theme, toggleTheme } = useTheme();
  const { addWebsite, updateWebsite, unreadCount } = useData();

  const view = VIEWS[activeItem] ?? VIEWS.dashboard;

  // Track viewport changes so we can switch between push/overlay behavior.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(MOBILE_QUERY);
    function onChange(e) {
      setIsMobile(e.matches);
      // When transitioning to mobile, collapse the drawer; when going back to
      // desktop, restore the open push state.
      setIsSidebarOpen(!e.matches);
    }
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  // Lock body scroll only when the mobile overlay drawer is open.
  useEffect(() => {
    const lock = isMobile && isSidebarOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);

  function handleSelect(id) {
    setActiveItem(id);
    // Only auto-close on mobile. On desktop the sidebar stays open until the
    // user toggles it manually.
    if (isMobile) setIsSidebarOpen(false);
  }

  function openAddModal() {
    setModalState({ open: true, initial: null });
    setNotificationsOpen(false);
  }

  function openEditModal(row) {
    setModalState({ open: true, initial: row });
  }

  function closeModal() {
    setModalState({ open: false, initial: null });
  }

  function handleSubmit({ name, url }) {
    if (modalState.initial?.id) {
      updateWebsite(modalState.initial.id, { name, url });
    } else {
      addWebsite({ name, url });
    }
  }

  return (
    <div
      className={`dashboard theme-${theme} ${isSidebarOpen ? 'is-sidebar-open' : ''} ${
        isMobile ? 'is-mobile' : 'is-desktop'
      }`}
    >
      <DashboardSidebar
        activeItem={activeItem}
        isOpen={isSidebarOpen}
        onSelect={handleSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        user={user}
      />

      <button
        type="button"
        className="dashboard__backdrop"
        aria-label="Close menu"
        tabIndex={isMobile && isSidebarOpen ? 0 : -1}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="dashboard__viewport">
        <DashboardTopbar
          theme={theme}
          onThemeToggle={toggleTheme}
          title={view.title}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          isSidebarOpen={isSidebarOpen}
          onAddWebsite={openAddModal}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((v) => !v)}
          onCloseNotifications={() => setNotificationsOpen(false)}
          unreadCount={unreadCount}
        />

        <main className="dashboard__content" key={activeItem}>
          {view.render({
            onAddWebsite: openAddModal,
            onEditWebsite: openEditModal,
            onViewAllWebsites: () => handleSelect('websites'),
          })}
        </main>
      </div>

      <AddWebsiteModal
        open={modalState.open}
        initial={modalState.initial}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
