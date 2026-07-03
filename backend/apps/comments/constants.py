from __future__ import annotations


MAX_COMMENT_LEN = 5000

# Р­С‚Рѕ СѓР¶Рµ РЅРµ UX-РѕРіСЂР°РЅРёС‡РµРЅРёРµ С„РѕСЂСѓРјР°, Р° С‚РµС…РЅРёС‡РµСЃРєР°СЏ Р·Р°С‰РёС‚Р°
# РґР»СЏ СЃС‚Р°СЂРѕРіРѕ tree endpoint, РµСЃР»Рё РѕРЅ РіРґРµ-С‚Рѕ РµС‰Рµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ.
MAX_COMMENT_TREE_DEPTH = 50

# Public write endpoints must stay explicitly allowlisted.
ALLOWED_COMMENT_MODELS: set[str] = {
    "articles.article",
    "forum.forumtopicmodel",
    "fragrance.fragrancemodel",
}
