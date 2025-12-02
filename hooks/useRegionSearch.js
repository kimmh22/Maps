// src/hooks/useRegionSearch.js
import { useState } from 'react';
import { CONTENT_TYPE_BY_CATEGORY } from '../config/tourApiConfig';
import {
  fetchPlacesByLocation,
  TOUR_PAGE_SIZE,
} from '../services/tourApiService';

// ============================================
// 1. 상수 정의
// ============================================
const CATEGORIES = ['전체', '관광지', '문화시설', '숙박', '음식점', '축제'];
const PAGE_SIZE = 15; // Kakao Places 한 페이지 크기

export function useRegionSearch(mapRef) {
  // ============================================
  // 2. 상태 정의
  // ============================================

  // 검색어 / 카테고리
  const [regionKeyword, setRegionKeyword] = useState('');
  const [category, setCategory] = useState('전체');

  // 현재 화면에 보여줄 장소 목록 + 지도 중심
  const [places, setPlaces] = useState([]);
  const [center, setCenter] = useState(null);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Kakao 모드 데이터
  const [kakaoPlaces, setKakaoPlaces] = useState([]);
  const [kakaoTotalCount, setKakaoTotalCount] = useState(0);

  // TourAPI 모드 데이터
  const [tourTotalCount, setTourTotalCount] = useState(0);

  // 현재 결과 모드: 'kakao' | 'tour' | null
  const [mode, setMode] = useState(null);

  const categories = CATEGORIES;

  // ============================================
  // 3. 내부 유틸 함수들
  // ============================================

  // ---------- Kakao: 키워드 검색 한 페이지 ----------
  const searchKakaoPage = (keyword, pageNo = 1) => {
    return new Promise((resolve, reject) => {
      const { kakao } = window;
      if (!kakao) {
        resolve({ items: [], totalCount: 0 });
        return;
      }

      const ps = new kakao.maps.services.Places();

      ps.keywordSearch(
        keyword,
        (data, status, pagination) => {
          if (status === kakao.maps.services.Status.OK) {
            resolve({
              items: data,
              totalCount: pagination?.totalCount ?? data.length,
            });
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            resolve({ items: [], totalCount: 0 });
          } else {
            console.error('카카오 검색 실패:', status);
            reject(status);
          }
        },
        {
          page: pageNo,
          size: PAGE_SIZE,
        }
      );
    });
  };

  // ---------- TourAPI: 한 카테고리 한 페이지 ----------
  const loadTourPage = async ({ lat, lng, cat, pageNo = 1 }) => {
    try {
      const effectiveCat = cat === '전체' ? '관광지' : cat;
      const contentTypeId = CONTENT_TYPE_BY_CATEGORY[effectiveCat];

      if (!contentTypeId) {
        console.error('알 수 없는 카테고리:', effectiveCat);
        setPlaces([]);
        setTotalPages(1);
        setMode('tour');
        setTourTotalCount(0); // 🔥 totalCount가 없어서 0으로 명시
        return;
      }

      const { items, totalCount } = await fetchPlacesByLocation({
        lat,
        lng,
        contentTypeId,
        page: pageNo,
      });

      const mapped = items.map((it) => ({
        id: it.contentid,
        contentTypeId,
        name: it.title,
        category: effectiveCat,
        addr: it.addr1,
        lat: Number(it.mapy),
        lng: Number(it.mapx),
        imageUrl: it.firstimage || it.firstimage2 || null,
        source: 'tour',
      }));

      setPlaces(mapped);
      setMode('tour');
      setTourTotalCount(totalCount);

      const pages =
        totalCount === 0 ? 1 : Math.ceil(totalCount / TOUR_PAGE_SIZE);
      setTotalPages(pages);
    } catch (err) {
      console.error('TourAPI 호출 실패:', err);
      alert('공공데이터 API 호출 중 오류가 발생했습니다.');
    }
  };

  // ============================================
  // 4. 외부에서 쓰는 핸들러들
  // ============================================

  // ---------- 지역 검색 (검색 버튼 / 엔터) ----------
  const handleRegionSearch = async () => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    if (!regionKeyword) {
      alert('검색어를 입력하세요 (예: 인천 남동구 / 문학경기장)');
      return;
    }

    setPage(1);

    // 1️⃣ Kakao 1페이지 먼저 시도
    try {
      const { items, totalCount } = await searchKakaoPage(regionKeyword, 1);

      if (items && items.length > 0) {
        const mapped = items.map((p) => ({
          id: p.id,
          name: p.place_name,
          category: p.category_group_name || '장소검색',
          addr: p.road_address_name || p.address_name,
          lat: Number(p.y),
          lng: Number(p.x),
          imageUrl: null,
          source: 'kakao',
        }));

        setPlaces(mapped);
        setKakaoPlaces(mapped);
        setCategory('전체');
        setMode('kakao');

        setKakaoTotalCount(totalCount);
        const pages = totalCount === 0 ? 1 : Math.ceil(totalCount / PAGE_SIZE);
        setTotalPages(pages);

        // 지도 영역 맞추기
        const bounds = new kakao.maps.LatLngBounds();
        mapped.forEach((p) => {
          bounds.extend(new kakao.maps.LatLng(p.lat, p.lng));
        });
        mapRef.current.setBounds(bounds);

        const first = mapped[0];
        setCenter({ lat: first.lat, lng: first.lng });

        return; // Kakao 결과 있으면 여기서 끝
      }
    } catch (e) {
      console.error('카카오 검색 중 오류:', e);
    }

    // 2️⃣ Kakao 결과 없음 → 지오코딩 + TourAPI
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(regionKeyword, async (result, status2) => {
      if (status2 === kakao.maps.services.Status.OK && result.length > 0) {
        const first = result[0];
        const lat = Number(first.y);
        const lng = Number(first.x);
        const moveLatLng = new kakao.maps.LatLng(lat, lng);

        mapRef.current.setCenter(moveLatLng);
        mapRef.current.setLevel(6);

        setCenter({ lat, lng });
        setCategory('전체');

        await loadTourPage({ lat, lng, cat: '전체', pageNo: 1 });
      } else {
        alert('해당 장소/지역을 찾을 수 없습니다.');
      }
    });
  };

  // ---------- 카테고리 변경 (전체 / 관광지 / 숙박 / 음식점 / 축제 등) ----------
  const handleCategoryChange = async (cat) => {
    setCategory(cat);
    setPage(1);

    // "전체" 카테고리
    if (cat === '전체') {
      // Kakao 결과가 있으면 Kakao 모드 그대로 사용
      if (kakaoPlaces.length > 0) {
        setPlaces(kakaoPlaces);
        setMode('kakao');
        const pages =
          kakaoTotalCount === 0 ? 1 : Math.ceil(kakaoTotalCount / PAGE_SIZE);
        setTotalPages(pages);
        return;
      }

      // Kakao 결과가 없고 center만 있다 → Tour 전체(관광지 기준)
      if (center) {
        await loadTourPage({
          lat: center.lat,
          lng: center.lng,
          cat: '전체',
          pageNo: 1,
        });
      }
      return;
    }

    // "관광지 / 문화시설 / 숙박 / 음식점 / 축제" → 무조건 TourAPI 사용
    if (center) {
      await loadTourPage({
        lat: center.lat,
        lng: center.lng,
        cat,
        pageNo: 1,
      });
    } else {
      // center가 없으면 보여줄 게 없음
      setPlaces([]);
      setMode('tour');
      setTotalPages(1);
      setTourTotalCount(0);
    }
  };

  // ---------- 페이지 변경 (1, 2, 3, ...) ----------
  const handlePageChange = async (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);

    // 카테고리 = 전체
    if (category === '전체') {
      // Kakao 모드
      if (mode === 'kakao') {
        const { items, totalCount } = await searchKakaoPage(
          regionKeyword,
          nextPage
        );

        const mapped = (items || []).map((p) => ({
          id: p.id,
          name: p.place_name,
          category: p.category_group_name || '장소검색',
          addr: p.road_address_name || p.address_name,
          lat: Number(p.y),
          lng: Number(p.x),
          imageUrl: null,
          source: 'kakao',
        }));

        setPlaces(mapped);
        setKakaoPlaces(mapped);
        setKakaoTotalCount(totalCount);

        const pages = totalCount === 0 ? 1 : Math.ceil(totalCount / PAGE_SIZE);
        setTotalPages(pages);
      }
      // Tour 모드
      else if (mode === 'tour' && center) {
        await loadTourPage({
          lat: center.lat,
          lng: center.lng,
          cat: '전체',
          pageNo: nextPage,
        });
      }

      return;
    }

    // 카테고리 = 관광지 / 문화시설 / 숙박 / 음식점 / 축제 → 항상 TourAPI
    if (center) {
      await loadTourPage({
        lat: center.lat,
        lng: center.lng,
        cat: category,
        pageNo: nextPage,
      });
    }
  };

  // ============================================
  // 5. 반환값 (커스텀 훅 외부에서 사용할 것들)
  // ============================================

  return {
    regionKeyword,
    category,
    categories,
    places,
    center,
    page,
    totalPages,

    // Kakao / Tour 모드에 따라 totalCount 선택
    totalCount: mode === 'kakao' ? kakaoTotalCount : tourTotalCount,

    setRegionKeyword,
    handleRegionSearch,
    handleCategoryChange,
    handlePageChange,
  };
}
