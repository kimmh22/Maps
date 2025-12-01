// src/components/PlannerMap.jsx
import { useState, useEffect } from 'react';
import { useKakaoMap } from '../hooks/useKakaoMap';
import { useTripPlanner } from '../hooks/useTripPlanner';
import SearchPanel from './SearchPanel';
import Timeline from './Timeline';
import PlaceDetailPanel from './PlaceDetailPanel';
import { fetchTourPlaceDetail } from '../services/tourApiService';
import '../styles/PlannerMap.css';

function PlannerMap() {
  const mapRef = useKakaoMap('map');
  const planner = useTripPlanner(mapRef);

  const [isTimelineOpen, setIsTimelineOpen] = useState(true);

  const [activePlace, setActivePlace] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // 🔥 타임라인에서 어느 카드가 펼쳐져 있는지
  const [expandedPlaceId, setExpandedPlaceId] = useState(null);

  const toggleTimeline = () => setIsTimelineOpen((prev) => !prev);

  const handleSearchResultClick = (place) => {
    setActivePlace(place);
    if (mapRef.current && window.kakao) {
      const { kakao } = window;
      const pos = new kakao.maps.LatLng(place.lat, place.lng);
      mapRef.current.setCenter(pos);
    }
  };

  // 상세 호출 useEffect는 그대로
  useEffect(() => {
    if (!activePlace || activePlace.source !== 'tour') {
      setActiveDetail(null);
      setDetailError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const detail = await fetchTourPlaceDetail(
          activePlace.id,
          activePlace.contentTypeId
        );
        if (!cancelled) setActiveDetail(detail);
      } catch (err) {
        if (!cancelled) setDetailError(err.message || '상세 조회 실패');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activePlace]);

  const handleAddToTimeline = () => {
    if (!activePlace) return;
    planner.handlePlaceSelect(activePlace);
  };

  const handleCloseDetail = () => {
    setActivePlace(null);
    setActiveDetail(null);
    setDetailError(null);
  };

  // 🔥 타임라인 카드 클릭 → 펼치기/접기
  const handleTimelineToggle = (place) => {
    setExpandedPlaceId((prev) => (prev === place.id ? null : place.id));
  };

  return (
    <div className="planner-container">
      <SearchPanel
        regionKeyword={planner.regionKeyword}
        onRegionKeywordChange={planner.setRegionKeyword}
        onRegionSearch={planner.handleRegionSearch}
        category={planner.category}
        onCategoryChange={planner.handleCategoryChange}
        categories={planner.categories}
        center={planner.center}
        places={planner.places}
        onPlaceClick={handleSearchResultClick}
        page={planner.page}
        totalPages={planner.totalPages}
        onPageChange={planner.handlePageChange}
        selectedPlaces={planner.selectedPlaces}
        totalCount={planner.totalCount}
      />

      {activePlace && (
        <div className="detail-panel-wrapper">
          <PlaceDetailPanel
            place={activePlace}
            detail={activeDetail}
            loading={detailLoading}
            error={detailError}
            onClose={handleCloseDetail}
            onAddToTimeline={handleAddToTimeline}
          />
        </div>
      )}

      <div className="map-area">
        <div id="map" className="map-canvas" />

        <button
          type="button"
          className="timeline-toggle-btn"
          onClick={toggleTimeline}
        >
          {isTimelineOpen ? '타임라인 닫기' : '타임라인 열기'}
        </button>

        <div
          className={
            'timeline-sidebar ' +
            (isTimelineOpen
              ? 'timeline-sidebar--open'
              : 'timeline-sidebar--closed')
          }
        >
          <Timeline
            selectedPlaces={planner.selectedPlaces}
            totalDistance={planner.totalDistance}
            draggingIndex={planner.draggingIndex}
            onDragStart={planner.handleDragStart}
            onDragOver={planner.handleDragOver}
            onDrop={planner.handleDrop}
            onRemove={planner.handleRemovePlace}
            // 🔥 여기 두 줄 추가
            expandedPlaceId={expandedPlaceId}
            onItemToggle={handleTimelineToggle}
          />
        </div>
      </div>
    </div>
  );
}

export default PlannerMap;
