import {
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiGlobe,
  FiGrid,
  FiLink,
  FiSettings,
  FiShield,
} from 'react-icons/fi';

export const DASHBOARD_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'websites', label: 'Websites', icon: FiGlobe },
  { id: 'alerts', label: 'Alerts', icon: FiBell },
  { id: 'logs', label: 'Logs', icon: FiBookOpen },
  { id: 'status-pages', label: 'Status Pages', icon: FiBarChart2 },
  { id: 'reports', label: 'Reports', icon: FiShield },
  { id: 'integrations', label: 'Integrations', icon: FiLink },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export const DASHBOARD_STATS = [
  { id: 'websites', label: 'Total Websites', value: 18, change: '+3 this month', tone: 'accent' },
  { id: 'up', label: 'Up', value: 15, change: '83.3% healthy', tone: 'success' },
  { id: 'down', label: 'Down', value: 2, change: 'Needs attention', tone: 'danger' },
  { id: 'slow', label: 'Slow', value: 1, change: 'Latency rising', tone: 'warning' },
];

export const WEBSITE_ROWS = [
  {
    id: 'w1',
    name: 'Google',
    url: 'google.com',
    status: 'Up',
    responseTime: '120 ms',
    uptime: '99.99%',
    lastChecked: '1 min ago',
    tone: 'success',
  },
  {
    id: 'w2',
    name: 'My App',
    url: 'myapp.com',
    status: 'Down',
    responseTime: '2.4 s',
    uptime: '97.44%',
    lastChecked: '3 min ago',
    tone: 'danger',
  },
  {
    id: 'w3',
    name: 'My App API',
    url: 'api.myapp.com',
    status: 'Slow',
    responseTime: '940 ms',
    uptime: '98.86%',
    lastChecked: '42 sec ago',
    tone: 'warning',
  },
  {
    id: 'w4',
    name: 'Docs',
    url: 'docs.myapp.com',
    status: 'Up',
    responseTime: '180 ms',
    uptime: '99.92%',
    lastChecked: '2 min ago',
    tone: 'success',
  },
  {
    id: 'w5',
    name: 'Status Page',
    url: 'status.myapp.com',
    status: 'Up',
    responseTime: '210 ms',
    uptime: '99.97%',
    lastChecked: '4 min ago',
    tone: 'success',
  },
  {
    id: 'w6',
    name: 'Shop',
    url: 'shop.myapp.com',
    status: 'Slow',
    responseTime: '880 ms',
    uptime: '98.40%',
    lastChecked: '1 min ago',
    tone: 'warning',
  },
];

export const UPTIME_BREAKDOWN = [
  { label: 'Up', value: 83, tone: 'success' },
  { label: 'Down', value: 10, tone: 'danger' },
  { label: 'Slow', value: 7, tone: 'warning' },
];

export const RESPONSE_TIMES = [
  { label: 'Mon', value: 220 },
  { label: 'Tue', value: 180 },
  { label: 'Wed', value: 260 },
  { label: 'Thu', value: 210 },
  { label: 'Fri', value: 300 },
  { label: 'Sat', value: 180 },
  { label: 'Sun', value: 160 },
];

export const RECENT_ALERTS = [
  { id: 'a1', title: 'Website down', description: 'myapp.com returned 500 for 3 minutes.', tone: 'danger' },
  { id: 'a2', title: 'Slow response', description: 'api.myapp.com crossed 900 ms latency.', tone: 'warning' },
  { id: 'a3', title: 'Connection timeout', description: 'Regional check missed a response window.', tone: 'danger' },
];

export const ALERTS_FEED = [
  {
    id: 'al1',
    severity: 'critical',
    title: 'myapp.com is down',
    description: 'Returned HTTP 500 for over 3 minutes from 4 regions.',
    time: '2 min ago',
    tone: 'danger',
  },
  {
    id: 'al2',
    severity: 'warning',
    title: 'api.myapp.com latency rising',
    description: 'Average response time exceeded 900 ms threshold.',
    time: '14 min ago',
    tone: 'warning',
  },
  {
    id: 'al3',
    severity: 'info',
    title: 'New monitor added',
    description: 'shop.myapp.com is now being monitored every 60s.',
    time: '1 hr ago',
    tone: 'accent',
  },
  {
    id: 'al4',
    severity: 'critical',
    title: 'SSL certificate expiring',
    description: 'docs.myapp.com certificate expires in 5 days.',
    time: '3 hr ago',
    tone: 'danger',
  },
  {
    id: 'al5',
    severity: 'warning',
    title: 'Slow region detected',
    description: 'EU-West nodes reporting 1.2s avg response time.',
    time: '6 hr ago',
    tone: 'warning',
  },
  {
    id: 'al6',
    severity: 'info',
    title: 'Status page published',
    description: 'Public status page updated with latest incident.',
    time: '1 day ago',
    tone: 'accent',
  },
];

export const AI_SUMMARY =
  '2 incidents detected in last 24 hours. One endpoint is down and another is operating with elevated response times.';

export const ACTIVITY_LOGS = [
  { id: 'l1', label: 'Incident created', detail: 'myapp.com is down', time: '2m ago' },
  { id: 'l2', label: 'Latency alert', detail: 'api.myapp.com exceeded threshold', time: '12m ago' },
  { id: 'l3', label: 'Status page updated', detail: 'Public page published successfully', time: '1h ago' },
];

export const REQUEST_LOGS = [
  {
    id: 'log1',
    timestamp: '2026-05-02 10:42:18',
    target: 'myapp.com',
    status: 500,
    responseTime: '2412 ms',
    message: 'Internal Server Error',
    tone: 'danger',
  },
  {
    id: 'log2',
    timestamp: '2026-05-02 10:41:02',
    target: 'api.myapp.com',
    status: 200,
    responseTime: '912 ms',
    message: 'OK (slow response)',
    tone: 'warning',
  },
  {
    id: 'log3',
    timestamp: '2026-05-02 10:40:00',
    target: 'google.com',
    status: 200,
    responseTime: '118 ms',
    message: 'OK',
    tone: 'success',
  },
  {
    id: 'log4',
    timestamp: '2026-05-02 10:39:14',
    target: 'docs.myapp.com',
    status: 200,
    responseTime: '184 ms',
    message: 'OK',
    tone: 'success',
  },
  {
    id: 'log5',
    timestamp: '2026-05-02 10:38:55',
    target: 'shop.myapp.com',
    status: 200,
    responseTime: '870 ms',
    message: 'OK (slow response)',
    tone: 'warning',
  },
  {
    id: 'log6',
    timestamp: '2026-05-02 10:37:40',
    target: 'status.myapp.com',
    status: 200,
    responseTime: '208 ms',
    message: 'OK',
    tone: 'success',
  },
  {
    id: 'log7',
    timestamp: '2026-05-02 10:36:19',
    target: 'myapp.com',
    status: 503,
    responseTime: '—',
    message: 'Service Unavailable',
    tone: 'danger',
  },
  {
    id: 'log8',
    timestamp: '2026-05-02 10:35:08',
    target: 'api.myapp.com',
    status: 200,
    responseTime: '420 ms',
    message: 'OK',
    tone: 'success',
  },
];

export const STATUS_PAGE_SERVICES = [
  { id: 's1', name: 'Website (myapp.com)', uptime: 97.44, status: 'Down', tone: 'danger' },
  { id: 's2', name: 'API (api.myapp.com)', uptime: 98.86, status: 'Degraded', tone: 'warning' },
  { id: 's3', name: 'Docs (docs.myapp.com)', uptime: 99.92, status: 'Operational', tone: 'success' },
  { id: 's4', name: 'Status Page', uptime: 99.97, status: 'Operational', tone: 'success' },
  { id: 's5', name: 'Storefront', uptime: 98.40, status: 'Degraded', tone: 'warning' },
  { id: 's6', name: 'CDN Edge', uptime: 99.99, status: 'Operational', tone: 'success' },
];

export const STATUS_INCIDENTS = [
  {
    id: 'inc1',
    date: 'May 2, 2026',
    title: 'Investigating elevated error rates on myapp.com',
    description: 'We are investigating an issue causing 5xx errors. Engineers engaged.',
    tone: 'danger',
  },
  {
    id: 'inc2',
    date: 'May 1, 2026',
    title: 'API latency degradation resolved',
    description: 'Response times have returned to normal after a database failover.',
    tone: 'warning',
  },
];

export const REPORT_KPIS = [
  { id: 'r1', label: 'Avg Response', value: '218 ms', change: '-4.2%', tone: 'success' },
  { id: 'r2', label: 'Avg Uptime', value: '99.12%', change: '+0.3%', tone: 'success' },
  { id: 'r3', label: 'Total Incidents', value: 14, change: '+2 vs last week', tone: 'warning' },
  { id: 'r4', label: 'MTTR', value: '12m 40s', change: '-1m 12s', tone: 'success' },
];

export const REPORT_BARS = [
  { label: 'Mon', value: 96 },
  { label: 'Tue', value: 99 },
  { label: 'Wed', value: 92 },
  { label: 'Thu', value: 97 },
  { label: 'Fri', value: 88 },
  { label: 'Sat', value: 99 },
  { label: 'Sun', value: 100 },
];

export const INTEGRATIONS_LIST = [
  { id: 'int1', name: 'Slack', description: 'Send alerts to your team channels.', connected: true },
  { id: 'int2', name: 'Email', description: 'Reliable email notifications.', connected: true },
  { id: 'int3', name: 'Discord', description: 'Pipe alerts into community servers.', connected: false },
  { id: 'int4', name: 'Webhooks', description: 'Connect any service via webhooks.', connected: true },
  { id: 'int5', name: 'GitHub', description: 'Open issues automatically.', connected: false },
  { id: 'int6', name: 'Telegram', description: 'Real-time alerts to Telegram chats.', connected: false },
];
