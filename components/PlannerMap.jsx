// src/components/PlannerMap.jsx
import { useState, useEffect, useRef } from 'react';
import { useKakaoMap } from '../hooks/useKakaoMap';
import { useTripPlanner } from '../hooks/useTripPlanner';
import SearchPanel from './SearchPanel';
import Timeline from './Timeline';
import PlaceDetailPanel from './PlaceDetailPanel';
import { fetchTourPlaceDetail } from '../services/tourApiService';
import '../styles/PlannerMap.css';
import TravelCategoryModal from './TravelCategoryModal';
import EditPage from './EditPage';

function PlannerMap({ mode = 'write, initialData' }) {
  //0. 모달
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [tripMeta, setTripMeta] = useState(null);

  // ============================================
  // 1. 지도 / 플래너 훅
  // ============================================
  const mapRef = useKakaoMap('map'); // 카카오 지도 ref
  const planner = useTripPlanner(mapRef); // 검색 + 경로 상태/핸들러

  // ============================================
  // 2. UI 상태
  // ============================================

  // 지도 클릭으로 찍는 임시 마커
  const clickMarkerRef = useRef(null);

  // 타임라인 열림/닫힘
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);

  // 타임라인에서 어떤 카드가 펼쳐져 있는지 (routeId 기준)
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  // 상세 패널 상태
  const [activePlace, setActivePlace] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // ============================================
  // 3. 핸들러: 타임라인 / 검색 결과 / 상세 패널
  // ============================================

  // 타임라인 카드 접기/펼치기
  const handleTimelineToggle = (place) => {
    setExpandedRouteId((prev) =>
      prev === place.routeId ? null : place.routeId
    );
  };

  // 타임라인 사이드바 열기/닫기
  const toggleTimeline = () => {
    setIsTimelineOpen((prev) => !prev);
  };

  // 검색 결과에서 장소 클릭 시:
  // - activePlace 설정
  // - 지도 중심 이동
  const handleSearchResultClick = (place) => {
    setActivePlace(place);

    if (mapRef.current && window.kakao) {
      const { kakao } = window;
      const pos = new kakao.maps.LatLng(place.lat, place.lng);
      mapRef.current.setCenter(pos);
    }
  };

  // 상세 패널에서 "경로에 추가하기"
  const handleAddToTimeline = () => {
    if (!activePlace) return;

    // 🔥 여기서만 10개 제한 체크
    if (planner.selectedPlaces.length >= 10) {
      alert('여행지는 최대 10개까지만 선택할 수 있어요!');
      return;
    }

    planner.handlePlaceSelect(activePlace);
  };

  // 상세 패널 닫기
  const handleCloseDetail = () => {
    setActivePlace(null);
    setActiveDetail(null);
    setDetailError(null);
  };

  // ============================================
  // 4. 지도 클릭 시 임시 마커 찍기
  // ============================================
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;

    const { kakao } = window;
    const map = mapRef.current;

    const handleClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng;

      // 이전 클릭 마커 제거
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setMap(null);
      }

      // 새 마커 생성
      const marker = new kakao.maps.Marker({
        position: latlng,
      });

      marker.setMap(map);
      clickMarkerRef.current = marker;

      console.log('클릭 위치:', latlng.getLat(), latlng.getLng());
    };

    kakao.maps.event.addListener(map, 'click', handleClick);

    return () => {
      kakao.maps.event.removeListener(map, 'click', handleClick);
    };
  }, [mapRef]);

  // ============================================
  // 5. TourAPI 상세 정보 불러오기
  // ============================================
  useEffect(() => {
    // TourAPI 기반이 아니면 상세정보 초기화
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

  // ============================================
  // 6. 렌더링
  // ============================================

  // useEffect(() => {
  //   if (mode === 'edit' && initialData) {
  //     setTripTitle(initialData.tripTitle);

  //     const restored = initialData.items.map((item, idx) => ({
  //       id: item.placeId,
  //       routeId: `${item.placeId}-${Date.now()}-${Math.random().toString(16)}`,
  //       order: item.order,
  //       name: item.name,
  //       addr: item.addr,
  //       lat: item.lat,
  //       lng: item.lng,
  //       photos: item.photos,
  //       title: item.title,
  //       text: item.text,
  //       source: 'db',
  //     }));

  //     planner.setSelectedPlaces(restored);
  //   }
  // }, [mode, initialData]);

  return (
    <div className="planner-container">
      {/* 🔥 여행 카테고리 모달 (처음에만 보이고, 다음으로 누르면 사라짐) */}
      {showIntroModal && (
        <TravelCategoryModal
          onNext={(meta) => {
            setTripMeta(meta); // meta = { withWho, duration, styles }
            setShowIntroModal(false);
            // meta는 나중에 글 저장할 때 payload에 같이 보내면 됨
          }}
        />
      )}

      {/* ----- 왼쪽 검색 패널 ----- */}
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

      {/* ----- 가운데 상세 패널 ----- */}
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

      {/* ----- 오른쪽 지도 + 타임라인 ----- */}
      <div className="map-area">
        <div id="map" className="map-canvas" />

        {/* 타임라인 열기/닫기 버튼 */}
        <button
          type="button"
          className="timeline-toggle-btn"
          onClick={toggleTimeline}
        >
          {isTimelineOpen ? '타임라인 닫기' : '타임라인 열기'}
        </button>

        {/* 타임라인 사이드바 */}
        <div
          className={`timeline-sidebar ${
            isTimelineOpen
              ? 'timeline-sidebar--open'
              : 'timeline-sidebar--closed'
          }`}
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
            onClearAll={() => {
              planner.handleClearAll(); // 선택된 장소 전부 삭제
              setExpandedRouteId(null); // 펼쳐진 카드도 초기화
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PlannerMap;
