// src/services/tourApiService.js
import { TOURAPI_SERVICE_KEY } from '../config/tourApiConfig';

// =============================================
// 1. 기본 상수
// =============================================
export const TOUR_PAGE_SIZE = 15; // 한 페이지 조회 개수

// =============================================
// 2. 주변 기반 장소 목록 조회 (locationBasedList2)
// =============================================
export async function fetchPlacesByLocation({
  lat,
  lng,
  contentTypeId,
  page = 1,
}) {
  const baseUrl =
    'https://apis.data.go.kr/B551011/KorService2/locationBasedList2';

  // 공통 QueryString
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

  // 카테고리(contentTypeId) 지정
  if (contentTypeId) {
    params.set('contentTypeId', String(contentTypeId));
  }

  const url = `${baseUrl}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('TourAPI 응답 에러: ' + res.status);
  }

  // body stream은 한 번만 읽을 수 있음
  const data = await res.json();
  const body = data?.response?.body;

  const items = body?.items?.item || [];
  const list = Array.isArray(items) ? items : [items];

  return {
    // mapx/mapy 없는 잘못된 데이터 제외
    items: list.filter((it) => it.mapx && it.mapy),
    totalCount: body?.totalCount ?? 0,
  };
}

// =============================================
// 3. 상세 조회(detailCommon2 + detailIntro2)
// =============================================
export async function fetchTourPlaceDetail(contentId, contentTypeId) {
  const baseUrl = 'https://apis.data.go.kr/B551011/KorService2';

  // 공통 파라미터
  const baseParams = {
    serviceKey: TOURAPI_SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'trip-planner',
    _type: 'json',
    contentId: String(contentId),
  };

  // 공통 정보(detailCommon2)
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

  // 타입별 정보(detailIntro2)
  const introParams = new URLSearchParams({
    ...baseParams,
    contentTypeId: String(contentTypeId),
  });

  const commonUrl = `${baseUrl}/detailCommon2?${commonParams.toString()}`;
  const introUrl = `${baseUrl}/detailIntro2?${introParams.toString()}`;

  // 두 API 병렬 호출
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

  // 단일/배열 둘 다 처리
  const commonItem = Array.isArray(commonBody?.items?.item)
    ? commonBody.items.item[0]
    : commonBody?.items?.item || {};

  const introItem = Array.isArray(introBody?.items?.item)
    ? introBody.items.item[0]
    : introBody?.items?.item || {};

  // 타입 구분
  const isFood = String(contentTypeId) === '39';
  const isLodging = String(contentTypeId) === '32';

  // 음식점, 숙박 등에서 운영시간 필드 이름이 제각각이라 통일
  const useTime =
    introItem.usetime ||
    introItem.usetimeculture ||
    introItem.usetimefestival ||
    introItem.opentimefood ||
    null;

  // =============================================
  // 4. 필요한 필드만 추려서 반환
  // =============================================
  return {
    // 공통 정보
    title: commonItem.title,
    addr1: commonItem.addr1,
    addr2: commonItem.addr2,
    tel: commonItem.tel,
    homepage: commonItem.homepage,
    overview: commonItem.overview,
    firstimage: commonItem.firstimage,
    firstimage2: commonItem.firstimage2,

    // 소개 정보
    useTime,
    eventStartDate: introItem.eventstartdate || null,
    eventEndDate: introItem.eventenddate || null,

    // 숙박 정보
    checkInTime: isLodging ? introItem.checkintime || null : null,
    checkOutTime: isLodging ? introItem.checkouttime || null : null,
    roomCount: isLodging ? introItem.roomcount || null : null,
    roomType: isLodging ? introItem.roomtype || null : null,
    parkingLodging: isLodging ? introItem.parkinglodging || null : null,
    reservationLodging: isLodging ? introItem.reservationlodging || null : null,
    subFacility: isLodging ? introItem.subfacility || null : null,

    // 음식점 정보
    firstMenu: isFood ? introItem.firstmenu || null : null,
    treatMenu: isFood ? introItem.treatmenu || null : null,
    restDate: isFood ? introItem.restdatefood || null : null,
    parkingFood: isFood ? introItem.parkingfood || null : null,
    packing: isFood ? introItem.packing || null : null,
  };
}
