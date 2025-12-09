// src/pages/ModifyComp.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import Timeline from '../../components/Timeline';

function ModifyComp() {
  const { boardId } = useParams();

  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState(null);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [initialDrafts, setInitialDrafts] = useState({});
  const [initialTripTitle, setInitialTripTitle] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get(`/board/${boardId}`);
        const data = res.data;

        setBoard(data);

        // 전체 제목
        setInitialTripTitle(data.title);

        // Timeline에 필요한 구조로 변환
        const drafts = {};
        const places = [];

        data.places.forEach((p, idx) => {
          const routeId = p.id; // ⭐ 수정 시 routeId = placeId 사용

          // selectedPlaces: 지도 & 타임라인에서 사용하는 기본 정보
          places.push({
            id: p.id,
            routeId,
            order: p.orderNum,
            name: p.title,
            addr: '', // 필요 시 적용
            lat: p.y,
            lng: p.x,
          });

          // draft 초기값 구성
          drafts[routeId] = {
            title: p.title,
            text: p.content,
            photos: p.files.map((f) => {
              // 서버 이미지 URL로 변환 필요
              return `/api/travly/file/${f.file.id}`;
            }),
            fileIds: p.files.map((f) => f.file.id),
          };
        });

        setSelectedPlaces(places);
        setInitialDrafts(drafts);

        setLoading(false);
      } catch (err) {
        console.error('수정 데이터 불러오기 실패:', err);
        setLoading(false);
      }
    }

    loadData();
  }, [boardId]);

  if (loading) return <div>불러오는 중...</div>;
  if (!board) return <div>존재하지 않는 게시글입니다.</div>;

  return (
    <div style={{ display: 'flex' }}>
      {/* 왼쪽 검색 패널 생략 가능 */}
      {/* 가운데 지도 생략 가능 */}

      <Timeline
        mode="edit"
        boardId={boardId}
        selectedPlaces={selectedPlaces}
        initialDrafts={initialDrafts}
        initialTripTitle={initialTripTitle}
      />
    </div>
  );
}

export default ModifyComp;
