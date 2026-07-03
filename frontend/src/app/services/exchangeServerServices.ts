import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { exchangeApiUrlBuilder } from '@/app/urls/exchangeUrlBuilder';
import type {
  ExchangeAcceptPayload,
  ExchangeCancelPayload,
  ExchangeCreateFormResponse,
  ExchangeCreatePayload,
  ExchangeFormItemGroups,
  ExchangeItemType,
  ExchangeListResponse,
  ExchangeProposal,
  ExchangeRejectPayload,
} from '@/app/types/exchangeTypes';
import type { Query } from '@/app/types/http';

type GetExchangeCreateFormServerParams = {
  requestedType: ExchangeItemType;
  requestedId: number;
  ownerId: number;
};

export const getExchangeCreateFormServer = ({
  requestedType,
  requestedId,
  ownerId,
}: GetExchangeCreateFormServerParams) =>
  djangoJson<ExchangeCreateFormResponse>(
    exchangeApiUrlBuilder.server.createForm({
      requested_type: requestedType,
      requested_id: requestedId,
      owner_id: ownerId,
    }),
    {
      auth: 'required',
      cache: 'no-store',
    },
  );

export const createExchangeProposalServer = (payload: ExchangeCreatePayload) =>
  djangoJson<ExchangeProposal>(exchangeApiUrlBuilder.server.create(), {
    method: 'POST',
    auth: 'required',
    json: payload,
    cache: 'no-store',
  });

export const getMyExchangeSentServer = (query?: Query) =>
  djangoJson<ExchangeListResponse>(exchangeApiUrlBuilder.server.sent(query), {
    auth: 'required',
    cache: 'no-store',
  });

export const getMyExchangeReceivedServer = (query?: Query) =>
  djangoJson<ExchangeListResponse>(exchangeApiUrlBuilder.server.received(query), {
    auth: 'required',
    cache: 'no-store',
  });

export const getMyExchangeFormItemsServer = () =>
  djangoJson<ExchangeFormItemGroups>(exchangeApiUrlBuilder.server.formItems(), {
    auth: 'required',
    cache: 'no-store',
  });


export const getExchangeProposalServer = (id: number | string) =>
  djangoJson<ExchangeProposal>(exchangeApiUrlBuilder.server.detail(id), {
    auth: 'required',
    cache: 'no-store',
  });

export const acceptExchangeServer = (
  id: number | string,
  payload: ExchangeAcceptPayload,
) =>
  djangoJson<ExchangeProposal>(exchangeApiUrlBuilder.server.accept(id), {
    method: 'PATCH',
    auth: 'required',
    json: payload,
    cache: 'no-store',
  });

export const rejectExchangeServer = (
  id: number | string,
  payload: ExchangeRejectPayload,
) =>
  djangoJson<ExchangeProposal>(exchangeApiUrlBuilder.server.reject(id), {
    method: 'PATCH',
    auth: 'required',
    json: payload,
    cache: 'no-store',
  });

export const cancelExchangeServer = (
  id: number | string,
  payload: ExchangeCancelPayload = {},
) =>
  djangoJson<ExchangeProposal>(exchangeApiUrlBuilder.server.cancel(id), {
    method: 'PATCH',
    auth: 'required',
    json: payload,
    cache: 'no-store',
  });
