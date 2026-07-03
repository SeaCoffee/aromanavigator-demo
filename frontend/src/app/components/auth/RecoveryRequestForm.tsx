"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { recoveryRequestAction } from "@/app/actions/authActions";
import FormMessage from "@/app/components/auth/FormMessage";
import { authStyles as styles } from "@/app/components/auth/auth.styles";
import type { ActionMessage } from "@/app/types/authTypes";
import { validateEmailInput } from "@/app/validators/registerValidateRules";

type FormValues = {
  email: string;
};

export default function RecoveryRequestForm() {
  const [message, setMessage] = useState<ActionMessage>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: FormValues) {
    setMessage("");
    setIsSuccess(false);

    startTransition(async () => {
      const result = await recoveryRequestAction(values);

      setMessage(result.msg ?? "");
      setIsSuccess(result.ok);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          {...register("email", {
            required: "Р’РєР°Р¶С–С‚СЊ email.",
            validate: validateEmailInput,
          })}
          type="email"
          autoComplete="email"
          className={styles.input}
        />
        {errors.email?.message ? (
          <span className={styles.error}>{errors.email.message}</span>
        ) : null}
      </label>

      <FormMessage message={message} ok={isSuccess} />

      <button
        type="submit"
        disabled={isPending || !isValid}
        className={styles.submit}
      >
        {isPending ? "РќР°РґСЃРёР»Р°РЅРЅСЏ..." : "РќР°РґС–СЃР»Р°С‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ"}
      </button>
    </form>
  );
}
