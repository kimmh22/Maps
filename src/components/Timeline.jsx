// src/components/Timeline.jsx
import { useState } from 'react';
import '../styles/Timeline.css';
import apiClient from '../services/apiClient';

function Timeline({
  selectedPlaces,
  totalDistance,
  draggingIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onRemove,
  expandedRouteId,
  onItemToggle,
  onClearAll,
  tripMeta,

  // 작성/수정 모드
  mode = 'create',
  initialTripTitle = '',
  initialDrafts = {}, // ⭐ 오타 수정됨
  boardId,
}) {
  // 1. 상태 설정
  const [tripTitle, setTripTitle] = useState(initialTripTitle);
  const [drafts, setDrafts] = useState(initialDrafts); // ⭐ 수정된 변수명

  const [savedMap, setSavedMap] = useState({});
  const [photoIndexMap, setPhotoIndexMap] = useState({});

  // ========================
  // 사진 / 텍스트 / draft 변경 핸들러
  // ========================

  const handleDraftChange = (routeId, field, value) => {
    setDrafts((prev) => {
      const prevDraft = prev[routeId] || {
        photos: [],
        title: '',
        text: '',
        fileIds: [],
      };

      return {
        ...prev,
        [routeId]: {
          ...prevDraft,
          [field]: value,
        },
      };
    });
  };

  // 사진 업로드
  const handleFilesChange = async (routeId, fileList) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, 5);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const res = await apiClient.post('/fileupload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedFiles = res.data || [];
      const newFileIds = uploadedFiles.map((f) => f.id);
      const newUrls = files.map((file) => URL.createObjectURL(file));

      setDrafts((prev) => {
        const prevDraft = prev[routeId] || {
          photos: [],
          title: '',
          text: '',
          fileIds: [],
        };

        const mergedPhotos = [...prevDraft.photos, ...newUrls].slice(0, 5);
        const mergedFileIds = [...prevDraft.fileIds, ...newFileIds].slice(0, 5);

        return {
          ...prev,
          [routeId]: {
            ...prevDraft,
            photos: mergedPhotos,
            fileIds: mergedFileIds,
          },
        };
      });

      setPhotoIndexMap((prev) => ({ ...prev, [routeId]: 0 }));
    } catch (err) {
      console.error(err);
    }
  };

  // 사진 삭제
  const handleCurrentPhotoDelete = (routeId) => {
    setDrafts((prev) => {
      const prevDraft = prev[routeId] || {};
      const photos = prevDraft.photos || [];
      const fileIds = prevDraft.fileIds || [];
      const idx = photoIndexMap[routeId] ?? 0;

      const nextPhotos = photos.filter((_, i) => i !== idx);
      const nextFileIds = fileIds.filter((_, i) => i !== idx);

      const nextDraft = {
        ...prevDraft,
        photos: nextPhotos,
        fileIds: nextFileIds,
      };

      setPhotoIndexMap((prevMap) => ({
        ...prevMap,
        [routeId]: Math.max(0, nextPhotos.length - 1),
      }));

      return { ...prev, [routeId]: nextDraft };
    });
  };
  const handleCancelAll = () => {
    if (mode === 'edit') {
      setDrafts(initialDrafts);
      setTripTitle(initialTripTitle);
    } else {
      setDrafts({});
      setTripTitle('');
    }
    setSavedMap({});
    setPhotoIndexMap({});
  };

  // ===========================
  // 제출 처리 (POST / PUT 구분)
  // ===========================
  const handleSubmitAll = async () => {
    if (!tripTitle.trim()) {
      alert('여행 제목을 입력하세요.');
      return;
    }

    const places = selectedPlaces.map((p, idx) => {
      const routeId = p.routeId || `${p.id}-${idx}`;
      const draft = drafts[routeId] || {};

      return {
        title: draft.title ?? '',
        content: draft.text ?? '',
        mapPlaceId: String(p.id),
        externalId: String(p.id),
        x: Number(p.lng),
        y: Number(p.lat),
        files: (draft.fileIds || []).map((id) => ({ fileId: id })),
      };
    });

    const payload = {
      title: tripTitle ?? '',
      memberId: 1,
      filterItemIds: [],
      places,
    };

    try {
      let res;

      if (mode === 'edit') {
        if (!boardId) {
          alert('boardId가 없습니다 (edit 모드).');
          return;
        }

        // ⭐ 수정 모드는 PUT
        res = await apiClient.put(`/board/${boardId}`, payload);
        alert('수정 성공!');
      } else {
        // ⭐ 작성 모드는 POST
        res = await apiClient.post('/board', payload);
        alert('작성 완료!');
      }

      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert('저장 실패!');
    }
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="timeline-root">
      {/* 상단 제목 */}
      <div className="timeline-header">
        <h2 className="timeline-header-title">
          {mode === 'edit' ? '여행 계획 수정' : '나의 여행계획'}
        </h2>

        <div className="timeline-trip-title-row">
          <input
            type="text"
            className="timeline-trip-title-input"
            placeholder="여행 제목을 입력하세요"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
          />
        </div>
      </div>

      {/* ... 중략: 리스트 / 카드 부분 그대로 ... */}

      {/* 하단 버튼 */}
      <div className="timeline-footer">
        <button
          type="button"
          className="timeline-footer-btn"
          onClick={handleCancelAll}
        >
          취소
        </button>

        <button
          type="button"
          className="timeline-footer-btn timeline-footer-btn--primary"
          onClick={handleSubmitAll}
        >
          {mode === 'edit' ? '글 수정하기' : '글 작성하기'}
        </button>
      </div>
    </div>
  );
}

export default Timeline;
