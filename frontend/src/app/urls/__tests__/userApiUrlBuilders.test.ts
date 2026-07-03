import { describe, expect, it } from 'vitest';

import { userAnonApiUrlBuilder } from '@/app/urls/userAnonApiUrlBuilder';
import { userDjangoApiUrlBuilder } from '@/app/urls/userDjangoApiUrlBuilder';
import { userProxyApiUrlBuilder } from '@/app/urls/userProxyApiUrlBuilder';

describe('userDjangoApiUrlBuilder', () => {
  it('builds create url', () => {
    expect(userDjangoApiUrlBuilder.create()).toBe('/userApi/users/register');
  });

  it('builds me url', () => {
    expect(userDjangoApiUrlBuilder.me()).toBe('/userApi/users/me');
  });

  it('builds update me url', () => {
    expect(userDjangoApiUrlBuilder.updateMe()).toBe('/userApi/users/me/update');
  });

  it('builds delete self url', () => {
    expect(userDjangoApiUrlBuilder.deleteSelf()).toBe('/userApi/users/me/delete');
  });

  it('builds change password url', () => {
    expect(userDjangoApiUrlBuilder.changePassword()).toBe(
      '/userApi/users/me/change_password',
    );
    expect(userDjangoApiUrlBuilder.requestPasswordSetup()).toBe(
      '/userApi/users/me/password/setup',
    );
  });

  it('builds me suspended url', () => {
    expect(userDjangoApiUrlBuilder.meSuspended()).toBe(
      '/userApi/users/me/suspended',
    );
  });

  it('builds public list url with query', () => {
    expect(
      userDjangoApiUrlBuilder.publicList({
        page: 2,
        search: 'dexter',
      }),
    ).toBe('/userApi/users/list?page=2&search=dexter');
  });

  it('builds search url with query', () => {
    expect(
      userDjangoApiUrlBuilder.search({
        q: 'perfume',
      }),
    ).toBe('/userApi/users/search?q=perfume');
  });

  it('builds public user by username url', () => {
    expect(userDjangoApiUrlBuilder.byUsername('PerfumeFan7999')).toBe(
      '/userApi/users/u/PerfumeFan7999',
    );
  });

  it('encodes username once', () => {
    expect(userDjangoApiUrlBuilder.byUsername('@Perfume Fan')).toBe(
      '/userApi/users/u/%40Perfume%20Fan',
    );
  });

  it('does not double encode email-like lookup', () => {
    expect(userDjangoApiUrlBuilder.byLookup('test@example.com')).toBe(
      '/userApi/users/by/test%40example.com',
    );
  });

  it('builds filtered users url with query', () => {
    expect(
      userDjangoApiUrlBuilder.filtered({
        role: 'moderator',
        page: 3,
      }),
    ).toBe('/userApi/users/filtered?role=moderator&page=3');
  });

  it('builds admin users list url with query', () => {
    expect(
      userDjangoApiUrlBuilder.adminList({
        page: 2,
        search: 'dexter',
        ordering: '-created_at',
      }),
    ).toBe('/userApi/users/admin-list?page=2&search=dexter&ordering=-created_at');
  });

  it('builds presence bulk url with repeated ids', () => {
    expect(userDjangoApiUrlBuilder.presenceBulk([1, 25, 30])).toBe(
      '/userApi/users/presence?ids=1&ids=25&ids=30',
    );
  });

  it('builds presence heartbeat url', () => {
    expect(userDjangoApiUrlBuilder.presenceHeartbeat()).toBe(
      '/userApi/users/presence/heartbeat',
    );
  });

  it('builds suspend url', () => {
    expect(userDjangoApiUrlBuilder.suspend(25)).toBe(
      '/userApi/users/25/suspend',
    );
  });

  it('builds unsuspend url', () => {
    expect(userDjangoApiUrlBuilder.unsuspend(25)).toBe(
      '/userApi/users/25/unsuspend',
    );
  });

  it('builds block url', () => {
    expect(userDjangoApiUrlBuilder.block(25)).toBe('/userApi/users/25/block');
  });

  it('builds unblock url', () => {
    expect(userDjangoApiUrlBuilder.unblock(25)).toBe(
      '/userApi/users/25/unblock',
    );
  });

  it('builds role urls', () => {
    expect(userDjangoApiUrlBuilder.toAdmin(25)).toBe(
      '/userApi/users/25/to_admin',
    );
    expect(userDjangoApiUrlBuilder.toModerator(25)).toBe(
      '/userApi/users/25/to_moderator',
    );
    expect(userDjangoApiUrlBuilder.toUser(25)).toBe(
      '/userApi/users/25/to_user',
    );
  });
});

describe('userProxyApiUrlBuilder', () => {
  it('builds proxy create url', () => {
    expect(userProxyApiUrlBuilder.create()).toBe('/api/userApi/users/register');
  });

  it('builds proxy me url', () => {
    expect(userProxyApiUrlBuilder.me()).toBe('/api/userApi/users/me');
  });

  it('builds proxy update me url', () => {
    expect(userProxyApiUrlBuilder.updateMe()).toBe(
      '/api/userApi/users/me/update',
    );
  });

  it('builds proxy delete self url', () => {
    expect(userProxyApiUrlBuilder.deleteSelf()).toBe(
      '/api/userApi/users/me/delete',
    );
  });

  it('builds proxy change password url', () => {
    expect(userProxyApiUrlBuilder.changePassword()).toBe(
      '/api/userApi/users/me/change_password',
    );
  });

  it('builds proxy password setup url', () => {
    expect(userProxyApiUrlBuilder.requestPasswordSetup()).toBe(
      '/api/userApi/users/me/password/setup',
    );
  });

  it('builds proxy me suspended url', () => {
    expect(userProxyApiUrlBuilder.meSuspended()).toBe(
      '/api/userApi/users/me/suspended',
    );
  });

  it('builds proxy public list url', () => {
    expect(userProxyApiUrlBuilder.publicList()).toBe('/api/userApi/users/list');
  });

  it('builds proxy search url', () => {
    expect(userProxyApiUrlBuilder.search({ q: 'perfume' })).toBe(
      '/api/userApi/users/search?q=perfume',
    );
  });

  it('builds proxy by username url', () => {
    expect(userProxyApiUrlBuilder.byUsername('PerfumeFan7999')).toBe(
      '/api/userApi/users/u/PerfumeFan7999',
    );
  });

  it('builds proxy by lookup url', () => {
    expect(userProxyApiUrlBuilder.byLookup('test@example.com')).toBe(
      '/api/userApi/users/by/test%40example.com',
    );
  });

  it('builds proxy filtered url', () => {
    expect(userProxyApiUrlBuilder.filtered({ role: 'admin' })).toBe(
      '/api/userApi/users/filtered?role=admin',
    );
  });

  it('builds proxy admin list url', () => {
    expect(userProxyApiUrlBuilder.adminList()).toBe(
      '/api/userApi/users/admin-list',
    );
  });

  it('builds proxy presence bulk url', () => {
    expect(userProxyApiUrlBuilder.presenceBulk([1, 25, 30])).toBe(
      '/api/userApi/users/presence?ids=1&ids=25&ids=30',
    );
  });

  it('builds proxy presence heartbeat url', () => {
    expect(userProxyApiUrlBuilder.presenceHeartbeat()).toBe(
      '/api/userApi/users/presence/heartbeat',
    );
  });

  it('builds proxy suspend url', () => {
    expect(userProxyApiUrlBuilder.suspend(25)).toBe(
      '/api/userApi/users/25/suspend',
    );
  });

  it('builds proxy unsuspend url', () => {
    expect(userProxyApiUrlBuilder.unsuspend(25)).toBe(
      '/api/userApi/users/25/unsuspend',
    );
  });

  it('builds proxy block urls', () => {
    expect(userProxyApiUrlBuilder.block(25)).toBe(
      '/api/userApi/users/25/block',
    );
    expect(userProxyApiUrlBuilder.unblock(25)).toBe(
      '/api/userApi/users/25/unblock',
    );
  });

  it('builds proxy role urls', () => {
    expect(userProxyApiUrlBuilder.toAdmin(25)).toBe(
      '/api/userApi/users/25/to_admin',
    );
    expect(userProxyApiUrlBuilder.toModerator(25)).toBe(
      '/api/userApi/users/25/to_moderator',
    );
    expect(userProxyApiUrlBuilder.toUser(25)).toBe(
      '/api/userApi/users/25/to_user',
    );
  });
});

describe('userAnonApiUrlBuilder', () => {
  it('builds anon create url', () => {
    expect(userAnonApiUrlBuilder.create()).toBe('/api/anonApi/users/register');
  });

  it('builds anon public list url', () => {
    expect(userAnonApiUrlBuilder.publicList()).toBe('/api/anonApi/users/list');
  });

  it('builds anon public list url with query', () => {
    expect(
      userAnonApiUrlBuilder.publicList({
        page: 2,
      }),
    ).toBe('/api/anonApi/users/list?page=2');
  });

  it('builds anon public search url', () => {
    expect(
      userAnonApiUrlBuilder.search({
        q: 'perfume',
      }),
    ).toBe('/api/anonApi/users/search?q=perfume');
  });

  it('builds anon public user by username url', () => {
    expect(userAnonApiUrlBuilder.byUsername('PerfumeFan7999')).toBe(
      '/api/anonApi/users/u/PerfumeFan7999',
    );
  });

  it('encodes anon username once', () => {
    expect(userAnonApiUrlBuilder.byUsername('@Perfume Fan')).toBe(
      '/api/anonApi/users/u/%40Perfume%20Fan',
    );
  });
});
