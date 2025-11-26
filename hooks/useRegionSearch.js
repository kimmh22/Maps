// src/hooks/useRegionSearch.js
import { useState } from 'react';
import { CONTENT_TYPE_BY_CATEGORY } from '../config/tourApiConfig';
import { fetchPlacesByLocation } from '../services/tourApiService';

// "전체"에서 실제로 TourAPI를 호출할 카테고리들
const BASE_CATEGORIES = ['숙박', '음식점', '축제'];

export function useRegionSearch(mapRef) {
  const [regionKeyword, setRegionKeyword] = useState('');
  const [category, setCategory] = useState('전체'); // ✅ 기본값: 전체
  const [places, setPlaces] = useState([]);
  const [basePlaces, setBasePlaces] = useState([]); // ✅ 처음 전체 결과를 기억
  const [center, setCenter] = useState(null);

  // ✅ UI에 보여줄 카테고리 목록
  const categories = ['전체', ...BASE_CATEGORIES];

  // TourAPI에서 장소 가져오기
  const loadPlacesFromTourAPI = async (
    lat,
    lng,
    cat,
    { saveAsBase = false } = {}
  ) => {
    try {
      // ✅ "전체"면 BASE_CATEGORIES 전부 조회
      const catsToLoad = cat === '전체' ? BASE_CATEGORIES : [cat];

      const allResults = [];

      for (const c of catsToLoad) {
        const contentTypeId = CONTENT_TYPE_BY_CATEGORY[c];
        if (!contentTypeId) {
          console.error('알 수 없는 카테고리:', c);
          continue;
        }

        const items = await fetchPlacesByLocation({
          lat,
          lng,
          contentTypeId,
        });

        const mapped = items
          .filter((it) => it.mapx && it.mapy)
          .map((it) => ({
            id: it.contentid,
            name: it.title,
            category: c, // ✅ 각 결과에 실제 카테고리 태그
            addr: it.addr1,
            lat: Number(it.mapy),
            lng: Number(it.mapx),
          }));

        allResults.push(...mapped);
      }

      setPlaces(allResults);

      // ✅ "처음 전체 검색 결과"로 쓰고 싶을 때만 basePlaces에도 저장
      if (saveAsBase) {
        setBasePlaces(allResults);
      }
    } catch (err) {
      console.error('TourAPI 호출 실패:', err);
      alert(
        '공공데이터 API 호출 중 오류가 발생했습니다. (CORS나 키 설정 확인 필요)'
      );
    }
  };

  // 🔥 지역 + 장소 통합 검색
  const handleRegionSearch = () => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    if (!regionKeyword) {
      alert('검색어를 입력하세요 (예: 인천 남동구 / 문학경기장)');
      return;
    }

    const ps = new kakao.maps.services.Places();

    // 1️⃣ 장소 검색 시도 (카카오 장소 검색)
    ps.keywordSearch(regionKeyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.place_name,
          category: p.category_group_name || '장소검색',
          addr: p.road_address_name || p.address_name,
          lat: Number(p.y),
          lng: Number(p.x),
        }));

        // ✅ 처음 전체 검색 결과로 저장
        setPlaces(mapped);
        setBasePlaces(mapped);
        setCategory('전체');

        const bounds = new kakao.maps.LatLngBounds();
        mapped.forEach((p) => {
          bounds.extend(new kakao.maps.LatLng(p.lat, p.lng));
        });
        mapRef.current.setBounds(bounds);

        const first = mapped[0];
        setCenter({ lat: first.lat, lng: first.lng });

        return;
      }

      // 2️⃣ 장소 검색 실패 → 지역 검색 + TourAPI
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

          // ✅ 여기서는 "전체" 기준으로 TourAPI 조회 + basePlaces 저장
          await loadPlacesFromTourAPI(lat, lng, '전체', { saveAsBase: true });
        } else {
          alert('해당 장소/지역을 찾을 수 없습니다.');
        }
      });
    });
  };

  // 카테고리 변경
  const handleCategoryChange = (cat) => {
    setCategory(cat);

    // ✅ 전체를 다시 누르면: 처음 검색 결과(basePlaces)를 그대로 보여줌
    if (cat === '전체') {
      setPlaces(basePlaces);
      return;
    }

    // ✅ 다른 카테고리(숙박/음식점/축제)는 TourAPI로 새로 조회
    if (center) {
      loadPlacesFromTourAPI(center.lat, center.lng, cat);
    } else {
      // 아직 중심이 없으면 일단 리스트 비우기
      setPlaces([]);
    }
  };

  return {
    // 상태
    regionKeyword,
    category,
    categories,
    places,
    center,

    // 핸들러
    setRegionKeyword,
    handleRegionSearch,
    handleCategoryChange,
  };
}
