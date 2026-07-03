import { describe, expect, it } from "vitest";

import {
  getPublicUserDisplayName,
  getPublicUserProfileUsername,
  getUserInitial,
  normalizePublicUsername,
} from "@/app/utils/userDisplayUtils";

describe("userDisplayUtils", () => {
  it("prefers public display name and uses it as profile username", () => {
    const user = {
      id: 1,
      profile: {
        display_name: "PerfumeFan",
        name: "Р†СЂРёРЅР°",
      },
    };

    expect(getPublicUserDisplayName(user)).toBe("PerfumeFan");
    expect(getPublicUserProfileUsername(user)).toBe("PerfumeFan");
    expect(getUserInitial(user)).toBe("P");
  });

  it("does not expose an id as a public username without a profile", () => {
    const user = { id: 7, profile: null };

    expect(getPublicUserDisplayName(user)).toBe("РљРѕСЂРёСЃС‚СѓРІР°С‡");
    expect(getPublicUserProfileUsername(user)).toBeNull();
  });

  it("normalizes at-signs and encoded usernames", () => {
    expect(normalizePublicUsername("  @@Perfume%20Fan  ")).toBe("Perfume Fan");
  });
});
