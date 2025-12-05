// src/hooks/useTripPlanner.js
import { useRegionSearch } from './useRegionSearch';
import { useRoutePlanner } from './useRoutePlanner';

/* =========================================
 * useTripPlanner
 * - 검색(Region) + 경로(Route) 훅 통합
 * - PlannerMap에서 편하게 한 번에 사용하도록 제공
 * =======================================*/
export function useTripPlanner(mapRef) {
  // 검색 / 카테고리 / 페이지 / 리스트
  const region = useRegionSearch(mapRef);

  // 경로 / 타임라인 / 드래그 정렬
  const route = useRoutePlanner(mapRef);

  /* -----------------------------------------
   * 반환: region + route 를 보기 좋게 정리해서 제공
   * --------------------------------------*/
  return {
    // --- 지역 검색 관련 ---
    regionKeyword: region.regionKeyword,
    category: region.category,
    categories: region.categories,
    places: region.places,
    center: region.center,
    page: region.page,
    totalPages: region.totalPages,
    totalCount: region.totalCount,
    setRegionKeyword: region.setRegionKeyword,
    handleRegionSearch: region.handleRegionSearch,
    handleCategoryChange: region.handleCategoryChange,
    handlePageChange: region.handlePageChange,

    // --- 경로/타임라인 관련 ---
    selectedPlaces: route.selectedPlaces,
    draggingIndex: route.draggingIndex,
    totalDistance: route.totalDistance,
    handlePlaceSelect: route.handlePlaceSelect,
    handleRemovePlace: route.handleRemovePlace,
    handleClearAll: route.handleClearAll,
    handleDragStart: route.handleDragStart,
    handleDragOver: route.handleDragOver,
    handleDrop: route.handleDrop,
  };
}
