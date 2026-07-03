import Link from 'next/link';
import { notFound } from 'next/navigation';

import ExchangeNewForm from '@/app/components/exchange/ExchangeNewForm';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getExchangeCreateFormServer } from '@/app/services/exchangeServerServices';
import {
  EXCHANGE_ITEM_TYPES,
  type ExchangeItemType,
} from '@/app/types/exchangeTypes';
import { firstValue } from '@/app/utils/valueUtils';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';
import { getApiErrorMessage, getApiStatus } from '@/errors/ApiError';

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ExchangeNewParams = {
  requestedType: ExchangeItemType;
  requestedId: number;
  ownerId: number;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  return firstValue(params[key]) ?? null;
}

function readPositiveNumber(
  params: Record<string, string | string[] | undefined>,
  key: string,
): number | null {
  const value = Number(readParam(params, key));

  return Number.isFinite(value) && value > 0 ? value : null;
}

function readExchangeItemType(
  params: Record<string, string | string[] | undefined>,
): ExchangeItemType | null {
  const value = readParam(params, 'requested_type');

  if (!value) return null;
  if (!EXCHANGE_ITEM_TYPES.includes(value as ExchangeItemType)) return null;

  return value as ExchangeItemType;
}

function readExchangeNewParams(
  params: Record<string, string | string[] | undefined>,
): ExchangeNewParams | null {
  const requestedType = readExchangeItemType(params);
  const requestedId = readPositiveNumber(params, 'requested_id');
  const ownerId = readPositiveNumber(params, 'owner_id');

  if (!requestedType || !requestedId || !ownerId) {
    return null;
  }

  return {
    requestedType,
    requestedId,
    ownerId,
  };
}

export default async function ExchangeNewPage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const params = (await searchParams) ?? {};
  const exchangeParams = readExchangeNewParams(params);

  if (exchangeParams === null) {
    notFound();
  }

  const { requestedType, requestedId, ownerId } = exchangeParams;

  let formData;

  try {
    formData = await getExchangeCreateFormServer({
      requestedType,
      requestedId,
      ownerId,
    });
  } catch (error) {
    const status = getApiStatus(error);
    const message =
      status === 400 || status === 404
        ? 'РћРіРѕР»РѕС€РµРЅРЅСЏ РІР¶Рµ РЅРµРґРѕСЃС‚СѓРїРЅРµ, РЅРµ РїС–РґС‚СЂРёРјСѓС” РѕР±РјС–РЅ Р°Р±Рѕ РЅР°Р»РµР¶РёС‚СЊ РІР°Рј.'
        : getApiErrorMessage(
            error,
            'РќРµ РІРґР°Р»РѕСЃСЏ РїС–РґРіРѕС‚СѓРІР°С‚Рё РѕР±РјС–РЅ. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р· РїС–Р·РЅС–С€Рµ.',
          );

    return (
      <main className={exchangeStyles.page}>
        <div>
          <h1 className={exchangeStyles.title}>РћР±РјС–РЅ РЅРµРґРѕСЃС‚СѓРїРЅРёР№</h1>
          <p className={exchangeStyles.subtitle}>{message}</p>
        </div>

        <Link
          href={wardrobePageUrlBuilder.me.list()}
          className={`${exchangeStyles.button} ${exchangeStyles.buttonSecondary}`}
        >
          РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РѕРіРѕР»РѕС€РµРЅСЊ
        </Link>
      </main>
    );
  }

  return (
    <main className={exchangeStyles.page}>
      <div>
        <h1 className={exchangeStyles.title}>РќРѕРІР° РїСЂРѕРїРѕР·РёС†С–СЏ РѕР±РјС–РЅСѓ</h1>
        <p className={exchangeStyles.subtitle}>
          РћР±РµСЂС–С‚СЊ, С‰Рѕ С…РѕС‡РµС‚Рµ Р·Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РІР»Р°СЃРЅРёРєСѓ РїРѕР·РёС†С–С—.
        </p>
      </div>

      <ExchangeNewForm
        requestedType={requestedType}
        requestedId={requestedId}
        ownerId={ownerId}
        itemGroups={formData.items}
        limits={formData.limits}
        requested={formData.requested}
      />
    </main>
  );
}
