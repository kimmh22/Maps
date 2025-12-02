// src/components/Timeline.jsx
import { useState } from 'react';
import '../styles/Timeline.css';

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
}) {
  const [drafts, setDrafts] = useState({}); // { [placeId]: { photo, text } }

  // 작성 완료된 곳 표시용
  const [savedMap, setSavedMap] = useState({}); // { [placeId]: true }

  const handleChange = (placeId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [placeId]: {
        ...(prev[placeId] || {}),
        [field]: value,
      },
    }));
  };

  // 🔥 전체 글 작성하기 (밑에 버튼)
  const handleSubmitAll = () => {
    const payload = selectedPlaces.map((p, idx) => {
      const routeId = p.routeId || `${p.id}-${idx}`;
      const draft = drafts[p.routeId] || {};
      return {
        placeId: p.id,
        order: p.order,
        photo: draft.photo || '',
        text: draft.text || '',
      };
    });

    setSavedMap((prev) => {
      const next = { ...prev };
      payload.forEach((item) => {
        if (item.photo || item.text) {
          next[item.routeId] = true;
        }
      });
      return next;
    });
    alert('전체 글 작성하기: 나중에 서버 저장 로직으로 바꾸면 돼요!');
  };
  const handleCancelAll = () => {
    // 모두 초기화
    setDrafts({});
    setSavedMap({});
  };

  return (
    <div className="timeline-root">
      {/*  상단 타이틀 */}
      <div className="timeline-header">
        <h2 className="timeline-header-title">나의 여행계획</h2>
      </div>

      {/*  서브 타이틀 */}
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
              // TODO: 나중에 전체 경로 삭제 로직 연결
              // ex) onClearAll();
              alert('나중에 여기서 전체 경로 삭제 기능 연결!');
            }}
          >
            전체경로삭제
          </button>
        </div>
      </section>

      <div className="timeline-list-wrapper">
        {selectedPlaces.length === 0 && (
          <p className="timeline-empty">
            왼쪽에서 장소를 선택하면
            <br />
            여기 타임라인이 채워집니다.
          </p>
        )}

        {selectedPlaces.map((p, idx) => {
          const routeId = p.routeId || `${p.id}-${idx}`; // 🔥 각 줄 고유 ID
          const isExpanded = expandedRouteId === routeId;
          const draft = drafts[routeId] || { photo: '', text: '' };

          const firstPhoto = draft.photo && draft.photo.split(',')[0].trim();

          const isSaved = !!savedMap[p.id];

          // 🔥 추가된 부분: 헤더 클릭 핸들러
          const handleHeaderClick = () => {
            // 지금 열려 있는 상태에서 클릭해서 "접을" 때
            if (isExpanded && (draft.photo || draft.text)) {
              setSavedMap((prev) => ({
                ...prev,
                [p.routeId]: true, // 이 장소는 작성됨
              }));
            }
            // 원래 하던 토글 동작
            onItemToggle && onItemToggle(p);
          };

          return (
            <div key={`${p.id}-${idx}`} className="timeline-card">
              {/* 상단 카드 한 줄 */}
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
                {/*왼쪽 드래그: 텍스트 */}
                <div className="timeline-item-left">
                  <span className="timeline-drag-handle">⋮⋮</span>
                  <div className="timeline-item-order">#{p.order}</div>
                  <div className="timeline-item-maintext">
                    <div className="timeline-item-name">{p.name}</div>
                    <div className="timeline-item-addr">{p.addr}</div>
                  </div>
                </div>

                {/* 오른쪽: 썸네일 + X + 작성완료 표시 */}
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

                  {/* 🔥 작성완료 핀 (X 밑에) */}
                  {isSaved && (
                    <div className="timeline-right-status">
                      <span className="timeline-status-dot" />
                      <span className="timeline-status-text">작성됨</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 펼쳐졌을 때 나오는 작성 영역 (버튼은 없음) */}
              {isExpanded && (
                <div className="timeline-editor">
                  {/* 사진 입력 줄 */}
                  <div className="timeline-photo-row">
                    <button type="button" className="timeline-photo-label-btn">
                      사진 등록
                    </button>
                    <input
                      type="text"
                      className="timeline-photo-input"
                      placeholder="사진 파일명이나 URL을 콤마(,)로 구분해서 입력"
                      value={draft.photo}
                      onChange={(e) =>
                        handleChange(p.id, 'photo', e.target.value)
                      }
                    />
                  </div>

                  {/* 글작성 박스 */}
                  <div className="timeline-textarea-wrap">
                    <textarea
                      className="timeline-textarea"
                      placeholder="이 장소에 대한 소개나 후기, 여행계획을 작성해보세요."
                      value={draft.text}
                      onChange={(e) =>
                        handleChange(p.id, 'text', e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🔥  맨 아래 공통 버튼 영역 */}
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
        </button>
      </div>
    </div>
  );
}

export default Timeline;
