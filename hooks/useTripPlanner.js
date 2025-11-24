// src/hooks/useTripPlanner.js
import { useState, useRef } from 'react';
import { CONTENT_TYPE_BY_CATEGORY } from '../config/tourApiConfig';
import { fetchPlacesByLocation } from '../services/tourApiService';

function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function recalcSegmentDistances(placesArray) {
  return placesArray.map((p, idx) => {
    let segmentDistance = null;

    if (idx > 0) {
      const prev = placesArray[idx - 1];
      segmentDistance = calcDistanceKm(prev.lat, prev.lng, p.lat, p.lng);
    }

    return {
      ...p,
      order: idx + 1,
      segmentDistance,
    };
  });
}

// mapRef: useKakaoMap에서 받은 ref
export function useTripPlanner(mapRef) {
  const [regionKeyword, setRegionKeyword] = useState('');
  const [category, setCategory] = useState('숙박');
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [center, setCenter] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const polylineRef = useRef(null);

  const categories = ['숙박', '음식점', '축제'];
  const markerColors = ['#ff5252', '#40c4ff', '#69f0ae', '#ffd740', '#b388ff'];

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

  // 지역 검색
  // 🔥 지역 + 장소 통합 검색
  const handleRegionSearch = () => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    if (!regionKeyword) {
      alert('검색어를 입력하세요 (예: 인천 남동구 / 문학경기장)');
      return;
    }

    // 1️⃣ 먼저: 카카오 장소 검색(문학구장, 스타벅스 같은 거)
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(regionKeyword, (data, status) => {
      // ✅ 장소 검색 성공했고 결과가 있으면 → 그냥 이걸로 처리하고 끝
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const mapped = data.map((p) => ({
          id: p.id, // 🔥 나중에 external_id 후보
          name: p.place_name,
          category: p.category_group_name || '장소검색',
          addr: p.road_address_name || p.address_name,
          lat: Number(p.y),
          lng: Number(p.x),
        }));

        setPlaces(mapped); // 왼쪽 3. 장소 선택 리스트에 카카오 결과 뿌리기

        // 지도 범위 맞추기
        const bounds = new kakao.maps.LatLngBounds();
        mapped.forEach((p) => {
          bounds.extend(new kakao.maps.LatLng(p.lat, p.lng));
        });
        mapRef.current.setBounds(bounds);

        // center 상태도 첫 번째 결과로 맞춰두면 좋음
        const first = mapped[0];
        setCenter({ lat: first.lat, lng: first.lng });

        // 🔚 장소 검색 성공했으니 여기서 끝
        return;
      }

      // 2️⃣ 장소 검색 실패한 경우 → "지역" 검색 + TourAPI로 fallback
      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(regionKeyword, (result, status2) => {
        if (status2 === kakao.maps.services.Status.OK && result.length > 0) {
          const first = result[0];
          const lat = Number(first.y);
          const lng = Number(first.x);
          const moveLatLng = new kakao.maps.LatLng(lat, lng);

          // 지도 중심 이동
          mapRef.current.setCenter(moveLatLng);
          mapRef.current.setLevel(6);

          // center 상태 저장
          setCenter({ lat, lng });

          // 🔥 이 지역 기준으로 TourAPI에서 숙박/음식점/축제 목록 불러오기
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

  // 장소 선택 → 핀 찍고 타임라인 추가
  const handlePlaceSelect = (place) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const pos = new kakao.maps.LatLng(place.lat, place.lng);

    // 지도 중심 이동
    mapRef.current.setCenter(pos);
    mapRef.current.setLevel(5);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position: pos,
    });
    marker.setMap(mapRef.current);

    // 🔥 이제 markersRef.current 말고, place 안에 marker를 넣기!
    let segmentDistance = null;
    if (selectedPlaces.length > 0) {
      const prev = selectedPlaces[selectedPlaces.length - 1];
      segmentDistance = calcDistanceKm(
        prev.lat,
        prev.lng,
        place.lat,
        place.lng
      );
    }

    const newPlace = {
      ...place,
      marker, // 🔥 마커 저장
      order: selectedPlaces.length + 1,
      addedAt: new Date(),
      segmentDistance,
    };

    setSelectedPlaces([...selectedPlaces, newPlace]);
  };

  // 선택된 장소 배열의 순서를 기준으로 거리/순서를 다시 계산
  function recalcSegmentDistances(placesArray) {
    return placesArray.map((p, idx) => {
      let segmentDistance = null;

      if (idx > 0) {
        const prev = placesArray[idx - 1];
        segmentDistance = calcDistanceKm(prev.lat, prev.lng, p.lat, p.lng);
      }

      return {
        ...p,
        order: idx + 1,
        segmentDistance,
      };
    });
  }

  // 🔥 추가: 마커/라인 전부 다시 그리는 함수
  const redrawMarkersAndPolyline = (placesArray) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return placesArray;

    // 1) 기존 polyline 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // 2) 기존 마커(커스텀 오버레이) 제거
    placesArray.forEach((p) => {
      if (p.marker) {
        p.marker.setMap(null);
      }
    });

    // 3) 새 마커 생성 (순서/색 반영)
    const updated = placesArray.map((p, idx) => {
      const order = idx + 1;
      const pos = new kakao.maps.LatLng(p.lat, p.lng);
      const color = markerColors[(order - 1) % markerColors.length];

      // DOM 엘리먼트로 동그란 마커 만들기
      const content = document.createElement('div');
      content.innerText = String(order);
      content.style.backgroundColor = color;
      content.style.color = '#fff';
      content.style.borderRadius = '50%';
      content.style.width = '28px';
      content.style.height = '28px';
      content.style.display = 'flex';
      content.style.alignItems = 'center';
      content.style.justifyContent = 'center';
      content.style.border = '2px solid #fff';
      content.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)';
      content.style.fontSize = '13px';

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content,
        yAnchor: 1,
      });

      overlay.setMap(mapRef.current);

      return {
        ...p,
        order,
        marker: overlay,
      };
    });

    // 4) 새 polyline 생성 (2개 이상일 때만)
    if (updated.length >= 2) {
      const path = updated.map((p) => new kakao.maps.LatLng(p.lat, p.lng));

      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: '#ff5252',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });

      polyline.setMap(mapRef.current);
      polylineRef.current = polyline;
    }

    return updated;
  };

  // 드래그 & 드롭
  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggingIndex === null || draggingIndex === index) return;

    const reordered = [...selectedPlaces];
    const [moved] = reordered.splice(draggingIndex, 1);
    reordered.splice(index, 0, moved);

    const withDistance = recalcSegmentDistances(reordered);
    const withMarkers = redrawMarkersAndPolyline(withDistance);

    setSelectedPlaces(withMarkers);
    setDraggingIndex(null);
  };

  // 타임라인에서 장소 제거
  // const handleRemovePlace = (idx) => {
  //   const remaining = selectedPlaces.filter((_, i) => i !== idx);

  //   const withDistance = recalcSegmentDistances(remaining);
  //   const withMarkers = redrawMarkersAndPolyline(withDistance);

  //   setSelectedPlaces(withMarkers);
  // };
  const handleRemovePlace = (id) => {
    // 1) 삭제할 place 찾기
    const target = selectedPlaces.find((p) => p.id === id);
    if (!target) return;

    // 2) 지도에서 마커 제거
    if (target.marker) {
      target.marker.setMap(null); // 🔥 마커 지우기
    }

    // 3) selectedPlaces에서 제거
    const filtered = selectedPlaces.filter((p) => p.id !== id);

    // 4) 제거 후 번호(order)를 다시 정렬
    const reordered = filtered.map((p, index) => ({
      ...p,
      order: index + 1,
    }));

    setSelectedPlaces(reordered);
  };

  const totalDistance = selectedPlaces.reduce(
    (sum, p) => sum + (p.segmentDistance || 0),
    0
  );
  // 🔥 건물/장소 이름 검색용
  const handleKeywordSearch = () => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;
    if (!regionKeyword) {
      // 기존 input 그대로 재사용
      alert('검색어를 입력하세요 (예: 문학구장, 스타벅스 인천터미널)');
      return;
    }

    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(regionKeyword, (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        alert('검색 결과가 없습니다.');
        return;
      }

      // kakao 결과를 우리가 쓰는 형태로 변환
      const resultPlaces = data.map((p) => ({
        id: p.id, // 🔥 external_id 후보
        name: p.place_name,
        category: p.category_group_name || '장소검색',
        addr: p.road_address_name || p.address_name,
        lat: Number(p.y),
        lng: Number(p.x),
      }));

      setPlaces(resultPlaces); // 왼쪽 3. 장소 리스트에 뿌리기

      // 지도 범위 맞추기
      const bounds = new kakao.maps.LatLngBounds();
      resultPlaces.forEach((p) => {
        bounds.extend(new kakao.maps.LatLng(p.lat, p.lng));
      });
      mapRef.current.setBounds(bounds);
    });
  };

  return {
    // 상태
    regionKeyword,
    category,
    categories,
    places,
    selectedPlaces,
    center,
    draggingIndex,
    totalDistance,

    // setter/핸들러
    setRegionKeyword,
    handleRegionSearch,
    handleCategoryChange,
    handlePlaceSelect,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleRemovePlace,
  };
}
