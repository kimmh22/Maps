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
}) {
  // ============================================
  // 1. 상태 정의
  // ============================================

  // 전체 여행 제목
  const [tripTitle, setTripTitle] = useState('');

  // drafts: { [routeId]: { photos: string[], title: string, text: string } }
  const [drafts, setDrafts] = useState({});
  const [savedMap, setSavedMap] = useState({}); // { [routeId]: true }
  const [photoIndexMap, setPhotoIndexMap] = useState({}); // { [routeId]: number }

  // // edit 모드일 때 초기 데이터 세팅
  // useEffect(() => {
  //   if (mode === 'edit' && initialDrafts) {
  //     setDrafts(initialDrafts);
  //   }
  // }, [mode, initialDrafts]);

  // ============================================
  // 2. 핸들러: draft / 사진 / 제출 / 취소
  // ============================================

  // draft 공통 변경 (title / text)
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

  // 사진 파일 업로드 (최대 5장)
  // 사진 파일 업로드 (최대 5장)
  const handleFilesChange = async (routeId, fileList) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, 5); // 최대 5장만 사용

    // 1) 서버로 파일 업로드 (multipart/form-data)
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); // FileUploadDto 안의 List<MultipartFile> files 에 매핑된다고 가정
    });

    try {
      const res = await apiClient.post('/fileupload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 서버가 List<File> 반환 -> [{ id, filename, orgFilename }, ...]
      const uploadedFiles = res.data || [];
      const newFileIds = uploadedFiles.map((f) => f.id);

      // 2) 프론트 미리보기 URL 생성
      const newUrls = files.map((file) => URL.createObjectURL(file));

      setDrafts((prev) => {
        const prevDraft = prev[routeId] || {
          photos: [],
          title: '',
          text: '',
          fileIds: [],
        };

        const prevPhotos = prevDraft.photos || [];
        const prevFileIds = prevDraft.fileIds || [];

        // 기존 + 새 사진 합쳐서 최대 5개까지만 유지
        const mergedPhotos = [...prevPhotos, ...newUrls].slice(0, 5);
        const mergedFileIds = [...prevFileIds, ...newFileIds].slice(0, 5);

        return {
          ...prev,
          [routeId]: {
            ...prevDraft,
            photos: mergedPhotos,
            fileIds: mergedFileIds,
          },
        };
      });

      // 새 사진 넣으면 인덱스를 0으로 초기화
      setPhotoIndexMap((prev) => ({
        ...prev,
        [routeId]: 0,
      }));
    } catch (error) {
      console.error('사진 업로드 실패:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    }
  };

  // 현재 보고 있는 사진 삭제
  const handleCurrentPhotoDelete = (routeId) => {
    setDrafts((prev) => {
      const prevDraft = prev[routeId] || {
        photos: [],
        title: '',
        text: '',
        fileIds: [],
      };
      const photos = prevDraft.photos || [];
      const fileIds = prevDraft.fileIds || [];
      const curIndex = photoIndexMap[routeId] ?? 0;

      if (photos.length === 0) return prev;

      const nextPhotos = photos.filter((_, i) => i !== curIndex);
      const nextFileIds = fileIds.filter((_, i) => i !== curIndex);

      const nextDrafts = {
        ...prev,
        [routeId]: {
          ...prevDraft,
          photos: nextPhotos,
          fileIds: nextFileIds,
        },
      };

      const newLen = nextPhotos.length;
      setPhotoIndexMap((prevMap) => {
        if (newLen === 0) {
          return { ...prevMap, [routeId]: 0 };
        }
        const prevIdx = prevMap[routeId] ?? 0;
        const adjusted = Math.min(prevIdx, newLen - 1);
        return { ...prevMap, [routeId]: adjusted };
      });

      return nextDrafts;
    });
  };

  const handleSubmitAll = async () => {
    if (!tripTitle.trim()) {
      alert('여행 제목을 입력해 주세요.');
      return;
    }

    const places = selectedPlaces.map((p, idx) => {
      const routeId = p.routeId || `${p.id}-${idx}`;
      const draft = drafts[routeId] || {};

      return {
        title: draft.title ?? '', // null 방지
        content: draft.text ?? '', // null 방지

        mapPlaceId: String(p.id ?? ''), // 문자열 보장
        externalId: String(p.id ?? ''), // 문자열 보장

        x: Number(p.lng ?? 0), // double
        y: Number(p.lat ?? 0), // double

        files: fileIds.map((id) => ({ fileId: id })),
      };
    });

    const payload = {
      title: tripTitle ?? '',
      memberId: 1, // ⭐ 반드시 DB 내 실제 memberId여야 한다
      filterItemIds: [], // null 방지
      places,
    };

    console.log('📌 서버 전송 payload:', payload);

    try {
      const res = await apiClient.post('/board', payload);
      alert('저장 성공!');
      console.log('🟢 서버 응답:', res.data);
    } catch (err) {
      console.error('🔴 저장 실패:', err);
      console.log('서버 응답:', err.response?.data);
      alert('저장 실패: ' + JSON.stringify(err.response?.data));
    }
  };

  // 전체 취소
  const handleCancelAll = () => {
    setDrafts({});
    setSavedMap({});
    setPhotoIndexMap({});
    setTripTitle('');
  };

  // 화살표로 인덱스 이동 (0 ~ total-1 사이로 클램프)
  const changePhotoIndex = (routeId, nextIndex, total) => {
    if (total <= 0) return;

    const safeIndex =
      nextIndex < 0 ? 0 : nextIndex >= total ? total - 1 : nextIndex;

    setPhotoIndexMap((prev) => ({
      ...prev,
      [routeId]: safeIndex,
    }));
  };

  // ============================================
  // 3. 렌더링
  // ============================================

  return (
    <div className="timeline-root">
      {/* ----- 상단 타이틀 + 여행 제목 ----- */}
      <div className="timeline-header">
        <h2 className="timeline-header-title">나의 여행계획</h2>

        <div className="timeline-trip-title-row">
          <input
            type="text"
            className="timeline-trip-title-input"
            placeholder="여행 제목을 입력하세요 (예: 인천 당일치기 코스)"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
          />
        </div>
      </div>

      {/* ----- 요약 박스 ----- */}
      <section className="timeline-summary-box">
        <div className="timeline-summary-header">
          <h3 className="timeline-summary-title">경로 요약</h3>
        </div>

        <div className="timeline-summary">
          <div className="timeline-summary-left">
            총 <b>{selectedPlaces.length}</b>개 여행지
            <br />총 이동 거리:{' '}
            <b>{totalDistance ? totalDistance.toFixed(2) : 0} km</b>
          </div>

          <button
            type="button"
            className="timeline-summary-button"
            onClick={() => {
              if (
                onClearAll &&
                window.confirm('정말 전체 경로를 모두 삭제할까요?')
              ) {
                onClearAll();
              }
            }}
          >
            전체경로삭제
          </button>
        </div>
      </section>

      {/* ----- 타임라인 카드 리스트 ----- */}
      <div className="timeline-list-wrapper">
        {selectedPlaces.length === 0 && (
          <p className="timeline-empty">
            왼쪽에서 장소를 선택하면
            <br />
            여기 타임라인이 채워집니다.
          </p>
        )}

        {selectedPlaces.map((p, idx) => {
          const routeId = p.routeId || `${p.id}-${idx}`;
          const isExpanded = expandedRouteId === routeId;

          const draft = drafts[routeId] || {
            photos: [],
            title: '',
            text: '',
          };
          const photos = (draft.photos || []).slice(0, 5);
          const firstPhoto = photos[0] || null;
          const isSaved = !!savedMap[routeId];

          const currentIndex =
            photoIndexMap[routeId] != null ? photoIndexMap[routeId] : 0;
          const safeIndex =
            photos.length === 0
              ? 0
              : Math.min(Math.max(currentIndex, 0), photos.length - 1);
          const currentPhoto = photos[safeIndex] || null;

          const handleHeaderClick = () => {
            // 접을 때 작성된 내용이 있으면 "작성됨" 표시
            if (
              isExpanded &&
              (draft.text || draft.title || photos.length > 0)
            ) {
              setSavedMap((prev) => ({
                ...prev,
                [routeId]: true,
              }));
            }

            onItemToggle && onItemToggle(p);
          };

          return (
            <div key={`${p.id}-${idx}`} className="timeline-card">
              {/* 카드 상단 한 줄 */}
              <div
                className={
                  draggingIndex === idx
                    ? 'timeline-item timeline-item--dragging'
                    : 'timeline-item'
                }
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(idx)}
                onClick={handleHeaderClick}
              >
                <div className="timeline-item-left">
                  <span className="timeline-drag-handle">⋮⋮</span>
                  <div className="timeline-item-order">#{p.order}</div>

                  <div className="timeline-item-maintext">
                    <div className="timeline-item-name">{p.name}</div>
                    <div className="timeline-item-addr">{p.addr}</div>
                  </div>
                </div>

                <div className="timeline-item-right">
                  <div className="timeline-right-top">
                    {firstPhoto && (
                      <img
                        src={firstPhoto}
                        alt={p.name}
                        className="timeline-item-thumb"
                      />
                    )}
                    <button
                      type="button"
                      className="timeline-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(idx);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {isSaved && (
                    <div className="timeline-right-status">
                      <span className="timeline-status-dot" />
                      <span className="timeline-status-text">작성됨</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 카드 확장 영역: 사진 + 제목 + 본문 */}
              {isExpanded && (
                <div className="timeline-editor">
                  {/* 사진 업로드 줄 */}
                  <div className="timeline-photo-row">
                    <label className="timeline-photo-label-btn">
                      사진 등록
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          handleFilesChange(routeId, e.target.files)
                        }
                      />
                    </label>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      최대 5장까지 추가할 수 있어요.
                    </div>
                  </div>

                  {/* 사진 슬라이더: 한 장 크게 + 좌우 화살표 + 삭제 */}
                  {photos.length > 0 && (
                    <div className="timeline-photo-preview-slider">
                      <button
                        type="button"
                        className="timeline-photo-nav-btn"
                        disabled={safeIndex <= 0}
                        onClick={() =>
                          changePhotoIndex(
                            routeId,
                            safeIndex - 1,
                            photos.length
                          )
                        }
                      >
                        〈
                      </button>

                      <div className="timeline-photo-preview-main">
                        {currentPhoto && (
                          <img
                            src={currentPhoto}
                            alt={`${p.name} 사진 ${safeIndex + 1}`}
                            className="timeline-photo-preview-img"
                          />
                        )}
                        <div className="timeline-photo-preview-indicator">
                          {safeIndex + 1} / {photos.length}
                        </div>
                        <button
                          type="button"
                          className="timeline-photo-delete-btn"
                          onClick={() => handleCurrentPhotoDelete(routeId)}
                        >
                          현재 사진 삭제
                        </button>
                      </div>

                      <button
                        type="button"
                        className="timeline-photo-nav-btn"
                        disabled={safeIndex >= photos.length - 1}
                        onClick={() =>
                          changePhotoIndex(
                            routeId,
                            safeIndex + 1,
                            photos.length
                          )
                        }
                      >
                        〉
                      </button>
                    </div>
                  )}

                  {/* 장소별 소제목 */}
                  <div className="timeline-place-title-row">
                    <input
                      type="text"
                      className="timeline-place-title-input"
                      placeholder="이 장소에 대한 제목을 입력하세요 (예: 올림픽공원 산책)"
                      value={draft.title}
                      onChange={(e) =>
                        handleDraftChange(routeId, 'title', e.target.value)
                      }
                    />
                  </div>

                  {/* 글 작성 텍스트 영역 */}
                  <div className="timeline-textarea-wrap">
                    <textarea
                      className="timeline-textarea"
                      placeholder="이 장소에 대한 소개나 후기, 여행계획을 작성해보세요."
                      value={draft.text}
                      onChange={(e) =>
                        handleDraftChange(routeId, 'text', e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ----- 하단 버튼 영역 ----- */}
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
          글 작성하기
          {/* {mode === 'edit' ? '글 수정하기' : '글 작성하기'} */}
        </button>
      </div>
    </div>
  );
}

export default Timeline;
