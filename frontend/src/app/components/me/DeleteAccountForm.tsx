"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { deleteMeAction } from "@/app/actions/usersActions";
import FormMessage from "@/app/components/auth/FormMessage";
import { meDashboardStyles as styles } from "@/app/components/me/meDashboard.styles";
import type { ActionMessage } from "@/app/types/authTypes";

type Props = {
  email: string;
};

type FormValues = {
  confirmation: string;
};

function getInputClassName(hasError: boolean) {
  return `${styles.input} ${hasError ? styles.inputError : ""}`;
}

export default function DeleteAccountForm({ email }: Props) {
  const [message, setMessage] = useState<ActionMessage>("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      confirmation: "",
    },
  });

  function onSubmit() {
    setMessage("");

    startTransition(async () => {
      const result = await deleteMeAction();

      if (!result.ok) {
        setMessage(result.msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.dangerShell}>
      <div className={styles.dangerHeader}>
        <h2 className={styles.dangerTitle}>РћСЃС‚Р°С‚РѕС‡РЅРѕ РІРёРґР°Р»РёС‚Рё Р°РєР°СѓРЅС‚</h2>

        <p className={styles.dangerLead}>
          Р”Р»СЏ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ РІРІРµРґС–С‚СЊ email РІР°С€РѕРіРѕ Р°РєР°СѓРЅС‚Сѓ. Р¦СЋ РґС–СЋ РЅРµ РјРѕР¶РЅР° Р±СѓРґРµ
          СЃРєР°СЃСѓРІР°С‚Рё С‡РµСЂРµР· С–РЅС‚РµСЂС„РµР№СЃ.
        </p>
      </div>

      <div className={styles.dangerAlert}>
        РџСЂРѕС„С–Р»СЊ, Р·Р±РµСЂРµР¶РµРЅС– РєРѕРЅС‚Р°РєС‚Рё РґР»СЏ РґРѕСЃС‚Р°РІРєРё Р№ Р°РІР°С‚Р°СЂ Р±СѓРґРµ РІРёРґР°Р»РµРЅРѕ, Р°РєС‚РёРІРЅС–
        РѕРіРѕР»РѕС€РµРЅРЅСЏ РїСЂРёС…РѕРІР°РЅРѕ, Р° РґРѕСЃС‚СѓРї РґРѕ Р°РєР°СѓРЅС‚Сѓ Р·Р°РєСЂРёС‚Рѕ. Р—Р°РІРµСЂС€РµРЅС– СѓРіРѕРґРё,
        РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ, РєРѕРјРµРЅС‚Р°СЂС– С‚Р° РІС–РґРіСѓРєРё Р·Р°Р»РёС€Р°С‚СЊСЃСЏ РІ С–СЃС‚РѕСЂС–С— РІС–Рґ С–РјРµРЅС–
        В«Р’РёРґР°Р»РµРЅРёР№ РєРѕСЂРёСЃС‚СѓРІР°С‡В». Р”Р°РЅС– Р·Р°РІРµСЂС€РµРЅРёС… Р·Р°РјРѕРІР»РµРЅСЊ Р·Р±РµСЂС–РіР°СЋС‚СЊСЃСЏ РѕРєСЂРµРјРѕ СЏРє
        С–СЃС‚РѕСЂС–СЏ СѓРіРѕРґ. Р’РёРґР°Р»РµРЅРЅСЏ РЅРµРјРѕР¶Р»РёРІРµ, РґРѕРєРё С” РЅРµР·Р°РІРµСЂС€РµРЅС– Р·Р°РјРѕРІР»РµРЅРЅСЏ,
        РІС–РґРєСЂРёС‚С– РґРёСЃРїСѓС‚Рё Р°Р±Рѕ РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ Р±РµР· РІС–РґРїРѕРІС–РґС–.
      </div>

      <div className={styles.field}>
        <label htmlFor="delete-account-confirmation" className={styles.label}>
          Email РґР»СЏ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ
        </label>

        <input
          id="delete-account-confirmation"
          {...register("confirmation", {
            required: "Р’РІРµРґС–С‚СЊ email РґР»СЏ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ.",
            validate: (value) =>
              value.trim().toLowerCase() === email.trim().toLowerCase() ||
              "Email РЅРµ Р·Р±С–РіР°С”С‚СЊСЃСЏ.",
          })}
          autoComplete="off"
          aria-invalid={Boolean(errors.confirmation)}
          className={getInputClassName(Boolean(errors.confirmation))}
        />

        {errors.confirmation?.message ? (
          <span className={styles.error}>{errors.confirmation.message}</span>
        ) : (
          <span className={styles.hint}>
            РџРѕС‚СЂС–Р±РЅРѕ РІРІРµСЃС‚Рё СЃР°РјРµ С†РµР№ email: {email}
          </span>
        )}
      </div>

      <div className={styles.formFooter}>
        <FormMessage message={message} ok={false} />

        <button
          type="submit"
          disabled={isPending || !isValid}
          className={styles.dangerButton}
        >
          {isPending ? "Р’РёРґР°Р»РµРЅРЅСЏ..." : "Р’РёРґР°Р»РёС‚Рё Р°РєР°СѓРЅС‚"}
        </button>
      </div>
    </form>
  );
}
