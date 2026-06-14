// ── Feynr Landing Page — Content Constants ──

export const NAV_LINKS = [
  { label: 'Home',     href: '#home' },
  { label: 'About',    href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing',  href: '#pricing' },
] as const;

export const HERO = {
  badge:    'AI-Powered Adaptive Learning',
  headline: ['Learn Anything,', 'Faster.', 'Powered by AI.'],
  subtext:
    'Feynr breaks down complex topics into clear, personalized explanations — built around how you actually think.',
  ctaPrimary:   { label: 'Book a Demo',  href: '/explain' },
  ctaSecondary: { label: 'Learn More',   href: '#features' },
} as const;

export const TICKER_ITEMS = [
  'MIT OpenCourseWare',
  'Khan Academy',
  'Coursera',
  'edX',
  'Brilliant.org',
  'Google for Education',
  'Microsoft Learn',
  'AWS Training',
  'Stanford Online',
  'Harvard Extension',
] as const;

export const FEATURED_CARDS = [
  {
    id: 'smart-exp',
    title: 'Smart Explanations',
    description:
      'Concepts explained using analogies intelligently matched to your background and experience level.',
    href: '#features',
  },
  {
    id: 'adaptive-quiz',
    title: 'Adaptive Quizzes',
    description:
      'Quiz difficulty adjusts in real time based on your confidence, keeping you in the optimal challenge zone.',
    href: '#features',
  },
  {
    id: 'learning-paths',
    title: 'Learning Paths',
    description:
      '3–7 step dynamic roadmaps generated for any topic, sequenced so every step builds on the last.',
    href: '#features',
  },
] as const;

export const DARK_FEATURE = {
  badge: 'Core Technology',
  heading: ['Personalized learning,', 'at AI speed.'],
  paragraphs: [
    'Feynr uses a multi-layer AI system to model your mental state, not just your score. Every question you answer refines a live knowledge graph of what you know.',
    'Our Concept Translator engine rewrites definitions using vocabulary you already understand — no more hitting a wall with jargon.',
    'Progress dashboards surface exactly where you stand and what to tackle next, so no study session is ever wasted.',
  ],
  cta: { label: 'Learn More', href: '#features' },
} as const;

export const FEATURE_GRID = [
  {
    id: 'smart-explanations',
    icon: '✦',
    title: 'Smart Explanations',
    description: 'Concepts explained using analogies matched to your background.',
  },
  {
    id: 'adaptive-quizzes',
    icon: '◈',
    title: 'Adaptive Quizzes',
    description: 'Difficulty adjusts in real time based on your confidence.',
  },
  {
    id: 'progress-tracking',
    icon: '◉',
    title: 'Progress Tracking',
    description: 'Visual dashboards to see exactly where you stand.',
  },
  {
    id: 'learning-paths',
    icon: '⬡',
    title: 'Learning Paths',
    description: '3–7 step dynamic roadmaps generated for any topic.',
  },
  {
    id: 'concept-translator',
    icon: '◇',
    title: 'Concept Translator',
    description: 'Turns jargon into plain language you already understand.',
  },
  {
    id: 'study-scheduler',
    icon: '▣',
    title: 'Study Scheduler',
    description: 'Export a .ics calendar that fits your actual timetable.',
  },
] as const;

export const TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Feynr helped me finally understand Transformers architecture in one afternoon. Nothing else has come close.',
    name: 'Aryan S.',
    role: 'ML Student, IIT Delhi',
    stars: 5,
    initials: 'AS',
  },
  {
    id: 't2',
    quote:
      "The adaptive quiz knew exactly where I was struggling before I did. It's like having a tutor who reads your mind.",
    name: 'Priya R.',
    role: 'CS Sophomore, BITS Pilani',
    stars: 5,
    initials: 'PR',
  },
  {
    id: 't3',
    quote:
      "Best study tool I've used. The Concept Translator is genuinely mind-blowing — it speaks my language.",
    name: 'Karan M.',
    role: 'Self-Learner & Indie Dev',
    stars: 5,
    initials: 'KM',
  },
] as const;

export const FOOTER_LINKS = [
  {
    heading: 'Platform',
    links: ['Features', 'Pricing', 'Roadmap', 'Changelog'],
  },
  {
    heading: 'Use Cases',
    links: ['Students', 'Self-Learners', 'Educators', 'Enterprise'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'Blog', 'Community', 'API'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Privacy', 'Terms'],
  },
] as const;
