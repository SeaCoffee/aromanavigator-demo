// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">РЎС‚РѕСЂС–РЅРєСѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ</h1>
      <p className="text-slate-600 mb-4">РЎС…РѕР¶Рµ, С‚Р°РєРѕС— Р°РґСЂРµСЃРё РЅРµРјР°С”.</p>
      <Link href="/" className="underline text-blue-600">РќР° РіРѕР»РѕРІРЅСѓ</Link>
    </main>
  );
}
