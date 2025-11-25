// src/hooks/useTripPlanner.js
import { useRegionSearch } from './useRegionSearch';
import { useRoutePlanner } from './useRoutePlanner';

// mapRef: useKakaoMap에서 받은 ref
export function useTripPlanner(mapRef) {
  // A. 지역/카테고리/장소 리스트 관련
  const region = useRegionSearch(mapRef);

  // B. 선택된 장소 + 타임라인 + 마커/라인 관련
  const route = useRoutePlanner(mapRef);

  return {
    // --- 지역 검색 관련 ---
    regionKeyword: region.regionKeyword,
    category: region.category,
    categories: region.categories,
    places: region.places,
    center: region.center,
    setRegionKeyword: region.setRegionKeyword,
    handleRegionSearch: region.handleRegionSearch,
    handleCategoryChange: region.handleCategoryChange,

    // --- 경로/타임라인 관련 ---
    selectedPlaces: route.selectedPlaces,
    draggingIndex: route.draggingIndex,
    totalDistance: route.totalDistance,
    handlePlaceSelect: route.handlePlaceSelect,
    handleDragStart: route.handleDragStart,
    handleDragOver: route.handleDragOver,
    handleDrop: route.handleDrop,
    handleRemovePlace: route.handleRemovePlace,
  };
}
