// src/components/PlannerMap.jsx
import { useKakaoMap } from '../hooks/useKakaoMap';
import { useTripPlanner } from '../hooks/useTripPlanner';
import SearchPanel from './SearchPanel';
import Timeline from './Timeline';

function PlannerMap() {
  const mapRef = useKakaoMap('map');
  const planner = useTripPlanner(mapRef);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* 왼쪽: 검색 / 카테고리 / 리스트 */}
      <SearchPanel
        regionKeyword={planner.regionKeyword}
        onRegionKeywordChange={planner.setRegionKeyword}
        onRegionSearch={planner.handleRegionSearch}
        category={planner.category}
        onCategoryChange={planner.handleCategoryChange}
        categories={planner.categories}
        center={planner.center}
        places={planner.places}
        onPlaceSelect={planner.handlePlaceSelect}
      />

      {/* 가운데: 지도 */}
      <div
        id="map"
        style={{ flex: 1, borderRight: '1px solid #ddd', minWidth: 0 }}
      />

      {/* 오른쪽: 타임라인 */}
      <Timeline
        selectedPlaces={planner.selectedPlaces}
        totalDistance={planner.totalDistance}
        draggingIndex={planner.draggingIndex}
        onDragStart={planner.handleDragStart}
        onDragOver={planner.handleDragOver}
        onDrop={planner.handleDrop}
        onRemove={planner.handleRemovePlace}
      />
    </div>
  );
}

export default PlannerMap;
