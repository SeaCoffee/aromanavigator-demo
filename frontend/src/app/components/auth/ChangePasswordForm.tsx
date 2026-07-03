"use client";

import { useEffect, useId, useState, useTransition } from "react";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetError,
} from "react-hook-form";

import {
  changePasswordAction,
  requestPasswordSetupAction,
} from "@/app/actions/meSecurityActions";
import FormMessage from "@/app/components/auth/FormMessage";
import { meSecurityStyles as styles } from "@/app/components/auth/meSecurity.styles";
import type { ActionMessage } from "@/app/types/authTypes";
import { firstStringMessage, recordMessage } from "@/app/utils/messageUtils";
import {
  PASSWORD_REQUIREMENTS_TEXT,
  validatePasswordInput,
} from "@/app/validators/registerValidateRules";

type Props = {
  hasPassword: boolean;
};

type FormValues = {
  old_password: string;
  new_password: string;
  new_password_repeat: string;
};

type PasswordFieldProps = {
  id: string;
  name: keyof FormValues;
  label: string;
  autoComplete: string;
  visible: boolean;
  error?: string;
  register: UseFormRegister<FormValues>;
  onToggleVisible: () => void;
  rules?: Parameters<UseFormRegister<FormValues>>[1];
};

function applyFieldErrors(
  msg: ActionMessage,
  setError: UseFormSetError<FormValues>,
): boolean {
  const record = recordMessage(msg);

  if (!record) {
    return false;
  }

  let hasFieldError = false;

  const oldPasswordError = firstStringMessage(record.old_password);

  if (oldPasswordError) {
    setError("old_password", {
      type: "server",
      message: oldPasswordError,
    });
    hasFieldError = true;
  }

  const newPasswordError = firstStringMessage(record.new_password);

  if (newPasswordError) {
    setError("new_password", {
      type: "server",
      message: newPasswordError,
    });
    hasFieldError = true;
  }

  const passwordError = firstStringMessage(record.password);

  if (passwordError) {
    setError("new_password", {
      type: "server",
      message: passwordError,
    });
    hasFieldError = true;
  }

  return hasFieldError;
}

function getInputClassName(hasError: boolean) {
  return `${styles.input} ${hasError ? styles.inputError : ""}`;
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  visible,
  error,
  register,
  onToggleVisible,
  rules,
}: PasswordFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.passwordWrap}>
        <input
          id={id}
          {...register(name, rules)}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={getInputClassName(Boolean(error))}
        />

        <button
          type="button"
          aria-label={
            visible
              ? `РЎС…РѕРІР°С‚Рё ${label.toLowerCase()}`
              : `РџРѕРєР°Р·Р°С‚Рё ${label.toLowerCase()}`
          }
          onClick={onToggleVisible}
          className={styles.toggleButton}
        >
          {visible ? "РЎС…РѕРІР°С‚Рё" : "РџРѕРєР°Р·Р°С‚Рё"}
        </button>
      </div>

      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}

export default function ChangePasswordForm({ hasPassword }: Props) {
  const baseId = useId();

  const oldPasswordId = `${baseId}-old-password`;
  const newPasswordId = `${baseId}-new-password`;
  const repeatPasswordId = `${baseId}-repeat-password`;

  const [message, setMessage] = useState<ActionMessage>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setError,
    getValues,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      old_password: "",
      new_password: "",
      new_password_repeat: "",
    },
  });

  const newPassword = watch("new_password");
  const repeatPassword = watch("new_password_repeat");

  useEffect(() => {
    if (repeatPassword) {
      void trigger("new_password_repeat");
    }
  }, [newPassword, repeatPassword, trigger]);

  function requestPasswordSetup() {
    setMessage("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await requestPasswordSetupAction();

      setIsSuccess(result.ok);
      setMessage(result.msg ?? "");
    });
  }

  function onSubmit(values: FormValues) {
    setMessage("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await changePasswordAction({
        old_password: values.old_password,
        new_password: values.new_password,
      });

      setIsSuccess(result.ok);

      if (result.ok) {
        setMessage(result.msg ?? "РџР°СЂРѕР»СЊ Р·РјС–РЅРµРЅРѕ.");
        reset({
          old_password: "",
          new_password: "",
          new_password_repeat: "",
        });
        return;
      }

      const wasFieldError = applyFieldErrors(result.msg, setError);

      if (!wasFieldError) {
        setMessage(result.msg);
      }

      resetField("new_password");
      resetField("new_password_repeat");
    });
  }

  if (!hasPassword) {
    return (
      <section className={styles.formShell}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>РџР°СЂРѕР»СЊ РЅРµ РІСЃС‚Р°РЅРѕРІР»РµРЅРѕ</h2>

          <p className={styles.formLead}>
            Р’Р°С€ Р°РєР°СѓРЅС‚ СЃС‚РІРѕСЂРµРЅРѕ С‡РµСЂРµР· Google. Р©РѕР± РґРѕРґР°С‚Рё РїР°СЂРѕР»СЊ, РјРё РЅР°РґС–С€Р»РµРјРѕ
            РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІСЃС‚Р°РЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РЅР° email Р°РєР°СѓРЅС‚Р°.
          </p>
        </div>

        <div className={styles.setupNotice}>
          РџС–СЃР»СЏ РІСЃС‚Р°РЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РІРё Р·РјРѕР¶РµС‚Рµ РІС…РѕРґРёС‚Рё СЏРє С‡РµСЂРµР· Google, С‚Р°Рє С– Р·Р°
          email С‚Р° РїР°СЂРѕР»РµРј.
        </div>

        <div className={styles.formFooter}>
          <FormMessage message={message} ok={isSuccess} />

          <button
            type="button"
            disabled={isPending}
            onClick={requestPasswordSetup}
            className={styles.primaryButton}
          >
            {isPending
              ? "РќР°РґСЃРёР»Р°РЅРЅСЏ..."
              : "РќР°РґС–СЃР»Р°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІСЃС‚Р°РЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formShell}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Р—РјС–РЅР° РїР°СЂРѕР»СЏ</h2>

        <p className={styles.formLead}>
          РџС–СЃР»СЏ Р·РјС–РЅРё РїР°СЂРѕР»СЏ РїРѕС‚РѕС‡РЅР° СЃРµСЃС–СЏ РјРѕР¶Рµ Р±СѓС‚Рё Р·Р°РІРµСЂС€РµРЅР°, С– РІР°Рј РїРѕС‚СЂС–Р±РЅРѕ
          Р±СѓРґРµ СѓРІС–Р№С‚Рё Р·РЅРѕРІСѓ.
        </p>
      </div>

      <div className={styles.formGrid}>
        <PasswordField
          id={oldPasswordId}
          name="old_password"
          label="РЎС‚Р°СЂРёР№ РїР°СЂРѕР»СЊ"
          autoComplete="current-password"
          visible={showOldPassword}
          error={errors.old_password?.message}
          register={register}
          onToggleVisible={() => setShowOldPassword((value) => !value)}
          rules={{
            required: "Р’РІРµРґС–С‚СЊ СЃС‚Р°СЂРёР№ РїР°СЂРѕР»СЊ.",
          }}
        />

        <PasswordField
          id={newPasswordId}
          name="new_password"
          label="РќРѕРІРёР№ РїР°СЂРѕР»СЊ"
          autoComplete="new-password"
          visible={showNewPassword}
          error={errors.new_password?.message}
          register={register}
          onToggleVisible={() => setShowNewPassword((value) => !value)}
          rules={{
            required: "Р’РІРµРґС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ.",
            validate: (value) => {
              const complexityResult = validatePasswordInput(value);

              if (complexityResult !== true) {
                return complexityResult;
              }

              return (
                value !== getValues("old_password") ||
                "РќРѕРІРёР№ РїР°СЂРѕР»СЊ РјР°С” РІС–РґСЂС–Р·РЅСЏС‚РёСЃСЏ РІС–Рґ СЃС‚Р°СЂРѕРіРѕ."
              );
            },
          }}
        />

        <PasswordField
          id={repeatPasswordId}
          name="new_password_repeat"
          label="РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ"
          autoComplete="new-password"
          visible={showRepeatPassword}
          error={errors.new_password_repeat?.message}
          register={register}
          onToggleVisible={() => setShowRepeatPassword((value) => !value)}
          rules={{
            required: "РџРѕРІС‚РѕСЂС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ.",
            validate: (value) =>
              value === getValues("new_password") || "РџР°СЂРѕР»С– РЅРµ Р·Р±С–РіР°СЋС‚СЊСЃСЏ.",
          }}
        />

        <p className={styles.hint}>
          {PASSWORD_REQUIREMENTS_TEXT} Р’РёРєРѕСЂРёСЃС‚РѕРІСѓР№С‚Рµ РїР°СЂРѕР»СЊ, СЏРєРёР№ РЅРµ РїРѕРІС‚РѕСЂСЋС”С‚СЊСЃСЏ РЅР° С–РЅС€РёС… СЃР°Р№С‚Р°С….
        </p>
      </div>

      <div className={styles.formFooter}>
        <FormMessage message={message} ok={isSuccess} />

        <button
          type="submit"
          disabled={isPending || !isValid}
          className={styles.primaryButton}
        >
          {isPending ? "Р—РјС–РЅР°..." : "Р—РјС–РЅРёС‚Рё РїР°СЂРѕР»СЊ"}
        </button>
      </div>
    </form>
  );
}
