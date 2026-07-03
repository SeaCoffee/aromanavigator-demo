import { describe, it, expect } from "vitest";
import { registerValidateRules } from "./registerValidateRules";

describe("registerValidateRules", () => {
  it("email: rejects empty", () => {
    const validate = registerValidateRules.email.validate as (
      v: string,
    ) => true | string;
    expect(validate("")).not.toBe(true);
  });

  it("email: rejects too long", () => {
    const validate = registerValidateRules.email.validate as (
      v: string,
    ) => true | string;
    const long = "a".repeat(121) + "@test.com"; // РµСЃР»Рё EMAIL_MAX=120
    expect(validate(long)).not.toBe(true);
  });

  it("email: accepts normal", () => {
    const validate = registerValidateRules.email.validate as (
      v: string,
    ) => true | string;
    expect(validate("test@example.com")).toBe(true);
  });

  it("name: rejects double spaces", () => {
    const validate = registerValidateRules.name.validate as (
      v: string,
    ) => true | string;
    expect(validate("РћР»РµСЃСЏ  Р¤СЂР°Р№")).not.toBe(true);
  });

  it("display_name: rejects reserved words", () => {
    const validate = registerValidateRules.display_name.validate as (
      v: string,
    ) => true | string;
    expect(validate("admin_user")).not.toBe(true);
  });

  it("password: accepts strong", () => {
    const validate = registerValidateRules.password.validate as (
      v: string,
    ) => true | string;
    expect(validate("Aroma2026!")).toBe(true);
  });

  it("password: rejects missing uppercase or special character", () => {
    const validate = registerValidateRules.password.validate as (
      v: string,
    ) => true | string;
    expect(validate("aroma2026!")).not.toBe(true);
    expect(validate("Aroma2026")).not.toBe(true);
  });

  it("password: rejects missing digits or letters", () => {
    const validate = registerValidateRules.password.validate as (
      v: string,
    ) => true | string;
    expect(validate("password")).not.toBe(true);
    expect(validate("12345678")).not.toBe(true);
  });

  it("password: rejects too long values", () => {
    const validate = registerValidateRules.password.validate as (
      v: string,
    ) => true | string;
    expect(validate("AromaNavigator2026!")).not.toBe(true);
  });
});
