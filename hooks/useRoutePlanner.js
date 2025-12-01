// src/hooks/useRoutePlanner.js
import { useState, useRef, useEffect } from 'react';
import { recalcSegmentDistances } from '../utils/distanceUtils';

export function useRoutePlanner(mapRef) {
  // 🔥 1. 훅들은 무조건 함수 맨 위, 조건문 밖에서
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const polylineRef = useRef(null);

  // 🔥 2. 지도/경로 그리기는 useEffect 안에서 조건 분기
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    if (selectedPlaces.length < 2) {
      // 경로가 없으면 폴리라인 지우기
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      setTotalDistance(0);
      return;
    }

    // 경로 좌표 만들기
    const linePath = selectedPlaces.map(
      (p) => new kakao.maps.LatLng(p.lat, p.lng)
    );

    // 이전 선 지우기
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // 새 선 그리기
    const polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 4,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });

    polyline.setMap(mapRef.current);
    polylineRef.current = polyline;

    // 거리 계산
    const distance = polyline.getLength(); // m 단위
    setTotalDistance(distance / 1000); // km로 바꿔서 저장
  }, [mapRef, selectedPlaces]);

  // 🔥 장소 추가 (타임라인 맨 뒤에)
  const handlePlaceSelect = (place) => {
    setSelectedPlaces((prev) => {
      const next = [...prev, { ...place }];
      return recalcSegmentDistances(next);
    });
  };

  // 🔥 삭제
  const handleRemovePlace = (index) => {
    setSelectedPlaces((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return recalcSegmentDistances(next);
    });
  };

  // 🔥 드래그 시작
  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  // 🔥 드래그 중 (drop 허용을 위해 e.preventDefault 필요)
  const handleDragOver = (e, index) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    // index는 지금은 안 쓰지만, 나중에 “위에 올리면 하이라이트” 같은 데 쓸 수 있음
  };

  // 🔥 드롭 (순서 바꾸기)
  const handleDrop = (index) => {
    if (draggingIndex === null || draggingIndex === index) return;

    setSelectedPlaces((prev) => {
      const newArr = [...prev];
      const [moved] = newArr.splice(draggingIndex, 1);
      newArr.splice(index, 0, moved);
      // 순서 바뀌었으니 order / segmentDistance 다시 계산
      return recalcSegmentDistances(newArr);
    });

    setDraggingIndex(null);
  };

  // 🔥 4. 훅 호출 끝난 다음에 반환
  return {
    selectedPlaces,
    totalDistance,
    draggingIndex,
    handlePlaceSelect,
    handleRemovePlace,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
