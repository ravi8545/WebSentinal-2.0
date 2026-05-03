export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Pricing', href: '#pricing' },
];

export const HERO_BULLETS = [
  'Real-time monitoring',
  'Instant alerts',
  'AI-powered insights',
  'Public status pages',
];

export const FEATURE_CARDS = [
  {
    id: 'monitoring',
    title: 'Real-time Monitoring',
    description:
      'Monitor uptime, downtime, and performance across all your endpoints.',
  },
  {
    id: 'alerts',
    title: 'Instant Alerts',
    description:
      'Get notified instantly via email and web the moment something breaks.',
  },
  {
    id: 'ai-insights',
    title: 'AI Insights',
    description:
      'Smart, AI-generated summaries of incidents to fix issues faster.',
  },
  {
    id: 'status-page',
    title: 'Status Pages',
    description:
      'Beautiful public status pages to keep users informed at all times.',
  },
  {
    id: 'logs',
    title: 'Logs & Analytics',
    description:
      'Track historical performance with detailed logs and rich analytics.',
  },
  {
    id: 'multi-site',
    title: 'Multi-Website Monitoring',
    description:
      'Manage and monitor multiple websites from a single unified dashboard.',
  },
];

export const WHY_CHOOSE_US_CARDS = [
  {
    id: 'easy',
    title: 'Easy',
    description: 'Set up monitors in minutes with a clean, focused dashboard.',
  },
  {
    id: 'reliable',
    title: 'Reliable',
    description: 'High-signal checks designed to reduce noise and false positives.',
  },
  {
    id: 'secure',
    title: 'Secure',
    description: 'Built with modern best practices to protect your data and team.',
  },
  {
    id: 'scalable',
    title: 'Scalable',
    description: 'From one project to hundreds of endpoints—grow without friction.',
  },
];

export const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send alerts directly to your team channels.',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Reliable email notifications for every incident.',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Pipe alerts into your community and dev servers.',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Connect any service with custom webhook payloads.',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Open issues automatically when incidents occur.',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Real-time alerts pushed to your Telegram chat.',
  },
];

export const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹0',
    period: '/ month',
    tagline: 'Perfect for getting started.',
    features: ['5 websites', 'Basic alerts', 'Limited logs'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    period: '/ month',
    tagline: 'For growing teams and products.',
    features: [
      '50 websites',
      'Real-time alerts',
      'Logs + analytics',
      'Status pages',
    ],
    cta: 'Get Started',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₹999',
    period: '/ month',
    tagline: 'For organizations at scale.',
    features: [
      'Unlimited websites',
      'Priority alerts',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Get Started',
    highlight: false,
  },
];

export const COMPANIES = [
  { id: 'ibm', name: 'IBM' },
  { id: 'accenture', name: 'Accenture' },
  { id: 'google', name: 'Google' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'netflix', name: 'Netflix' },
  { id: 'meta', name: 'Meta' },
  { id: 'adobe', name: 'Adobe' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'uber', name: 'Uber' },
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'dropbox', name: 'Dropbox' },
  { id: 'slack', name: 'Slack' },
  { id: 'shopify', name: 'Shopify' },
  { id: 'oracle', name: 'Oracle' },
  { id: 'intel', name: 'Intel' },
];

export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: 'mailto:support@websentinal.com' },
  ],
  support: [
    { label: 'Help', href: '#' },
    { label: 'Docs', href: '#' },
  ],
  // Legacy aliases kept for backward compatibility
  help: [
    { label: 'Docs', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Pricing', href: '#pricing' },
  ],
};
