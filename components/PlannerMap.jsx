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

  // 🔥 상세 패널용 상태
  const [activePlace, setActivePlace] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const toggleTimeline = () => setIsTimelineOpen((prev) => !prev);

  // 왼쪽 검색 결과 클릭 시: 상세 패널만 열기
  const handleSearchResultClick = (place) => {
    setActivePlace(place);

    // 지도 중심 이동 (선택)
    if (mapRef.current && window.kakao) {
      const { kakao } = window;
      const pos = new kakao.maps.LatLng(place.lat, place.lng);
      mapRef.current.setCenter(pos);
    }
  };

  // 🔥 activePlace가 바뀔 때 TourAPI 상세 호출
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

        if (!cancelled) {
          setActiveDetail(detail);
        }
      } catch (err) {
        if (!cancelled) {
          setDetailError(err.message || '상세 조회 실패');
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
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

  return (
    <div className="planner-container">
      {/* 왼쪽 검색 패널 */}
      <SearchPanel
        regionKeyword={planner.regionKeyword}
        onRegionKeywordChange={planner.setRegionKeyword}
        onRegionSearch={planner.handleRegionSearch}
        category={planner.category}
        onCategoryChange={planner.handleCategoryChange}
        categories={planner.categories}
        center={planner.center}
        places={planner.places}
        onPlaceClick={handleSearchResultClick} // 🔥 여기!
        page={planner.page}
        totalPages={planner.totalPages}
        onPageChange={planner.handlePageChange}
        selectedPlaces={planner.selectedPlaces}
        totalCount={planner.totalCount}
      />

      {/* 가운데 380×1060 상세 패널 */}
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

      {/* 오른쪽 지도 + 타임라인 */}
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
          />
        </div>
      </div>
    </div>
  );
}

export default PlannerMap;
