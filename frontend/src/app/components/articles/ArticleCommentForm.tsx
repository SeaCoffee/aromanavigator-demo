'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { createCommentFormAction } from '@/app/actions/commentActions';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import type { ForumComment } from '@/app/types/forumTypes';
import { PHOTO_INPUT_ACCEPT } from '@/app/utils/photoActionUtils';

type State =
  | { ok: true; data: ForumComment; msg?: string }
  | { ok: false; msg: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonStyles.primary}
    >
      {pending ? 'РџСѓР±Р»С–РєСѓС”РјРѕ...' : label}
    </button>
  );
}

export default function ArticleCommentForm({
  articleId,
  refreshPath,
  loginHref,
  parentId,
  compact = false,
  submitLabel = 'РћРїСѓР±Р»С–РєСѓРІР°С‚Рё РєРѕРјРµРЅС‚Р°СЂ',
  placeholder = 'РќР°РїРёС€С–С‚СЊ, С‰Рѕ РґСѓРјР°С”С‚Рµ РїСЂРѕ РјР°С‚РµСЂС–Р°Р».',
  onCreated,
}: {
  articleId: number;
  refreshPath: string;
  loginHref?: string;
  parentId?: number;
  compact?: boolean;
  submitLabel?: string;
  placeholder?: string;
  onCreated?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<State | null, FormData>(
    createCommentFormAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      onCreated?.();
    }
  }, [onCreated, state]);

  if (loginHref) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#eadfd5] bg-white px-4 py-3">
        <p className="text-sm text-[#7a6d64]">
          РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± Р·Р°Р»РёС€РёС‚Рё РєРѕРјРµРЅС‚Р°СЂ.
        </p>
        <Link href={loginHref} className={buttonStyles.compactSecondary}>
          РЈРІС–Р№С‚Рё
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className={[
        'grid gap-3 border border-[#eadfd5] bg-white',
        compact ? 'rounded-[16px] p-3' : 'rounded-[20px] p-4',
      ].join(' ')}
    >
      <input type="hidden" name="target_app" value="articles" />
      <input type="hidden" name="target_model" value="article" />
      <input type="hidden" name="target_id" value={articleId} />
      <input type="hidden" name="refresh_path" value={refreshPath} />
      {parentId ? <input type="hidden" name="parent_id" value={parentId} /> : null}

      <textarea
        name="body"
        required
        maxLength={5000}
        className={[
          'resize-y rounded-[16px] border border-[#e0d2c5] px-4 py-3 text-sm outline-none focus:border-[#b98d6d]',
          compact ? 'min-h-20' : 'min-h-28',
        ].join(' ')}
        placeholder={placeholder}
      />

      {!compact ? (
        <label className="grid gap-2 text-sm font-semibold text-[#3c322d]">
          Р”РѕРґР°С‚Рё С„РѕС‚Рѕ
          <input
            name="images"
            type="file"
            accept={PHOTO_INPUT_ACCEPT}
            multiple
            className={buttonStyles.fileInput}
          />
        </label>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        {state ? (
          <p className={state.ok ? 'text-sm text-green-700' : 'text-sm text-red-700'}>
            {state.ok ? 'РљРѕРјРµРЅС‚Р°СЂ РѕРїСѓР±Р»С–РєРѕРІР°РЅРѕ.' : state.msg}
          </p>
        ) : null}
      </div>
    </form>
  );
}
