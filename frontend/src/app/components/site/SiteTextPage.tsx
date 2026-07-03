import type { SitePage } from '@/app/types/siteContentTypes';

export default function SiteTextPage({
  page,
  children,
}: {
  page: SitePage;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b6847]">
          Aroma Navigator
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{page.title}</h1>
      </header>
      <div className="whitespace-pre-line text-base leading-8 text-[#51443d]">{page.body}</div>
      {children ? <div className="mt-10">{children}</div> : null}
    </main>
  );
}
