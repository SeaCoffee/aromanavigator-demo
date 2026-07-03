import DeleteAccountForm from "@/app/components/me/DeleteAccountForm";
import { requireUserOrRedirect } from "@/app/lib/session";
import { authPageUrlBuilder } from "@/app/urls/pageUrls/authPageUrlBuilder";
import { mePageUrlBuilder } from "@/app/urls/pageUrls/mePageUrlBuilder";

export default async function DeleteAccountPage() {
  const user = await requireUserOrRedirect(
    authPageUrlBuilder.login({
      next: mePageUrlBuilder.profile.delete(),
    }),
    mePageUrlBuilder.profile.delete(),
  );

  return (
    <main className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Р’РёРґР°Р»РµРЅРЅСЏ Р°РєР°СѓРЅС‚Сѓ</h1>
        <p className="mt-1 text-sm text-gray-500">
          Р¦Рµ РЅРµР·РІРѕСЂРѕС‚РЅР° РґС–СЏ. РџС–СЃР»СЏ РІРёРґР°Р»РµРЅРЅСЏ Р°РєР°СѓРЅС‚Сѓ РґРѕСЃС‚СѓРї Р±СѓРґРµ РІС‚СЂР°С‡РµРЅРѕ.
        </p>
      </div>

      <section className="grid gap-3 rounded-2xl border p-4 shadow-sm">
        <h2 className="text-lg font-medium">Р”Р°РЅС– Р°РєР°СѓРЅС‚Сѓ</h2>

        <dl className="grid gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-gray-500">Email:</dt>
            <dd>{user.email}</dd>
          </div>

          {user.profile?.display_name ? (
            <div className="flex gap-2">
              <dt className="text-gray-500">РџСЂРѕС„С–Р»СЊ:</dt>
              <dd>{user.profile.display_name}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {user.is_staff ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          Р РѕР±РѕС‡РёР№ РѕР±Р»С–РєРѕРІРёР№ Р·Р°РїРёСЃ Р°РґРјС–РЅС–СЃС‚СЂР°С†С–С— РЅРµ РјРѕР¶РЅР° РІРёРґР°Р»РёС‚Рё С‡РµСЂРµР·
          РєРѕСЂРёСЃС‚СѓРІР°С†СЊРєС– РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ. РЎРїРѕС‡Р°С‚РєСѓ С–РЅС€РёР№ Р°РґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ РјР°С” Р·РЅСЏС‚Рё
          СЃР»СѓР¶Р±РѕРІСѓ СЂРѕР»СЊ С– РїРµСЂРµРІС–СЂРёС‚Рё, С‰Рѕ Р°РєР°СѓРЅС‚ Р±С–Р»СЊС€Рµ РЅРµ РїРѕС‚СЂС–Р±РµРЅ РґР»СЏ СЂРѕР±РѕС‚Рё.
        </section>
      ) : (
        <DeleteAccountForm email={user.email} />
      )}
    </main>
  );
}
