import { useState, useRef, useEffect } from 'react';
import { recalcSegmentDistances } from '../utils/distanceUtils';

// 번호 동그라미 마커 생성
function createNumberMarker(map, position, number) {
  const content = `
    <div class="route-marker">${number}</div>
  `;

  return new window.kakao.maps.CustomOverlay({
    position,
    content,
    xAnchor: 0.5,
    yAnchor: 0.5,
  });
}

export function useRoutePlanner(mapRef) {
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);

  const polylineRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;
    const map = mapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 기존 폴리라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (selectedPlaces.length === 0) {
      setTotalDistance(0);
      return;
    }

    const path = [];
    const newMarkers = [];

    selectedPlaces.forEach((p, idx) => {
      const pos = new kakao.maps.LatLng(p.lat, p.lng);
      path.push(pos);

      // 🔵 번호 동그라미 마커 생성
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

      setTotalDistance(polyline.getLength() / 1000); // km
    } else {
      setTotalDistance(0);
    }
  }, [selectedPlaces, mapRef]);

  return {
    selectedPlaces,
    totalDistance,
    draggingIndex,

    // 🔥 장소 추가할 때 routeId 생성해서 넣기
    handlePlaceSelect: (place) => {
      setSelectedPlaces((prev) => {
        const routeId = `${place.id}-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`;

        const next = [...prev, { ...place, routeId }];
        return recalcSegmentDistances(next);
      });
    },

    handleRemovePlace: (index) => {
      setSelectedPlaces((prev) =>
        recalcSegmentDistances(prev.filter((_, i) => i !== index))
      );
    },

    handleDragStart: (i) => setDraggingIndex(i),

    handleDragOver: (e) => e.preventDefault(),

    handleDrop: (i) => {
      if (draggingIndex === null || draggingIndex === i) return;

      setSelectedPlaces((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(draggingIndex, 1);
        arr.splice(i, 0, moved);
        return recalcSegmentDistances(arr);
      });

      setDraggingIndex(null);
    },
  };
}
