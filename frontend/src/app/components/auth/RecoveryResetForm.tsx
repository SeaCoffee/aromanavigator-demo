"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { recoveryResetAction } from "@/app/actions/authActions";
import FormMessage from "@/app/components/auth/FormMessage";
import { authStyles as styles } from "@/app/components/auth/auth.styles";
import type { ActionMessage } from "@/app/types/authTypes";
import { authPageUrlBuilder } from "@/app/urls/pageUrls/authPageUrlBuilder";
import { firstStringMessage, recordMessage } from "@/app/utils/messageUtils";
import {
  PASSWORD_REQUIREMENTS_TEXT,
  validatePasswordInput,
} from "@/app/validators/registerValidateRules";

type Props = {
  token: string;
};

type FormValues = {
  password: string;
  password_repeat: string;
};

export default function RecoveryResetForm({ token }: Props) {
  const [message, setMessage] = useState<ActionMessage>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    resetField,
    setError,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      password: "",
      password_repeat: "",
    },
  });

  function onSubmit(values: FormValues) {
    setMessage("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await recoveryResetAction(token, {
        password: values.password,
      });

      setIsSuccess(result.ok);

      if (result.ok) {
        setMessage(result.msg ?? "");
        resetField("password");
        resetField("password_repeat");
        return;
      }

      const fieldMessage = firstStringMessage(
        recordMessage(result.msg)?.password,
      );

      if (fieldMessage) {
        setError("password", {
          type: "server",
          message: fieldMessage,
        });
        return;
      }

      setMessage(result.msg ?? "");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>РќРѕРІРёР№ РїР°СЂРѕР»СЊ</span>
        <div className={styles.passwordWrap}>
          <input
            {...register("password", {
              required: "Р’РєР°Р¶С–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ.",
              validate: validatePasswordInput,
            })}
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
        <span className={styles.label}>РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ</span>
        <div className={styles.passwordWrap}>
          <input
            {...register("password_repeat", {
              required: "РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ.",
              validate: (value, values) =>
                value === values.password || "РџР°СЂРѕР»С– РЅРµ Р·Р±С–РіР°СЋС‚СЊСЃСЏ.",
            })}
            type={showRepeatPassword ? "text" : "password"}
            autoComplete="new-password"
            className={styles.passwordInput}
          />

          <button
            type="button"
            aria-label={
              showRepeatPassword ? "РЎС…РѕРІР°С‚Рё РїР°СЂРѕР»СЊ" : "РџРѕРєР°Р·Р°С‚Рё РїР°СЂРѕР»СЊ"
            }
            onClick={() => setShowRepeatPassword((value) => !value)}
            className={styles.passwordToggle}
          >
            {showRepeatPassword ? "РЎС…РѕРІР°С‚Рё" : "РџРѕРєР°Р·Р°С‚Рё"}
          </button>
        </div>
        {errors.password_repeat?.message ? (
          <span className={styles.error}>{errors.password_repeat.message}</span>
        ) : null}
      </label>

      <FormMessage message={message} ok={isSuccess} />

      {isSuccess ? (
        <a className={styles.secondary} href={authPageUrlBuilder.login()}>
          РџРµСЂРµР№С‚Рё РґРѕ РІС…РѕРґСѓ
        </a>
      ) : (
        <button
          type="submit"
          disabled={isPending || !isValid}
          className={styles.submit}
        >
          {isPending ? "Р—Р±РµСЂРµР¶РµРЅРЅСЏ..." : "Р—РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ"}
        </button>
      )}
    </form>
  );
}
