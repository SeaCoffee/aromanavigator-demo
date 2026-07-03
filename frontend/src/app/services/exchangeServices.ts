import { userApi } from '@/app/services/userApi';
import { exchangeApiUrlBuilder } from '@/app/urls/exchangeUrlBuilder';
import type {
  ExchangeAcceptPayload,
  ExchangeCancelPayload,
  ExchangeCreatePayload,
  ExchangeListResponse,
  ExchangeProposal,
  ExchangeRejectPayload,
} from '@/app/types/exchangeTypes';
import type { Query } from '@/app/types/http';

export const createExchangeProposal = (payload: ExchangeCreatePayload) =>
  userApi.post<ExchangeProposal>(exchangeApiUrlBuilder.user.create(), {
    json: payload,
    cache: 'no-store',
  });

export const getMyExchangeSent = (query?: Query) =>
  userApi.get<ExchangeListResponse>(exchangeApiUrlBuilder.user.sent(query), {
    cache: 'no-store',
  });

export const getMyExchangeReceived = (query?: Query) =>
  userApi.get<ExchangeListResponse>(exchangeApiUrlBuilder.user.received(query), {
    cache: 'no-store',
  });

export const getExchangeProposal = (id: number | string) =>
  userApi.get<ExchangeProposal>(exchangeApiUrlBuilder.user.detail(id), {
    cache: 'no-store',
  });

export const acceptExchange = (
  id: number | string,
  payload: ExchangeAcceptPayload,
) =>
  userApi.patch<ExchangeProposal>(exchangeApiUrlBuilder.user.accept(id), {
    json: payload,
    cache: 'no-store',
  });

export const rejectExchange = (
  id: number | string,
  payload: ExchangeRejectPayload,
) =>
  userApi.patch<ExchangeProposal>(exchangeApiUrlBuilder.user.reject(id), {
    json: payload,
    cache: 'no-store',
  });

export const cancelExchange = (
  id: number | string,
  payload: ExchangeCancelPayload = {},
) =>
  userApi.patch<ExchangeProposal>(exchangeApiUrlBuilder.user.cancel(id), {
    json: payload,
    cache: 'no-store',
  });
