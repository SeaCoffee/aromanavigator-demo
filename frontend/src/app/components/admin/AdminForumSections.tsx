import {
  createForumSectionFormAction,
  deleteForumSectionFormAction,
  updateForumSectionFormAction,
} from '@/app/actions/forumActions';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import type { ForumSection } from '@/app/types/forumTypes';

export default function AdminForumSections({ sections }: { sections: ForumSection[] }) {
  return (
    <section className={s.panel}>
      <div>
        <h2 className="text-lg font-semibold">Р РѕР·РґС–Р»Рё С„РѕСЂСѓРјСѓ</h2>
        <p className={s.muted}>РЎС‚РІРѕСЂРµРЅРЅСЏ, РїРѕСЂСЏРґРѕРє С– РІРёРґРёРјС–СЃС‚СЊ СЂРѕР·РґС–Р»С–РІ С„РѕСЂСѓРјСѓ.</p>
      </div>

      <form action={createForumSectionFormAction} className="grid gap-3 md:grid-cols-[1fr_120px_auto_auto]">
        <input className={s.input} name="title" required placeholder="РќР°Р·РІР° РЅРѕРІРѕРіРѕ СЂРѕР·РґС–Р»Сѓ" />
        <input className={s.input} name="order" type="number" min="0" defaultValue="0" aria-label="РџРѕСЂСЏРґРѕРє" />
        <label className="flex items-center gap-2 text-sm">
          <input name="is_active" type="checkbox" defaultChecked /> РђРєС‚РёРІРЅРёР№
        </label>
        <button className={s.primaryButton} type="submit">РЎС‚РІРѕСЂРёС‚Рё</button>
        <textarea className={`${s.input} md:col-span-full`} name="description" placeholder="РћРїРёСЃ СЂРѕР·РґС–Р»Сѓ" />
      </form>

      <div className="grid gap-3">
        {sections.map((section) => (
          <div key={section.id} className="grid gap-3 rounded-xl border p-3">
            <form action={updateForumSectionFormAction} className="grid gap-3 md:grid-cols-[1fr_120px_auto_auto]">
              <input type="hidden" name="id" value={section.id} />
              <input className={s.input} name="title" required defaultValue={section.title} />
              <input className={s.input} name="order" type="number" min="0" defaultValue={section.order} aria-label="РџРѕСЂСЏРґРѕРє" />
              <label className="flex items-center gap-2 text-sm">
                <input name="is_active" type="checkbox" defaultChecked={section.is_active} /> РђРєС‚РёРІРЅРёР№
              </label>
              <button className={s.button} type="submit">Р—Р±РµСЂРµРіС‚Рё</button>
              <textarea className={`${s.input} md:col-span-full`} name="description" defaultValue={section.description} />
            </form>
            <form action={deleteForumSectionFormAction} className="flex justify-end">
              <input type="hidden" name="id" value={section.id} />
              <button className={s.dangerButton} type="submit">Р”РµР°РєС‚РёРІСѓРІР°С‚Рё СЂРѕР·РґС–Р»</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
