'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { createCommentFormAction } from '@/app/actions/commentActions';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import { fragranceDetailStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import type { ForumComment } from '@/app/types/forumTypes';
import { PHOTO_INPUT_ACCEPT } from '@/app/utils/photoActionUtils';

type CommentActionState =
  | {
      ok: true;
      data: ForumComment;
      msg?: string;
    }
  | {
      ok: false;
      msg: string;
    };

type FragranceCommentFormProps = {
  fragranceId: number;
  refreshPath: string;
  loginHref?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={styles.commentsSubmit}
    >
      {pending ? 'РќР°РґСЃРёР»Р°РЅРЅСЏ...' : 'РћРїСѓР±Р»С–РєСѓРІР°С‚Рё РІС–РґРіСѓРє'}
    </button>
  );
}

export default function FragranceCommentForm({
  fragranceId,
  refreshPath,
  loginHref,
}: FragranceCommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createCommentFormAction, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  if (loginHref) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#eadfd5] bg-white px-4 py-3">
        <p className={styles.commentsMessage}>
          РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± Р·Р°Р»РёС€РёС‚Рё РІС–РґРіСѓРє.
        </p>
        <Link href={loginHref} className={buttonStyles.compactSecondary}>
          РЈРІС–Р№С‚Рё
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={styles.commentsForm}>
      <input type="hidden" name="target_app" value="fragrance" />
      <input type="hidden" name="target_model" value="fragrancemodel" />
      <input type="hidden" name="target_id" value={fragranceId} />
      <input type="hidden" name="refresh_path" value={refreshPath} />

      <textarea
        name="body"
        className={styles.commentsTextarea}
        maxLength={5000}
        placeholder="РџРѕРґС–Р»С–С‚СЊСЃСЏ РІСЂР°Р¶РµРЅРЅСЏРјРё РїСЂРѕ Р°СЂРѕРјР°С‚."
        required
      />

      <label className={styles.commentsMessage}>
        Р”РѕРґР°С‚Рё С„РѕС‚Рѕ
        <input
          name="images"
          type="file"
          accept={PHOTO_INPUT_ACCEPT}
          multiple
          className={buttonStyles.fileInput}
        />
      </label>

      <div className={styles.commentsFormFooter}>
        <SubmitButton />

        {state ? (
          <p className={state.ok ? styles.commentsMessage : styles.commentsError}>
            {state.ok ? 'Р’С–РґРіСѓРє РѕРїСѓР±Р»С–РєРѕРІР°РЅРѕ.' : state.msg}
          </p>
        ) : null}
      </div>
    </form>
  );
}
