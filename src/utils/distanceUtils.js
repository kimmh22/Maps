// src/utils/distanceUtils.js

// 두 좌표 사이 거리(km)
export function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
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
  return R * c;
}

// 선택된 장소 배열 기준으로 order + segmentDistance 재계산
export function recalcSegmentDistances(placesArray) {
  return placesArray.map((p, idx) => {
    let segmentDistance = null;

    if (idx > 0) {
      const prev = placesArray[idx - 1];
      segmentDistance = calcDistanceKm(prev.lat, prev.lng, p.lat, p.lng);
    }

    return {
      ...p,
      order: idx + 1,
      segmentDistance,
    };
  });
}
