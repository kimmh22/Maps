// src/hooks/useRoutePlanner.js
import { useRef, useState } from 'react';
import { recalcSegmentDistances } from '../utils/distanceUtils';
import { redrawMarkersAndPolyline } from '../utils/mapDrawingUtils';

const DEFAULT_MARKER_COLORS = [
  '#ff5252',
  '#40c4ff',
  '#69f0ae',
  '#ffd740',
  '#b388ff',
];

export function useRoutePlanner(mapRef, options = {}) {
  const markerColors = options.markerColors || DEFAULT_MARKER_COLORS;

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // 🔥 선택된 장소 + 지도 싱크 허브
  const syncSelectedPlacesWithMap = (basePlaces) => {
    const withDistance = recalcSegmentDistances(basePlaces);
    const withMarkers = redrawMarkersAndPolyline(
      mapRef,
      withDistance,
      markersRef,
      polylineRef,
      markerColors
    );

    setSelectedPlaces(withMarkers);
  };

  // 장소 선택
  const handlePlaceSelect = (place) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const pos = new kakao.maps.LatLng(place.lat, place.lng);
    mapRef.current.setCenter(pos);
    mapRef.current.setLevel(5);

    const next = [...selectedPlaces, place];
    syncSelectedPlacesWithMap(next);
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

    syncSelectedPlacesWithMap(reordered);
    setDraggingIndex(null);
  };

  // 삭제
  const handleRemovePlace = (idx) => {
    const remaining = selectedPlaces.filter((_, i) => i !== idx);
    syncSelectedPlacesWithMap(remaining);
  };

  // 총 이동 거리
  const totalDistance = selectedPlaces.reduce(
    (sum, p) => sum + (p.segmentDistance || 0),
    0
  );

  return {
    // 상태
    selectedPlaces,
    draggingIndex,
    totalDistance,

    // 핸들러
    handlePlaceSelect,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleRemovePlace,
  };
}
