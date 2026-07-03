type EntityTarget = {
  app?: string | null;
  model?: string | null;
  type?: string | null;
};

const ENTITY_LABELS: Record<string, string> = {
  'activity.activityevent': 'РџРѕРґС–СЏ Р°РєС‚РёРІРЅРѕСЃС‚С–',
  'activity.activityeventmodel': 'РџРѕРґС–СЏ Р°РєС‚РёРІРЅРѕСЃС‚С–',
  'articles.article': 'РЎС‚Р°С‚С‚СЏ',
  'auth.user': 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
  'comments.commentmodel': 'РљРѕРјРµРЅС‚Р°СЂ',
  'favorites.favoritemodel': 'РћР±СЂР°РЅРµ',
  'exchange.exchangeproposalmodel': 'РџСЂРѕРїРѕР·РёС†С–СЏ РѕР±РјС–РЅСѓ',
  'forum.forumsectionmodel': 'Р РѕР·РґС–Р» С„РѕСЂСѓРјСѓ',
  'forum.forumtopicmodel': 'РўРµРјР° С„РѕСЂСѓРјСѓ',
  'fragrance.brandmodel': 'Р‘СЂРµРЅРґ',
  'fragrance.fragrancemodel': 'РђСЂРѕРјР°С‚',
  'fragrance.notemodel': 'РќРѕС‚Р°',
  'fragrance.olfactoryfamilymodel': 'РћР»СЊС„Р°РєС‚РѕСЂРЅРµ СЃС–РјРµР№СЃС‚РІРѕ',
  'fragrance.perfumermodel': 'РџР°СЂС„СѓРјРµСЂ',
  'fragrance_ugc.fragranceaddrequestmodel': 'Р—Р°СЏРІРєР° РЅР° Р°СЂРѕРјР°С‚',
  'fragrance_ugc.fragrancesimilaritysuggestionmodel':
    'РџСЂРѕРїРѕР·РёС†С–СЏ СЃС…РѕР¶РѕРіРѕ Р°СЂРѕРјР°С‚Сѓ',
  'fragrance_ugc.userfragrancenotesuggestionmodel': 'РџСЂРѕРїРѕР·РёС†С–СЏ РЅРѕС‚Рё',
  'likes.likemodel': 'Р’РїРѕРґРѕР±Р°РЅРЅСЏ',
  'notifications.notificationmodel': 'РЎРїРѕРІС–С‰РµРЅРЅСЏ',
  'photos.photomodel': 'Р¤РѕС‚Рѕ',
  'tags.taggeditemmodel': 'РўРµРі',
  'taste_profile.tasteprofilemodel': 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ',
  'taste_profile.tastepreferenceitemmodel': 'РЎРјР°РєРѕРІР° РІРїРѕРґРѕР±Р°Р№РєР°',
  'users.user': 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
  'users.usermodel': 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
  'wardrobe.wardrobeitemmodel': 'Р—Р°РїРёСЃ РіР°СЂРґРµСЂРѕР±Р°',
};

const TYPE_LABELS: Record<string, string> = {
  article: 'РЎС‚Р°С‚С‚СЏ',
  comment: 'РљРѕРјРµРЅС‚Р°СЂ',
  fragrance: 'РђСЂРѕРјР°С‚',
  message: 'РџРѕРІС–РґРѕРјР»РµРЅРЅСЏ',
  photo: 'Р¤РѕС‚Рѕ',
  topic: 'РўРµРјР° С„РѕСЂСѓРјСѓ',
  user: 'РљРѕСЂРёСЃС‚СѓРІР°С‡',
};

function keyFromTarget(target: EntityTarget) {
  const app = String(target.app ?? '').trim().toLowerCase();
  const model = String(target.model ?? '').trim().toLowerCase();

  return app && model ? `${app}.${model}` : '';
}

export function getEntityTypeLabel(target: EntityTarget | null | undefined) {
  if (!target) {
    return 'РћР±КјС”РєС‚';
  }

  const key = keyFromTarget(target);
  const type = String(target.type ?? '').trim().toLowerCase();

  if (key && ENTITY_LABELS[key]) {
    return ENTITY_LABELS[key];
  }

  if (type && TYPE_LABELS[type]) {
    return TYPE_LABELS[type];
  }

  if (key.includes('comment')) return 'РљРѕРјРµРЅС‚Р°СЂ';
  if (key.includes('notification')) return 'РЎРїРѕРІС–С‰РµРЅРЅСЏ';
  if (key.includes('photo') || key.includes('image')) return 'Р¤РѕС‚Рѕ';
  if (key.includes('fragrance')) return 'РђСЂРѕРјР°С‚';
  if (key.includes('forum') && key.includes('topic')) return 'РўРµРјР° С„РѕСЂСѓРјСѓ';
  if (key.includes('user')) return 'РљРѕСЂРёСЃС‚СѓРІР°С‡';

  return 'РћР±КјС”РєС‚';
}
