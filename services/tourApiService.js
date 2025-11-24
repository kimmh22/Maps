// src/services/tourApiService.js
import { TOURAPI_SERVICE_KEY } from '../config/tourApiConfig';

export async function fetchPlacesByLocation({ lat, lng, contentTypeId }) {
  const baseUrl =
    'https://apis.data.go.kr/B551011/KorService2/locationBasedList2';

  const params = new URLSearchParams({
    serviceKey: TOURAPI_SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'trip-planner',
    _type: 'json',
    numOfRows: '30',
    pageNo: '1',
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
  const items = data?.response?.body?.items?.item;

  if (!items) return [];

  const list = Array.isArray(items) ? items : [items];

  return list.filter((it) => it.mapx && it.mapy);
}
