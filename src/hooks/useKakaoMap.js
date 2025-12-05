// src/hooks/useKakaoMap.js
import { useEffect, useRef } from 'react';

export function useKakaoMap(containerId) {
  const mapRef = useRef(null);

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
        const container = document.getElementById(containerId);
        if (!container) {
          console.error('지도 컨테이너를 찾을 수 없습니다:', containerId);
          return;
        }

        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 중심
          level: 6,
        };
        const map = new window.kakao.maps.Map(container, options);
        mapRef.current = map;
      });
    };

    document.head.appendChild(script);
  }, [containerId]);

  return mapRef;
}
