// src/components/PlannerMap.jsx
import { useState, useEffect, useRef } from 'react';
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

  //마커 찍기
  const clickMarkerRef = useRef(null);

  // 🔥 타임라인에서 어느 카드가 펼쳐져 있는지
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  const [activePlace, setActivePlace] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const handleTimelineToggle = (place) => {
    setExpandedRouteId((prev) =>
      prev === place.routeId ? null : place.routeId
    );
  };

  const toggleTimeline = () => setIsTimelineOpen((prev) => !prev);

  const handleSearchResultClick = (place) => {
    setActivePlace(place);
    if (mapRef.current && window.kakao) {
      const { kakao } = window;
      const pos = new kakao.maps.LatLng(place.lat, place.lng);
      mapRef.current.setCenter(pos);
    }
  };
  // 🔥 지도 클릭 시 그 위치에 마커 하나 찍기
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;
    const { kakao } = window;
    const map = mapRef.current;

    const handleClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng;

      // 이전 클릭 마커가 있으면 제거
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setMap(null);
      }

      // 새 마커 생성
      const marker = new kakao.maps.Marker({
        position: latlng,
      });

      marker.setMap(map);
      clickMarkerRef.current = marker;

      // 디버깅용으로 콘솔에 좌표 찍어보기 (원하면 나중에 지워도 됨)
      console.log('클릭 위치:', latlng.getLat(), latlng.getLng());
    };

    kakao.maps.event.addListener(map, 'click', handleClick);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      kakao.maps.event.removeListener(map, 'click', handleClick);
    };
  }, [mapRef]);

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
            expandedRouteId={expandedRouteId}
            onItemToggle={handleTimelineToggle}
          />
        </div>
      </div>
    </div>
  );
}

export default PlannerMap;
