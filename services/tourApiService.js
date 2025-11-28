// src/services/tourApiService.js
import { TOURAPI_SERVICE_KEY } from '../config/tourApiConfig';

export const TOUR_PAGE_SIZE = 15;

export async function fetchPlacesByLocation({
  lat,
  lng,
  contentTypeId,
  page = 1,
}) {
  const baseUrl =
    'https://apis.data.go.kr/B551011/KorService2/locationBasedList2';

  const params = new URLSearchParams({
    serviceKey: TOURAPI_SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'trip-planner',
    _type: 'json',
    numOfRows: String(TOUR_PAGE_SIZE), // 🔥 한 페이지 15개
    pageNo: String(page), // 🔥 현재 페이지
    mapX: String(lng),
    mapY: String(lat),
    radius: '5000',
    contentTypeId,
  });

  const url = `${baseUrl}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('TourAPI 응답 에러: ' + res.status);
  }

  const data = await res.json();
  const sdata = await res.json();
  const body = data?.response?.body;

  const items = body?.items?.item || [];
  const list = Array.isArray(items) ? items : [items];

  return {
    items: list.filter((it) => it.mapx && it.mapy),
    totalCount: body?.totalCount ?? 0,
  };
}
