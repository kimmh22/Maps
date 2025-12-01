// src/services/tourApiService.js
import { TOURAPI_SERVICE_KEY } from '../config/tourApiConfig';

// 한 페이지에 가져올 개수
export const TOUR_PAGE_SIZE = 15;

/**
 * 주변(위도/경도) 기준 장소 목록 조회
 * - locationBasedList2
 */
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
    numOfRows: String(TOUR_PAGE_SIZE),
    pageNo: String(page),
    mapX: String(lng),
    mapY: String(lat),
    radius: '5000',
  });

  // 숙박/축제/관광지 등 카테고리 지정
  if (contentTypeId) {
    params.set('contentTypeId', String(contentTypeId));
  }

  const url = `${baseUrl}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('TourAPI 응답 에러: ' + res.status);
  }

  // ❗ body stream 은 한 번만 읽기
  const data = await res.json();
  const body = data?.response?.body;

  const items = body?.items?.item || [];
  const list = Array.isArray(items) ? items : [items];

  return {
    // 위경도 없는 이상치 제거
    items: list.filter((it) => it.mapx && it.mapy),
    totalCount: body?.totalCount ?? 0,
  };
}

/**
 * contentId + contentTypeId로 상세 조회
 * - detailCommon2 : 공통 정보(제목, 주소, 이미지, 개요 등)
 * - detailIntro2  : 타입별 상세(이용시간, 행사기간 등)
 */
export async function fetchTourPlaceDetail(contentId, contentTypeId) {
  const baseParams = {
    serviceKey: TOURAPI_SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'trip-planner',
    _type: 'json',
    contentId: String(contentId),
  };

  // 공통 정보
  const commonParams = new URLSearchParams({
    ...baseParams,
    defaultYN: 'Y',
    firstImageYN: 'Y',
    areacodeYN: 'Y',
    catcodeYN: 'Y',
    addrinfoYN: 'Y',
    mapinfoYN: 'Y',
    overviewYN: 'Y',
  });

  // 타입별 소개 정보
  const introParams = new URLSearchParams({
    ...baseParams,
    contentTypeId: String(contentTypeId),
  });

  const baseUrl = 'https://apis.data.go.kr/B551011/KorService2';

  const commonUrl = `${baseUrl}/detailCommon2?${commonParams.toString()}`;
  const introUrl = `${baseUrl}/detailIntro2?${introParams.toString()}`;

  const [commonRes, introRes] = await Promise.all([
    fetch(commonUrl),
    fetch(introUrl),
  ]);

  if (!commonRes.ok) {
    throw new Error('detailCommon2 응답 에러: ' + commonRes.status);
  }
  if (!introRes.ok) {
    throw new Error('detailIntro2 응답 에러: ' + introRes.status);
  }

  const commonJson = await commonRes.json();
  const introJson = await introRes.json();

  const commonBody = commonJson?.response?.body;
  const introBody = introJson?.response?.body;

  const commonItem =
    (commonBody?.items?.item &&
      (Array.isArray(commonBody.items.item)
        ? commonBody.items.item[0]
        : commonBody.items.item)) ||
    {};
  const introItem =
    (introBody?.items?.item &&
      (Array.isArray(introBody.items.item)
        ? introBody.items.item[0]
        : introBody.items.item)) ||
    {};

  // 필요한 필드만 뽑아서 정리
  return {
    title: commonItem.title,
    addr1: commonItem.addr1,
    addr2: commonItem.addr2,
    tel: commonItem.tel,
    homepage: commonItem.homepage,
    overview: commonItem.overview,
    firstimage: commonItem.firstimage,
    firstimage2: commonItem.firstimage2,

    // 타입별 정보(숙박/행사/관광지 등)
    useTime:
      introItem.usetime ||
      introItem.usetimeculture ||
      introItem.usetimefestival ||
      null,
    eventStartDate: introItem.eventstartdate || null,
    eventEndDate: introItem.eventenddate || null,
    checkInTime: introItem.checkintime || null,
    checkOutTime: introItem.checkouttime || null,
  };
}
