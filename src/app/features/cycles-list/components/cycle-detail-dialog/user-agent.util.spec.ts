import { parseUserAgent } from './user-agent.util';

describe('parseUserAgent', () => {
  it('returns an all-null parse for empty input', () => {
    expect(parseUserAgent('')).toEqual({ platform: null, device: null, browser: null, raw: '' });
    expect(parseUserAgent('   ')).toEqual({ platform: null, device: null, browser: null, raw: '' });
  });

  it('parses the iOS fixture shape into platform/device/browser', () => {
    const parsed = parseUserAgent('iOS; iPhone 12; Version 15.4; build 19E241');
    expect(parsed.platform).toBe('iOS');
    expect(parsed.device).toBe('iPhone 12');
    expect(parsed.browser).toBe('Safari 15.4');
  });

  it('detects macOS + Chrome from a navigator.userAgent string', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    expect(parsed.platform).toBe('macOS');
    expect(parsed.browser).toBe('Chrome 120');
  });

  it('prefers Edge over Chrome when Edg/ is present', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    );
    expect(parsed.platform).toBe('Windows');
    expect(parsed.browser).toBe('Edge 120');
  });

  it('detects Firefox on Linux', () => {
    const parsed = parseUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0');
    expect(parsed.platform).toBe('Linux');
    expect(parsed.browser).toBe('Firefox 121');
  });

  it('detects Android platform', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    );
    expect(parsed.platform).toBe('Android');
    expect(parsed.browser).toBe('Chrome 120');
  });

  it('detects Safari on macOS via Version/.. Safari pattern', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
    );
    expect(parsed.platform).toBe('macOS');
    expect(parsed.browser).toBe('Safari 17.3');
  });

  it('detects legacy Internet Explorer', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 10.0; Trident/7.0)',
    );
    expect(parsed.browser).toBe('Internet Explorer 11.0');
  });

  it('returns null platform/browser for unknown UA strings', () => {
    const parsed = parseUserAgent('SomeBot/1.0 (unknown)');
    expect(parsed.platform).toBeNull();
    expect(parsed.browser).toBeNull();
    expect(parsed.raw).toBe('SomeBot/1.0 (unknown)');
  });
});
