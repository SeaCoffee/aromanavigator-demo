"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm, type UseFormSetError } from "react-hook-form";

import { registerAction } from "@/app/actions/authActions";
import FormMessage from "@/app/components/auth/FormMessage";
import { authStyles as styles } from "@/app/components/auth/auth.styles";
import type { ActionMessage } from "@/app/types/authTypes";
import type { RegisterFormValues } from "@/app/types/formTypes";
import {
  PASSWORD_REQUIREMENTS_TEXT,
  registerValidateRules,
} from "@/app/validators/registerValidateRules";
import { firstStringMessage, recordMessage } from "@/app/utils/messageUtils";

function applyRegistrationFieldErrors(
  msg: ActionMessage,
  setError: UseFormSetError<RegisterFormValues>,
): boolean {
  const record = recordMessage(msg);

  if (!record) {
    return false;
  }

  const profile = recordMessage(record.profile);
  const fieldErrors = {
    email: firstStringMessage(record.email),
    password: firstStringMessage(record.password),
    name: firstStringMessage(profile?.name),
    display_name: firstStringMessage(profile?.display_name),
  };

  let hasFieldError = false;

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (!message) {
      return;
    }

    setError(field as keyof RegisterFormValues, {
      type: "server",
      message,
    });
    hasFieldError = true;
  });

  return hasFieldError;
}

export default function RegisterForm() {
  const [message, setMessage] = useState<ActionMessage>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    resetField,
    setError,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      name: "",
      display_name: "",
      termsAccepted: false,
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setMessage("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await registerAction({
        email: values.email,
        password: values.password,
        profile: {
          name: values.name,
          display_name: values.display_name,
          region: "other",
        },
        terms_accepted: values.termsAccepted,
      });

      setIsSuccess(result.ok);

      if (result.ok) {
        setMessage(result.msg ?? "");
        resetField("password");
        return;
      }

      if (!applyRegistrationFieldErrors(result.msg, setError)) {
        setMessage(result.msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          {...register("email", registerValidateRules.email)}
          type="email"
          autoComplete="email"
          className={styles.input}
        />
        {errors.email?.message ? (
          <span className={styles.error}>{errors.email.message}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>РџР°СЂРѕР»СЊ</span>
        <div className={styles.passwordWrap}>
          <input
            {...register("password", registerValidateRules.password)}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={styles.passwordInput}
          />

          <button
            type="button"
            aria-label={showPassword ? "РЎС…РѕРІР°С‚Рё РїР°СЂРѕР»СЊ" : "РџРѕРєР°Р·Р°С‚Рё РїР°СЂРѕР»СЊ"}
            onClick={() => setShowPassword((value) => !value)}
            className={styles.passwordToggle}
          >
            {showPassword ? "РЎС…РѕРІР°С‚Рё" : "РџРѕРєР°Р·Р°С‚Рё"}
          </button>
        </div>
        {errors.password?.message ? (
          <span className={styles.error}>{errors.password.message}</span>
        ) : (
          <span className={styles.text}>{PASSWORD_REQUIREMENTS_TEXT}</span>
        )}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Р†РјКјСЏ</span>
        <input
          {...register("name", registerValidateRules.name)}
          type="text"
          autoComplete="given-name"
          className={styles.input}
        />
        {errors.name?.message ? (
          <span className={styles.error}>{errors.name.message}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>РќС–РєРЅРµР№Рј</span>
        <input
          {...register("display_name", registerValidateRules.display_name)}
          type="text"
          autoComplete="nickname"
          className={styles.input}
        />
        {errors.display_name?.message ? (
          <span className={styles.error}>{errors.display_name.message}</span>
        ) : null}
      </label>

      <label className="flex items-start gap-3 rounded-[16px] border border-[#eadfd5] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#5f534c]">
        <input
          {...register("termsAccepted", registerValidateRules.termsAccepted)}
          className="mt-1 h-4 w-4 rounded border-[#d8c4b3] text-[#7a5138] focus:ring-[#b98d6d]"
          type="checkbox"
        />
        <span>
          РЇ РїРѕРіРѕРґР¶СѓСЋСЃСЏ Р·{" "}
          <Link className={styles.link} href="/terms" target="_blank">
            РџСЂР°РІРёР»Р°РјРё РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ СЃР°Р№С‚РѕРј
          </Link>{" "}
          С‚Р°{" "}
          <Link className={styles.link} href="/privacy" target="_blank">
            РџРѕР»С–С‚РёРєРѕСЋ РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–
          </Link>
        </span>
      </label>
      {errors.termsAccepted?.message ? (
        <span className={styles.error}>{errors.termsAccepted.message}</span>
      ) : null}

      <FormMessage message={message} ok={isSuccess} />

      <button
        type="submit"
        disabled={isPending || !isValid}
        className={styles.submit}
      >
        {isPending ? "РЎС‚РІРѕСЂРµРЅРЅСЏ..." : "Р—Р°СЂРµС”СЃС‚СЂСѓРІР°С‚РёСЃСЏ"}
      </button>
    </form>
  );
}
