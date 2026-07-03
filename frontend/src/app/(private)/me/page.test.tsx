import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import MePage from "./page";
import { requireUserOrRedirect } from "@/app/lib/session";
import type { UserMe } from "@/app/types/userTypes";

vi.mock("@/app/lib/session", () => ({
  requireUserOrRedirect: vi.fn(),
}));

vi.mock("@/app/components/share/ShareButton", () => ({
  default: ({ label = "РџРѕРґС–Р»РёС‚РёСЃСЏ" }: { label?: string }) => (
    <button type="button">{label}</button>
  ),
}));

const mockedRequireUserOrRedirect = vi.mocked(requireUserOrRedirect);

function makeUser(overrides?: Partial<UserMe>): UserMe {
  return {
    id: 1,
    email: "me@example.com",
    email_verified: true,
    is_active: true,
    is_staff: false,
    is_superuser: false,
    role: "user",
    is_seller: true,
    account_type: "basic",
    is_suspended: false,
    suspended_until: null,
    suspended_indefinitely: false,
    suspension_seconds_left: 0,
    has_password: true,
    profile: {
      id: 1,
      name: "Р†СЂРёРЅР°",
      display_name: "PerfumeFan",
      region: "kyiv_city",
      avatar_url: null,
      about_me: "Р›СЋР±Р»СЋ Р·РµР»РµРЅС– С€РёРїСЂРё.",
    },
    stats: {
      followers_count: 5,
      following_count: 10,
      notifications_unread_count: 3,
      messages_unread_count: 2,
      forum_topics_count: 4,
      forum_comments_count: 8,
      likes_given_count: 11,
      likes_received_count: 12,
      started_at: "2026-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

describe("MePage", () => {
  beforeEach(() => {
    mockedRequireUserOrRedirect.mockReset();
  });

  it("renders dashboard profile summary instead of duplicated menu cards", async () => {
    mockedRequireUserOrRedirect.mockResolvedValueOnce(makeUser());

    const element = await MePage();
    render(element);

    expect(
      screen.getByRole("heading", { name: "PerfumeFan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Р›СЋР±Р»СЋ Р·РµР»РµРЅС– С€РёРїСЂРё.")).toBeInTheDocument();
    expect(screen.getByText("Email РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ")).toBeInTheDocument();
    expect(screen.getByText("РџСЂРѕРґР°РІРµС†СЊ")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "РЎРїРѕРІС–С‰РµРЅРЅСЏ 3" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Email РґР»СЏ РІС…РѕРґСѓ")).toBeInTheDocument();
    expect(screen.getByText("me@example.com")).toBeInTheDocument();
    expect(screen.getByText("РљРёС—РІ")).toBeInTheDocument();
  });

  it("renders localized fallback region instead of raw code", async () => {
    mockedRequireUserOrRedirect.mockResolvedValueOnce(
      makeUser({
        profile: {
          id: 1,
          name: "Р†СЂРёРЅР°",
          display_name: "PerfumeFan",
          region: "other",
          avatar_url: null,
          about_me: null,
        },
      }),
    );

    const element = await MePage();
    render(element);

    expect(screen.getByText("Р†РЅС€Рµ")).toBeInTheDocument();
    expect(screen.queryByText("other")).not.toBeInTheDocument();
  });

  it("shows suspended account status", async () => {
    mockedRequireUserOrRedirect.mockResolvedValueOnce(
      makeUser({
        is_suspended: true,
        suspended_until: "2026-07-01T12:00:00Z",
      }),
    );

    const element = await MePage();
    render(element);

    expect(screen.getByText("РђРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ")).toBeInTheDocument();
    expect(screen.getByText(/Р‘Р»РѕРєСѓРІР°РЅРЅСЏ РґС–С” РґРѕ/)).toBeInTheDocument();
  });
});
