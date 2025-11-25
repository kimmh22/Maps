// src/hooks/useRegionSearch.js
import { useState } from 'react';
import { CONTENT_TYPE_BY_CATEGORY } from '../config/tourApiConfig';
import { fetchPlacesByLocation } from '../services/tourApiService';

export function useRegionSearch(mapRef) {
  const [regionKeyword, setRegionKeyword] = useState('');
  const [category, setCategory] = useState('숙박');
  const [places, setPlaces] = useState([]);
  const [center, setCenter] = useState(null);

  const categories = ['숙박', '음식점', '축제'];

  // TourAPI에서 장소 가져오기
  const loadPlacesFromTourAPI = async (lat, lng, cat) => {
    try {
      const contentTypeId = CONTENT_TYPE_BY_CATEGORY[cat];
      if (!contentTypeId) {
        console.error('알 수 없는 카테고리:', cat);
        return;
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
          category: cat,
          addr: it.addr1,
          lat: Number(it.mapy),
          lng: Number(it.mapx),
        }));

      setPlaces(mapped);
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

    // 1️⃣ 장소 검색 시도
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

        setPlaces(mapped);

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

      geocoder.addressSearch(regionKeyword, (result, status2) => {
        if (status2 === kakao.maps.services.Status.OK && result.length > 0) {
          const first = result[0];
          const lat = Number(first.y);
          const lng = Number(first.x);
          const moveLatLng = new kakao.maps.LatLng(lat, lng);

          mapRef.current.setCenter(moveLatLng);
          mapRef.current.setLevel(6);

          setCenter({ lat, lng });

          loadPlacesFromTourAPI(lat, lng, category);
        } else {
          alert('해당 장소/지역을 찾을 수 없습니다.');
        }
      });
    });
  };

  // 카테고리 변경
  const handleCategoryChange = (cat) => {
    setCategory(cat);

    if (center) {
      loadPlacesFromTourAPI(center.lat, center.lng, cat);
    } else {
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
