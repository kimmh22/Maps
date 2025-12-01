import { useRegionSearch } from './useRegionSearch';
import { useRoutePlanner } from './useRoutePlanner';

export function useTripPlanner(mapRef) {
  const region = useRegionSearch(mapRef);
  const route = useRoutePlanner(mapRef);

  return {
    // --- 지역 검색 관련 ---
    regionKeyword: region.regionKeyword,
    category: region.category,
    categories: region.categories,
    places: region.places,
    center: region.center,
    page: region.page,
    totalPages: region.totalPages,
    setRegionKeyword: region.setRegionKeyword,
    handleRegionSearch: region.handleRegionSearch,
    handleCategoryChange: region.handleCategoryChange,
    handlePageChange: region.handlePageChange,
    totalCount: region.totalCount,

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
