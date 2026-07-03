import { describe, expect, it } from 'vitest';

import {
  getActivityPayloadText,
  getActivitySentence,
  getActivityTargetLabel,
  getActivityVerbLabel,
} from '@/app/components/activity/activityFormatters';
import type { ActivityEvent } from '@/app/types/activityTypes';

function makeActivityEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id: 1,
    actor: {
      id: 28,
      display_name: 'dexter-morgan',
      avatar_url: null,
    },
    verb: 'followed_user',
    target: {
      app: 'users',
      model: 'usermodel',
      id: 25,
    },
    target_app: 'users',
    target_model: 'usermodel',
    target_id: 25,
    payload: {
      target_display_name: 'PerfumeFan7999',
    },
    is_private: false,
    created_at: '2026-05-05T10:33:00Z',
    updated_at: '2026-05-05T10:33:00Z',

    ...overrides,
  };
}

describe('activityFormatters', () => {
  it('maps followed_user verb to readable label', () => {
    expect(getActivityVerbLabel('followed_user')).toBe('РїС–РґРїРёСЃР°РІСЃСЏ(Р»Р°СЃСЏ)');
  });

  it('maps users.usermodel target using target_display_name payload', () => {
    const event = makeActivityEvent();

    expect(getActivityTargetLabel(event.target, event.payload)).toBe(
      '@PerfumeFan7999',
    );
  });

  it('falls back to user id when user target display name is missing', () => {
    const event = makeActivityEvent({
      payload: {},
    });

    expect(getActivityTargetLabel(event.target, event.payload)).toBe(
      'РљРѕСЂРёСЃС‚СѓРІР°С‡ #25',
    );
  });

  it('builds readable follow sentence', () => {
    const event = makeActivityEvent();

    expect(getActivitySentence(event)).toBe(
      'dexter-morgan РїС–РґРїРёСЃР°РІСЃСЏ(Р»Р°СЃСЏ): @PerfumeFan7999',
    );
  });

  it('does not show legacy liked/unliked payload action text', () => {
    const likedLegacy = makeActivityEvent({
      verb: 'updated',
      target: {
        app: 'comments',
        model: 'commentmodel',
        id: 2,
      },
      payload: {
        action: 'liked',
      },
    });

    const unlikedLegacy = makeActivityEvent({
      verb: 'updated',
      target: {
        app: 'comments',
        model: 'commentmodel',
        id: 2,
      },
      payload: {
        action: 'unliked',
      },
    });

    expect(getActivityPayloadText(likedLegacy)).toBe('');
    expect(getActivityPayloadText(unlikedLegacy)).toBe('');
  });

  it('returns like payload only for actual liked verb', () => {
    const event = makeActivityEvent({
      verb: 'liked',
      payload: {
        like_id: 12,
      },
    });

    expect(getActivityPayloadText(event)).toBe('Р›Р°Р№Рє #12');
  });
});
