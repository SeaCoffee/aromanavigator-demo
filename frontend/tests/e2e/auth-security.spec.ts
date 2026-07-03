import { expect, test, type Page } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_USER_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD ?? "";

const hasPasswordUser = Boolean(TEST_EMAIL && TEST_PASSWORD);

async function loginByUi(page: Page) {
  await page.goto("/login");

  await page.getByLabel("Email", { exact: true }).fill(TEST_EMAIL);
  await page.getByLabel("РџР°СЂРѕР»СЊ", { exact: true }).fill(TEST_PASSWORD);

  await page.getByRole("button", { name: "РЈРІС–Р№С‚Рё" }).click();

  await expect(page).toHaveURL(/\/me/, { timeout: 15_000 });
}

test.describe("public auth pages", () => {
  test.describe.configure({ timeout: 60_000 });

  test("login page renders and password can be shown/hidden", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Р’С…С–Рґ" })).toBeVisible();

    const passwordInput = page.getByLabel("РџР°СЂРѕР»СЊ", { exact: true });

    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "РџРѕРєР°Р·Р°С‚Рё РїР°СЂРѕР»СЊ" }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "РЎС…РѕРІР°С‚Рё РїР°СЂРѕР»СЊ" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("private page redirects guest to login", async ({ page, context }) => {
    await context.clearCookies();

    await page.goto("/me/security");

    await expect(page).toHaveURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/me/security");
  });

  test("recovery request shows neutral success message", async ({ page }) => {
    await page.goto("/recovery");

    await page
      .getByLabel("Email", { exact: true })
      .fill("not-existing-e2e@example.com");
    await page.getByRole("button", { name: /РќР°РґС–СЃР»Р°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ/ }).click();

    await expect(
      page.getByText(/If the email exists|recovery link|РїРѕСЃРёР»Р°РЅРЅСЏ/i),
    ).toBeVisible();
  });

  test("invalid activation token shows activation error", async ({ page }) => {
    await page.goto("/activate/not-a-real-token");

    await expect(
      page.getByRole("heading", {
        name: /РџРѕРјРёР»РєР° Р°РєС‚РёРІР°С†С–С—|РћС€РёР±РєР° Р°РєС‚РёРІР°С†РёРё/i,
      }),
    ).toBeVisible();
  });
});

test.describe("authenticated auth/security flow", () => {
  test.describe.configure({ timeout: 60_000 });
  test.skip(
    !hasPasswordUser,
    "Set E2E_USER_EMAIL and E2E_USER_PASSWORD in .env.e2e",
  );

  test.beforeEach(async ({ page }) => {
    await loginByUi(page);
  });

  test("logged in user can open security page", async ({ page }) => {
    await page.goto("/me/security");

    await expect(page.getByRole("heading", { name: "Р‘РµР·РїРµРєР°" })).toBeVisible();
    await expect(
      page.getByText(
        "РљРµСЂСѓР№С‚Рµ РїР°СЂРѕР»РµРј, СЃРїРѕСЃРѕР±РѕРј РІС…РѕРґСѓ С‚Р° Р±Р°Р·РѕРІРёРјРё РґР°РЅРёРјРё РґРѕСЃС‚СѓРїСѓ РґРѕ Р°РєР°СѓРЅС‚Р°.",
      ),
    ).toBeVisible();
  });

  test("change password form validates repeated password before submit", async ({
    page,
  }) => {
    await page.goto("/me/security");

    await page.getByLabel("РЎС‚Р°СЂРёР№ РїР°СЂРѕР»СЊ", { exact: true }).fill(TEST_PASSWORD);
    await page
      .getByLabel("РќРѕРІРёР№ РїР°СЂРѕР»СЊ", { exact: true })
      .fill("NewPassword123!");
    await page
      .getByLabel("РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ", { exact: true })
      .fill("DifferentPassword123!");

    await expect(page.getByText("РџР°СЂРѕР»С– РЅРµ Р·Р±С–РіР°СЋС‚СЊСЃСЏ.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Р—РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ" }),
    ).toBeDisabled();
  });

  test("change password fields can be shown and hidden", async ({ page }) => {
    await page.goto("/me/security");

    const oldPassword = page.getByLabel("РЎС‚Р°СЂРёР№ РїР°СЂРѕР»СЊ", { exact: true });
    const newPassword = page.getByLabel("РќРѕРІРёР№ РїР°СЂРѕР»СЊ", { exact: true });
    const repeatPassword = page.getByLabel("РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ", {
      exact: true,
    });

    await expect(oldPassword).toHaveAttribute("type", "password");
    await expect(newPassword).toHaveAttribute("type", "password");
    await expect(repeatPassword).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "РџРѕРєР°Р·Р°С‚Рё СЃС‚Р°СЂРёР№ РїР°СЂРѕР»СЊ" }).click();
    await expect(oldPassword).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "РЎС…РѕРІР°С‚Рё СЃС‚Р°СЂРёР№ РїР°СЂРѕР»СЊ" }).click();
    await expect(oldPassword).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "РџРѕРєР°Р·Р°С‚Рё РЅРѕРІРёР№ РїР°СЂРѕР»СЊ" }).click();
    await expect(newPassword).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "РЎС…РѕРІР°С‚Рё РЅРѕРІРёР№ РїР°СЂРѕР»СЊ" }).click();
    await expect(newPassword).toHaveAttribute("type", "password");

    await page
      .getByRole("button", { name: "РџРѕРєР°Р·Р°С‚Рё РїРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ" })
      .click();
    await expect(repeatPassword).toHaveAttribute("type", "text");

    await page
      .getByRole("button", { name: "РЎС…РѕРІР°С‚Рё РїРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ" })
      .click();
    await expect(repeatPassword).toHaveAttribute("type", "password");
  });

  test("logout redirects to login", async ({ page }) => {
    await page.goto("/me/security");

    await page.getByRole("button", { name: "Р’РёР№С‚Рё" }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
