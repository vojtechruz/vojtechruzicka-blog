const DEFAULTS = {
  new: 'New',
  up: '↑ Up',
  down: '↓ Down',
  merged: 'Merged',
  removed: 'Removed',
  renamed: 'Renamed',
};

export default function badge(variant, label) {
  const text = label ?? DEFAULTS[variant] ?? variant;
  return `<span class="badge badge--${variant}">${text}</span>`;
}
