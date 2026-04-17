export interface ParsedUserAgent {
  readonly platform: string | null;
  readonly device: string | null;
  readonly browser: string | null;
  readonly raw: string;
}

const IOS_PATTERN = /^iOS;\s*([^;]+);\s*Version\s*([\d.]+)/i;

// Not a full UA parser — only the shapes we see in the fixture + navigator.userAgent.
export const parseUserAgent = (raw: string): ParsedUserAgent => {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return { platform: null, device: null, browser: null, raw: '' };
  }

  const ios = IOS_PATTERN.exec(trimmed);
  if (ios && ios[1] && ios[2]) {
    return {
      platform: 'iOS',
      device: ios[1].trim(),
      browser: `Safari ${ios[2]}`,
      raw: trimmed,
    };
  }

  const platform = detectPlatform(trimmed);
  const browser = detectBrowser(trimmed);

  return { platform, device: null, browser, raw: trimmed };
};

const detectPlatform = (ua: string): string | null => {
  if (/Mac OS X|Macintosh/.test(ua)) {
    return 'macOS';
  }
  if (/Windows NT/.test(ua)) {
    return 'Windows';
  }
  if (/Android/.test(ua)) {
    return 'Android';
  }
  if (/Linux/.test(ua)) {
    return 'Linux';
  }
  return null;
};

const detectBrowser = (ua: string): string | null => {
  const chrome = /Chrome\/([\d]+)/.exec(ua);
  if (chrome && !/Edg\//.test(ua)) {
    return `Chrome ${chrome[1]}`;
  }
  const edge = /Edg\/([\d]+)/.exec(ua);
  if (edge) {
    return `Edge ${edge[1]}`;
  }
  const firefox = /Firefox\/([\d]+)/.exec(ua);
  if (firefox) {
    return `Firefox ${firefox[1]}`;
  }
  const ie = /MSIE\s*([\d.]+)/.exec(ua);
  if (ie) {
    return `Internet Explorer ${ie[1]}`;
  }
  const safari = /Version\/([\d.]+).*Safari/.exec(ua);
  if (safari) {
    return `Safari ${safari[1]}`;
  }
  return null;
};
