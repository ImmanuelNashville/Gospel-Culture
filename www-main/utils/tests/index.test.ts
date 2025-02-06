import {
  formatDuration,
  toUsd,
  wpIdToContentfulId,
  parseCookie,
  preventSessionAuthToAuth0Subs,
  normalizeAndHash,
} from '..';

describe('toUsd', () => {
  it('returns a number in dollars with a dollar sign prefix', () => {
    expect(toUsd(4500)).toEqual('$45');
  });

  it('returns FREE for 0 unles specified', () => {
    expect(toUsd(0)).toEqual('FREE');
  });

  it('returns 0 when specified', () => {
    expect(toUsd(0, true)).toEqual('$0');
  });
});

describe('format duration', () => {
  it('returns "mm:ss" format correctly', () => {
    expect(formatDuration(125, 'mm:ss')).toEqual('2:05');
    expect(formatDuration(457, 'mm:ss')).toEqual('7:37');
    expect(formatDuration(16, 'mm:ss')).toEqual('0:16');
    expect(formatDuration(5454, 'mm:ss')).toEqual('90:54');
  });

  it('returns "mm minutes" format correctly', () => {
    expect(formatDuration(125, 'mm minutes')).toEqual('2 minutes');
    expect(formatDuration(457, 'mm minutes')).toEqual('8 minutes');
    expect(formatDuration(59, 'mm minutes')).toEqual('1 minute');
    expect(formatDuration(5454, 'mm minutes')).toEqual('91 minutes');
  });
});

describe('wpIdToContentfulId', () => {
  it('returns Contentful course ID when given WP course ID', () => {
    expect(wpIdToContentfulId('13777')).toEqual('4nJFRmrT8autVamh7nLcdW');
    expect(wpIdToContentfulId('13641')).toEqual('5XYmxmqFqueD5D4URzOCaW');
    expect(wpIdToContentfulId('13506')).toEqual('sOYwVN4fig2alb22Vn4oj');
  });
  it('returns Contentful course ID for Tokyo Demystified when give a WP Tokyo chapter ID', () => {
    expect(wpIdToContentfulId('4994')).toEqual('4EYfg9lhplQscwFCJlq2qi');
    expect(wpIdToContentfulId('5013')).toEqual('4EYfg9lhplQscwFCJlq2qi');
  });
});

describe('parseCookie', () => {
  it('returns an object if valid input', () => {
    expect(parseCookie('{"utm_source":"creator_elena_taber"}')).toEqual({ utm_source: 'creator_elena_taber' });
    expect(parseCookie('{"utm_source":"creator_elena_taber","utm_id":""}')).toEqual({
      utm_source: 'creator_elena_taber',
      utm_id: '',
    });
    expect(parseCookie('[1,2,3,4]')).toEqual([1, 2, 3, 4]);
  });

  it('returns null if invalid input', () => {
    expect(parseCookie('undefined')).toEqual(null);
    expect(parseCookie('{"utm_source":creator_elena_taber"}')).toEqual(null);
    expect(parseCookie('"utm_source":creator_elena_taber"}')).toEqual(null);
    expect(parseCookie('"utm_source":creator_elena_taber"}')).toEqual(null);
    expect(parseCookie('"utm_source:creator_elena_taber"}')).toEqual(null);
    expect(parseCookie('"utm_source:creator_elena_tab')).toEqual(null);
    expect(parseCookie('[1,,2,3,4]')).toEqual(null);
  });
});

describe('preventSessionAuthToAuth0Subs', () => {
  it('returns true if auth is not WP and Google in auth0subs ', () => {
    expect(
      preventSessionAuthToAuth0Subs('auth0|112137699704779343855', ['google-oauth2|113110356808167627713'])
    ).toEqual(true);
  });
  it('returns true if auth is not WP and Facebook in auth0subs ', () => {
    expect(preventSessionAuthToAuth0Subs('auth0|112137699704779343855', ['facebook|10157843523013856'])).toEqual(true);
  });
  it('returns false if session auth is WP and Google in auth0subs ', () => {
    expect(preventSessionAuthToAuth0Subs('auth0|wp_34586', ['google-oauth2|113110356808167627713'])).toEqual(false);
  });
  it('returns false if session auth is WP and Facebook in auth0subs ', () => {
    expect(preventSessionAuthToAuth0Subs('auth0|wp_34586', ['facebook|10157843523013856'])).toEqual(false);
  });
  it('returns false if session auth is WP and non-Google/Facebook in auth0subs', () => {
    expect(preventSessionAuthToAuth0Subs('auth0|wp_34586', ['myspace|8675309'])).toEqual(false);
  });
  it('returns false if session auth is WP and wp_ email/password in auth0subs', () => {
    expect(preventSessionAuthToAuth0Subs('auth0|wp_34586', ['auth0|wp_34587'])).toEqual(false);
  });
  it('returns false if session auth is Google and WP in auth0subs', () => {
    expect(preventSessionAuthToAuth0Subs('google-oauth2|113110356808167627713', ['auth0|wp_34586'])).toEqual(false);
  });
  it('returns false if session auth is Facebook and WP in auth0subs', () => {
    expect(preventSessionAuthToAuth0Subs('facebook|10157843523013856', ['auth0|wp_34586'])).toEqual(false);
  });
  it('returns false if session auth is Facebook and Google in auth0subs', () => {
    expect(
      preventSessionAuthToAuth0Subs('facebook|10157843523013856', ['google-oauth2|113110356808167627713'])
    ).toEqual(false);
  });
  it('returns false if session auth is Google and Facebook in auth0subs', () => {
    expect(
      preventSessionAuthToAuth0Subs('google-oauth2|113110356808167627713', ['facebook|10157843523013856'])
    ).toEqual(false);
  });
});

describe('normalizeAndHash - md5 hashing for mailchimp emails', () => {
  it('returns the correct md5 has for an email', () => {
    expect(normalizeAndHash('info@brighttrip.com')).toEqual('0b9348436efccca43c91ba3627406c09');
    expect(normalizeAndHash('support@brighttrip.com')).toEqual('ea6bd0cf9ba328724351eb00803b9058');
  });
});
