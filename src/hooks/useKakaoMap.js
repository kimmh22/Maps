// src/hooks/useKakaoMap.js
import { useEffect, useRef } from 'react';

export function useKakaoMap(containerId) {
  const mapRef = useRef(null);

  useEffect(() => {
    const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

    if (!KAKAO_JS_KEY) {
      console.error(
        '⚠ VITE_KAKAO_JAVASCRIPT_KEY 가 .env에 설정되어 있지 않습니다.'
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
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
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
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
