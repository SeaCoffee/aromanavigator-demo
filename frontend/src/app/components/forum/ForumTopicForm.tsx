'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  createForumTopicAction,
  updateForumTopicAction,
} from '@/app/actions/forumActions';
import { forumTopicStyles as styles } from '@/app/components/forum/forumStyles';
import {
  normalizeActionMessage,
  parseForumTagsInput,
  forumTopicTagsToInput,
} from '@/app/components/forum/forumUtils';
import type { ForumSection, ForumTopic } from '@/app/types/forumTypes';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { PHOTO_INPUT_ACCEPT } from '@/app/utils/photoActionUtils';

type Values = {
  section: string;
  title: string;
  content: string;
  tags: string;
};

type Props = {
  mode: 'create' | 'edit';
  sections?: ForumSection[];
  topic?: ForumTopic;
  initialSectionId?: number | null;
  refreshPaths?: string[];
  onSaved?: (topic: ForumTopic) => void;
};

export default function ForumTopicForm({
  mode,
  sections = [],
  topic,
  initialSectionId = null,
  refreshPaths,
  onSaved,
}: Props) {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [savedTopic, setSavedTopic] = useState<ForumTopic | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      section: topic ? String(topic.section) : initialSectionId ? String(initialSectionId) : '',
      title: topic?.title ?? '',
      content: topic?.content ?? '',
      tags: topic ? forumTopicTagsToInput(topic) : '',
    },
  });

  const title = watch('title') ?? '';
  const content = watch('content') ?? '';

  function onSubmit(values: Values) {
    const formData = new FormData();

    formData.set('section', values.section);
    formData.set('title', values.title.trim());
    formData.set('content', values.content.trim());
    parseForumTagsInput(values.tags).forEach((tag) => formData.append('tags', tag));

    if (cover) {
      formData.set('cover', cover);
    }

    attachments.forEach((image) => formData.append('attachments', image));
    setServerMsg(null);

    startTransition(async () => {
      const result =
        mode === 'edit' && topic
          ? await updateForumTopicAction(topic.id, formData, { refreshPaths })
          : await createForumTopicAction(formData, { refreshPaths });

      if (!result.ok) {
        setServerMsg(normalizeActionMessage(result.msg));
        return;
      }

      setSavedTopic(result.data);
      setServerMsg(result.msg ?? 'РўРµРјСѓ Р·Р±РµСЂРµР¶РµРЅРѕ.');
      setCover(null);
      setAttachments([]);
      reset({
        section: String(result.data.section),
        title: result.data.title,
        content: result.data.content,
        tags: forumTopicTagsToInput(result.data),
      });
      onSaved?.(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.title}>
        {mode === 'create' ? 'РќРѕРІР° С‚РµРјР° С„РѕСЂСѓРјСѓ' : 'Р РµРґР°РіСѓРІР°РЅРЅСЏ С‚РµРјРё'}
      </div>

      {mode === 'create' ? (
        <label className={styles.label}>
          <span className={styles.labelText}>Р РѕР·РґС–Р»*</span>
          <select
            {...register('section', {
              required: 'РћР±РµСЂС–С‚СЊ СЂРѕР·РґС–Р».',
              validate: (value) => Number(value) > 0 || 'РћР±РµСЂС–С‚СЊ СЂРѕР·РґС–Р».',
            })}
            className={styles.select}
            disabled={isPending}
          >
            <option value="">РћР±РµСЂС–С‚СЊ СЂРѕР·РґС–Р»</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
          </select>
          {errors.section ? <span className={styles.error}>{errors.section.message}</span> : null}
        </label>
      ) : (
        <p className={styles.hint}>Р РѕР·РґС–Р»: <b>{topic?.section_title ?? 'Р¤РѕСЂСѓРј'}</b></p>
      )}

      <label className={styles.label}>
        <span className={styles.labelText}>Р—Р°РіРѕР»РѕРІРѕРє*</span>
        <input
          {...register('title', {
            required: 'Р’РєР°Р¶С–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє.',
            validate: (value) => value.trim().length > 0 || 'Р’РєР°Р¶С–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє.',
            maxLength: { value: 160, message: 'РњР°РєСЃРёРјСѓРј 160 СЃРёРјРІРѕР»С–РІ.' },
          })}
          className={styles.input}
          disabled={isPending}
        />
        <span className={styles.counter}>{title.trim().length}/160</span>
        {errors.title ? <span className={styles.error}>{errors.title.message}</span> : null}
      </label>

      <label className={styles.label}>
        <span className={styles.labelText}>РўРµРєСЃС‚ С‚РµРјРё*</span>
        <textarea
          {...register('content', {
            required: 'Р”РѕРґР°Р№С‚Рµ С‚РµРєСЃС‚ С‚РµРјРё.',
            validate: (value) => value.trim().length > 0 || 'Р”РѕРґР°Р№С‚Рµ С‚РµРєСЃС‚ С‚РµРјРё.',
          })}
          className={styles.textarea}
          disabled={isPending}
        />
        <span className={styles.counter}>{content.trim().length} СЃРёРјРІРѕР»С–РІ</span>
        {errors.content ? <span className={styles.error}>{errors.content.message}</span> : null}
      </label>

      <label className={styles.label}>
        <span className={styles.labelText}>РўРµРіРё</span>
        <input {...register('tags')} placeholder="С‚СЂРѕСЏРЅРґР°, СѓРґ, Р¶Р°СЃРјРёРЅ" className={styles.input} disabled={isPending} />
        <span className={styles.hint}>Р’РєР°Р¶С–С‚СЊ С‡РµСЂРµР· РєРѕРјСѓ.</span>
      </label>

      <section className={styles.mediaPanel}>
        <label className={styles.label}>
          <span className={styles.labelText}>РћР±РєР»Р°РґРёРЅРєР°</span>
          <input type="file" accept={PHOTO_INPUT_ACCEPT} onChange={(event) => setCover(event.target.files?.item(0) ?? null)} className={styles.input} />
        </label>
        <label className={styles.label}>
          <span className={styles.labelText}>Р¤РѕС‚РѕРіСЂР°С„С–С— РґРѕ С‚РµРјРё</span>
          <input
            type="file"
            multiple
            accept={PHOTO_INPUT_ACCEPT}
            onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
            className={styles.input}
          />
          {attachments.length ? <span className={styles.hint}>РћР±СЂР°РЅРѕ: {attachments.length}</span> : null}
        </label>
      </section>

      <div className={styles.actions}>
        <button type="submit" disabled={isPending} className={styles.submitButton}>
          {isPending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : mode === 'create' ? 'РЎС‚РІРѕСЂРёС‚Рё С‚РµРјСѓ' : 'Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё'}
        </button>
        {(savedTopic ?? topic) ? (
          <Link href={forumPageUrlBuilder.topics.detail((savedTopic ?? topic)!.id)} className={styles.linkButton}>
            РџРµСЂРµР№С‚Рё РґРѕ С‚РµРјРё
          </Link>
        ) : null}
      </div>

      {serverMsg ? <div className={savedTopic ? styles.success : styles.error}>{serverMsg}</div> : null}
    </form>
  );
}
