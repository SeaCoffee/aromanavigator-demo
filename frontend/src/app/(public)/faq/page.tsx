import { getFaqServer } from '@/app/services/siteContentServices.server';

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const faq = await getFaqServer();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6847]">Р”РѕРїРѕРјРѕРіР°</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Р§Р°СЃС‚С– РїРёС‚Р°РЅРЅСЏ</h1>
      </header>
      <div className="grid gap-3">
        {faq.map((item) => (
          <details className="rounded-2xl border border-[#eadfd3] bg-white p-5 open:shadow-sm" key={item.id}>
            <summary className="cursor-pointer font-semibold">{item.question}</summary>
            <p className="mt-3 whitespace-pre-line leading-7 text-[#62534b]">{item.answer}</p>
          </details>
        ))}
        {!faq.length ? <p className="text-[#6f6159]">РџРёС‚Р°РЅРЅСЏ РїРѕРєРё РЅРµ РґРѕРґР°РЅС–.</p> : null}
      </div>
    </main>
  );
}
