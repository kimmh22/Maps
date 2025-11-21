import { useEffect, useRef, useState } from 'react';
// import DUMMY_PLACES from '../data/dummyPlaces';
import {
  TOURAPI_SERVICE_KEY,
  CONTENT_TYPE_BY_CATEGORY,
} from '../config/tourApiConfig';

function PlannerMap() {
  const mapRef = useRef(null); //객체를 저장하는 상자
  const markersRef = useRef([]); //마커 배열 상자
  const [regionKeyword, setRegionKeyword] = useState(''); //지역검색
  const [category, setCategory] = useState('숙박'); //현재 선택된 카테고리
  const [places, setPlaces] = useState([]); //카테고리 선택에 세부내용
  const [selectedPlaces, setSelectedPlaces] = useState([]); //핑을 찍은 장소목록
  const [center, setCenter] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      '//dapi.kakao.com/v2/maps/sdk.js?appkey=0ab3008da3b4e1d75538347f568693c8&autoload=false&libraries=services';
    script.onload = () => {
      if (!window.kakao) {
        console.error('window.kakao 없음');
        return;
      }

      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 중심
          level: 12,
        };
        const map = new window.kakao.maps.Map(container, options);
        mapRef.current = map;
      });
    };

    document.head.appendChild(script);
  }, []);

  // ---------- TourAPI: 위치 기반 장소 조회 ----------
  const loadPlacesFromTourAPI = async (lat, lng, cat) => {
    try {
      const contentTypeId = CONTENT_TYPE_BY_CATEGORY[cat];
      if (!contentTypeId) {
        console.error('알 수 없는 카테고리:', cat);
        return;
      }

      // TourAPI 4.0 KorService2 locationBasedList2
      const baseUrl =
        'https://apis.data.go.kr/B551011/KorService2/locationBasedList2';

      const params = new URLSearchParams({
        serviceKey: TOURAPI_SERVICE_KEY,
        MobileOS: 'ETC',
        MobileApp: 'trip-planner',
        _type: 'json',
        numOfRows: '30',
        pageNo: '1',
        mapX: String(lng), // 경도
        mapY: String(lat), // 위도
        radius: '5000', // 5km 반경
        contentTypeId, // 카테고리별 타입
      });

      const url = `${baseUrl}?${params.toString()}`;
      console.log('TourAPI 요청 URL:', url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('TourAPI 응답 에러: ' + res.status);
      }

      const data = await res.json();
      console.log('TourAPI 응답 데이터:', data);

      const items = data?.response?.body?.items?.item;

      if (!items) {
        setPlaces([]);
        return;
      }

      const list = Array.isArray(items) ? items : [items];

      const mapped = list
        .filter((it) => it.mapx && it.mapy)
        .map((it) => ({
          id: it.contentid,
          name: it.title,
          category: cat,
          addr: it.addr1,
          lat: Number(it.mapy),
          lng: Number(it.mapx),
        }));

      setPlaces(mapped);
    } catch (err) {
      console.error('TourAPI 호출 실패:', err);
      alert(
        '공공데이터 API 호출 중 오류가 발생했습니다. (CORS나 키 설정 확인 필요)'
      );
    }
  };

  // ---------- 1) 지역 검색: 입력값으로 지도 중심 이동 + TourAPI 호출 ----------
  const handleRegionSearch = () => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;
    if (!regionKeyword) {
      alert('지역을 입력하세요 (예: 서울 중구, 부산 해운대)');
      return;
    }

    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(regionKeyword, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const first = result[0];
        const lat = Number(first.y);
        const lng = Number(first.x);
        const moveLatLng = new kakao.maps.LatLng(lat, lng);

        // 지도 중심 이동
        mapRef.current.setCenter(moveLatLng);
        mapRef.current.setLevel(6);

        // 중심 좌표 상태 저장
        setCenter({ lat, lng });

        // 🔥 이 지역 기준으로 현재 카테고리의 장소들을 TourAPI에서 가져오기
        loadPlacesFromTourAPI(lat, lng, category);
      } else {
        alert('해당 지역을 찾을 수 없습니다.');
      }
    });
  };

  // ---------- 2) 카테고리 변경 ----------
  const handleCategoryChange = (cat) => {
    setCategory(cat);

    // 이미 지역 검색해서 center가 잡혀있다면,
    // 같은 좌표 기준으로 다른 카테고리 다시 조회
    if (center) {
      loadPlacesFromTourAPI(center.lat, center.lng, cat);
    } else {
      setPlaces([]);
    }
  };

  // ---------- 거리 계산 (하버사인 공식) ----------
  const calcDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구 반지름(km)
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  };

  // ---------- 3) 장소 선택 시: 지도에 핑 찍고, 타임라인 추가 ----------
  const handlePlaceSelect = (place) => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const pos = new kakao.maps.LatLng(place.lat, place.lng);

    // 지도 중심 이동
    mapRef.current.setCenter(pos);
    mapRef.current.setLevel(5);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position: pos,
    });
    marker.setMap(mapRef.current);
    markersRef.current.push(marker);

    // 이전 선택 지점과 거리 계산
    let segmentDistance = null;
    if (selectedPlaces.length > 0) {
      const prev = selectedPlaces[selectedPlaces.length - 1];
      segmentDistance = calcDistanceKm(
        prev.lat,
        prev.lng,
        place.lat,
        place.lng
      );
    }

    const newSelected = [
      ...selectedPlaces,
      {
        ...place,
        order: selectedPlaces.length + 1,
        addedAt: new Date(),
        segmentDistance, // 직전 포인트와의 거리 (km)
      },
    ];

    setSelectedPlaces(newSelected);
  };

  // 타임라인에서 총 이동 거리 계산
  const totalDistance = selectedPlaces.reduce((sum, p) => {
    return sum + (p.segmentDistance || 0);
  }, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* 왼쪽: 검색 + 카테고리 + 장소 리스트 */}
      <div
        style={{
          width: '30%',
          borderRight: '1px solid #ddd',
          padding: '12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* 1. 지역 검색 */}
        <div>
          <h3>1. 지역 검색</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={regionKeyword}
              onChange={(e) => setRegionKeyword(e.target.value)}
              placeholder="예: 서울 중구, 부산 해운대"
              style={{ flex: 1, padding: '6px' }}
            />
            <button onClick={handleRegionSearch}>검색</button>
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
            검색 후에 카테고리를 바꾸면, 같은 지역 기준으로 다른
            종류(숙박/음식점/축제)를 불러옵니다.
          </div>
        </div>

        {/* 2. 카테고리 선택 */}
        <div>
          <h3>2. 카테고리</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {['숙박', '음식점', '축제'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: category === cat ? '#333' : '#eee',
                  color: category === cat ? '#fff' : '#000',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 장소 리스트 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h3>3. 장소 선택</h3>

          {!center && (
            <p style={{ fontSize: '13px', color: '#777' }}>
              먼저 위에서 <b>지역 검색</b>을 해주세요.
            </p>
          )}

          {center && places.length === 0 && (
            <p style={{ fontSize: '13px', color: '#777' }}>
              이 지역에서 선택한 카테고리({category}) 데이터가 없거나, 아직
              불러오는 중일 수 있습니다.
            </p>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {places.map((p) => (
              <li
                key={p.id}
                style={{
                  padding: '8px 4px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                }}
                onClick={() => handlePlaceSelect(p)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>{p.addr}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  카테고리: {p.category}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 가운데: 지도 */}
      <div
        id="map"
        style={{ flex: 1, borderRight: '1px solid #ddd', minWidth: 0 }}
      />

      {/* 오른쪽: 타임라인 + 거리 */}
      <div
        style={{
          width: '25%',
          padding: '12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #ddd',
        }}
      >
        <h3>4·5. 거리 & 타임라인</h3>
        <div style={{ fontSize: '13px', marginBottom: '8px' }}>
          선택한 핑 개수: <b>{selectedPlaces.length}</b>
          <br />총 이동 거리:{' '}
          <b>{totalDistance ? totalDistance.toFixed(2) : 0} km</b>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderTop: '1px solid #eee',
            paddingTop: '8px',
          }}
        >
          {selectedPlaces.length === 0 && (
            <p style={{ fontSize: '13px', color: '#777' }}>
              왼쪽에서 장소를 선택하면
              <br />
              여기 타임라인이 채워집니다.
            </p>
          )}

          {selectedPlaces.map((p) => (
            <div
              key={p.order + p.id}
              style={{
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '1px dashed #ddd',
              }}
            >
              <div style={{ fontSize: '12px', color: '#999' }}>#{p.order}</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '12px', color: '#555' }}>{p.addr}</div>
              {p.segmentDistance != null && (
                <div style={{ fontSize: '12px', color: '#333' }}>
                  이전 지점과 거리: <b>{p.segmentDistance.toFixed(2)} km</b>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlannerMap;
