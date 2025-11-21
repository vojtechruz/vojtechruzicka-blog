// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

const formatPrefix = (prefix) => `${colors.gray}[${prefix}]${colors.reset}`;

export function log(message, prefix = '11ty') {
  const prefixFormatted = formatPrefix(prefix);
  console.log(prefixFormatted, message);
}

export function logSuccess(message, prefix = '11ty') {
  const prefixFormatted = formatPrefix(prefix);
  console.log(prefixFormatted, `✅  ${colors.green}${message}${colors.reset}`);
}

export function logWarning(message, prefix = '11ty') {
  const prefixFormatted = formatPrefix(prefix);
  console.log(prefixFormatted, `⚠️  ${colors.yellow}${message}${colors.reset}`);
}

export function logError(message, prefix = '11ty') {
  const prefixFormatted = formatPrefix(prefix);
  console.log(prefixFormatted, `❌  ${colors.red}${message}${colors.reset}`);
}

export function logInfo(message, prefix = '11ty') {
  const prefixFormatted = formatPrefix(prefix);
  console.log(prefixFormatted, `ℹ️  ${colors.blue}${message}${colors.reset}`);
}