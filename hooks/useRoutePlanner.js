// src/hooks/useRoutePlanner.js
import { useState, useRef, useEffect } from 'react';
import { recalcSegmentDistances } from '../utils/distanceUtils';

/* =========================================
 *  번호 마커(1,2,3...) CustomOverlay 생성 함수
 * =======================================*/
function createNumberMarker(map, position, number) {
  const content = `<div class="route-marker">${number}</div>`;

  return new window.kakao.maps.CustomOverlay({
    position,
    content,
    xAnchor: 0.5,
    yAnchor: 0.5,
  });
}

/* =========================================
 *  useRoutePlanner
 *  - 경로(타임라인) 관리
 *  - 마커 + 폴리라인 렌더링
 * =======================================*/
export function useRoutePlanner(mapRef) {
  /* -----------------------------
   * 1. 상태
   * ---------------------------*/
  const [selectedPlaces, setSelectedPlaces] = useState([]); // 타임라인 장소들
  const [draggingIndex, setDraggingIndex] = useState(null); // 드래그 중인 아이템 index
  const [totalDistance, setTotalDistance] = useState(0); // 총 이동거리(km)

  // 지도 객체 관련 ref
  const polylineRef = useRef(null); // 선
  const markersRef = useRef([]); // 번호 마커들

  /* -----------------------------
   * 2. 지도에 마커/폴리라인 렌더링
   * ---------------------------*/
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;
    const map = mapRef.current;

    // 이전 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 이전 폴리라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // 장소가 없으면 거리 초기화
    if (selectedPlaces.length === 0) {
      setTotalDistance(0);
      return;
    }

    const path = [];
    const newMarkers = [];

    // 장소별 번호 마커 배치
    selectedPlaces.forEach((p, idx) => {
      const pos = new kakao.maps.LatLng(p.lat, p.lng);
      path.push(pos);

      const marker = createNumberMarker(map, pos, idx + 1);
      marker.setMap(map);
      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // 폴리라인 그리기
    if (path.length >= 2) {
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: '#0a0a0a',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });

      polyline.setMap(map);
      polylineRef.current = polyline;

      // 총 거리 계산 (m → km)
      setTotalDistance(polyline.getLength() / 1000);
    } else {
      setTotalDistance(0);
    }
  }, [selectedPlaces, mapRef]);

  /* -----------------------------
   * 3. 외부로 제공하는 메서드들
   * ---------------------------*/

  // 🔥 장소 선택 → routeId 생성 후 추가
  const handlePlaceSelect = (place) => {
    if (selectedPlaces.length >= 10) {
      alert('여행지는 최대 10개까지만 선택할 수 있어요.');
      return;
    }

    setSelectedPlaces((prev) => {
      const routeId = `${place.id}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;

      const next = [...prev, { ...place, routeId }];
      return recalcSegmentDistances(next);
    });
  };

  // 장소 삭제
  const handleRemovePlace = (index) => {
    setSelectedPlaces((prev) =>
      recalcSegmentDistances(prev.filter((_, i) => i !== index))
    );
  };

  // 🔥 전체 경로 삭제
  const clearCooldownRef = useRef(false);
  const handleClearAll = () => {
    setSelectedPlaces([]);
    setTimeout(() => {
      clearCooldownRef.current = false;
    }, 200);
    setDraggingIndex(null);
  };

  // 드래그 시작
  const handleDragStart = (i) => setDraggingIndex(i);

  // 드래그 오버(브라우저 기본 동작 막기)
  const handleDragOver = (e) => e.preventDefault();

  // 드롭하여 순서 변경
  const handleDrop = (i) => {
    if (draggingIndex === null || draggingIndex === i) return;

    setSelectedPlaces((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(draggingIndex, 1);
      arr.splice(i, 0, moved);

      return recalcSegmentDistances(arr);
    });

    setDraggingIndex(null);
  };

  /* -----------------------------
   * 4. 반환
   * ---------------------------*/
  return {
    selectedPlaces,
    totalDistance,
    draggingIndex,
    handleClearAll,

    setSelectedPlaces,
    handlePlaceSelect,
    handleRemovePlace,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
