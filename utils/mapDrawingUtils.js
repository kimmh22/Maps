// src/utils/mapDrawingUtils.js

// mapRef: useKakaoMap에서 받은 ref
// markersRef: 현재 지도에 표시된 마커들 저장용 ref (배열)
// polylineRef: 현재 표시된 polyline 저장용 ref
// markerColors: 마커 색상 배열
export function redrawMarkersAndPolyline(
  mapRef,
  placesArray,
  markersRef,
  polylineRef,
  markerColors
) {
  const { kakao } = window;
  if (!kakao || !mapRef.current) return placesArray;

  const map = mapRef.current;

  // 1) 기존 마커 전부 제거
  markersRef.current.forEach((marker) => {
    marker.setMap(null);
  });
  markersRef.current = [];

  // 2) 기존 polyline 제거
  if (polylineRef.current) {
    polylineRef.current.setMap(null);
    polylineRef.current = null;
  }

  if (placesArray.length === 0) {
    return placesArray;
  }

  const path = [];

  // 3) 새 마커 + path 생성
  placesArray.forEach((p, idx) => {
    const order = idx + 1;
    const pos = new kakao.maps.LatLng(p.lat, p.lng);
    const color = markerColors[(order - 1) % markerColors.length];

    // DOM 기반 동그란 마커
    const content = document.createElement('div');
    content.innerText = String(order);
    content.style.backgroundColor = color;
    content.style.color = '#fff';
    content.style.borderRadius = '50%';
    content.style.width = '28px';
    content.style.height = '28px';
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    content.style.justifyContent = 'center';
    content.style.border = '2px solid #fff';
    content.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)';
    content.style.fontSize = '13px';

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content,
      yAnchor: 1,
    });

    overlay.setMap(map);
    markersRef.current.push(overlay);

    path.push(pos);
  });

  // 4) polyline 그리기
  if (path.length >= 2) {
    const polyline = new kakao.maps.Polyline({
      path,
      strokeWeight: 4,
      strokeColor: '#ff5252',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });

    polyline.setMap(map);
    polylineRef.current = polyline;
  }

  return placesArray;
}
