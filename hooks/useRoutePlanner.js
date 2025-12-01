// src/hooks/useRoutePlanner.js
import { useState, useRef, useEffect } from 'react';

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

  // 🔥 3. 이벤트 핸들러들 (여기에는 if 써도 됨)
  const handlePlaceSelect = (place) => {
    // 동일한 참조 push 방지 (중복 삭제 문제 해결)
    setSelectedPlaces((prev) => [...prev, { ...place }]);
  };

  const handleRemovePlace = (index) => {
    setSelectedPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (index) => {
    // 기본 동작 방지 (드롭 가능하게)
    // 이건 SearchPanel/Timeline 쪽에서 e.preventDefault() 해줄 수도 있음
  };

  const handleDrop = (index) => {
    if (draggingIndex === null || draggingIndex === index) return;

    setSelectedPlaces((prev) => {
      const newArr = [...prev];
      const [moved] = newArr.splice(draggingIndex, 1);
      newArr.splice(index, 0, moved);
      return newArr;
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
