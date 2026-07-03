import Link from 'next/link';

import ArticleCommentForm from '@/app/components/articles/ArticleCommentForm';
import ArticleCommentItem from '@/app/components/articles/ArticleCommentItem';
import type { ForumCommentThreadItem } from '@/app/types/forumTypes';

type Props = {
  articleId: number;
  refreshPath: string;
  comments: ForumCommentThreadItem[];
  count: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loginHref?: string;
};

function pageHref(path: string, page: number) {
  return `${path}?comments_page=${page}#comments`;
}

export default function ArticleCommentsSection({
  articleId,
  refreshPath,
  comments,
  count,
  page,
  hasNext,
  hasPrevious,
  loginHref,
}: Props) {
  return (
    <section
      id="comments"
      className="grid gap-5 rounded-[28px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_18px_50px_rgba(94,72,54,0.08)] sm:p-6"
    >
      <header className="grid gap-1">
        <h2 className="font-serif text-[28px] font-semibold text-[#2b211d]">
          РљРѕРјРµРЅС‚Р°СЂС–
        </h2>
        <p className="text-sm leading-6 text-[#7a6d64]">
          РћР±РіРѕРІРѕСЂРµРЅРЅСЏ РјР°С‚РµСЂС–Р°Р»Сѓ С‡РёС‚Р°С‡Р°РјРё. Р“С–Р»РѕРє РѕР±РіРѕРІРѕСЂРµРЅРЅСЏ: {count}.
        </p>
      </header>

      <ArticleCommentForm
        articleId={articleId}
        refreshPath={refreshPath}
        loginHref={loginHref}
      />

      {comments.length ? (
        <div className="grid gap-4">
          {comments.map((comment) => (
            <ArticleCommentItem
              key={comment.id}
              item={comment}
              articleId={articleId}
              refreshPath={refreshPath}
              loginHref={loginHref}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-[18px] border border-dashed border-[#d6c2b0] p-4 text-sm text-[#7a6d64]">
          РљРѕРјРµРЅС‚Р°СЂС–РІ С‰Рµ РЅРµРјР°С”.
        </p>
      )}

      {hasNext || hasPrevious ? (
        <nav className="flex items-center justify-between gap-3 text-sm font-bold">
          {hasPrevious ? (
            <Link href={pageHref(refreshPath, page - 1)}>в†ђ РџРѕРїРµСЂРµРґРЅСЏ</Link>
          ) : <span />}
          <span>РЎС‚РѕСЂС–РЅРєР° {page}</span>
          {hasNext ? (
            <Link href={pageHref(refreshPath, page + 1)}>РќР°СЃС‚СѓРїРЅР° в†’</Link>
          ) : <span />}
        </nav>
      ) : null}
    </section>
  );
}
