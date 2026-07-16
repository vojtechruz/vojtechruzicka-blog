// Global feed configuration for RSS/Atom feeds

export default {
  // Only posts newer than this date will be included in feeds
  // Example format (ISO 8601 recommended): 2024-01-01T00:00:00Z
  minDate: new Date('2026-01-01T00:00:00Z'),

  // Branding shown by feed readers
  icon: '/apple-touch-icon.png', // 180x180 square - modern readers (Feedly, Atom <icon>)
  channelImage: '/favicon.png', // 64x64 - legacy RSS <image> (spec caps width at 144)
  accentColor: 'f59e0b', // --color-accent, hex without '#' - Feedly via webfeeds
};
