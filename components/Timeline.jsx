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
  expandedPlaceId,
  onItemToggle,
}) {
  const [drafts, setDrafts] = useState({}); // { [placeId]: { photo, text } }

  const handleChange = (placeId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [placeId]: {
        ...(prev[placeId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (place) => {
    const draft = drafts[place.id] || {};
    console.log('작성 데이터:', {
      placeId: place.id,
      order: place.order,
      photo: draft.photo || '',
      text: draft.text || '',
    });
    alert('나중에 이 데이터를 백엔드로 보내면 돼요!');
  };

  return (
    <div className="timeline-root">
      <h3 className="timeline-title">경로 요약</h3>
      <div className="timeline-summary">
        총 <b>{selectedPlaces.length}</b>개 여행지
        <br />총 이동 거리:{' '}
        <b>{totalDistance ? totalDistance.toFixed(2) : 0} km</b>
      </div>

      <div className="timeline-list-wrapper">
        {selectedPlaces.length === 0 && (
          <p className="timeline-empty">
            왼쪽에서 장소를 선택하면
            <br />
            여기 타임라인이 채워집니다.
          </p>
        )}

        {selectedPlaces.map((p, idx) => {
          const isExpanded = expandedPlaceId === p.id;
          const draft = drafts[p.id] || { photo: '', text: '' };

          return (
            <div key={`${p.id}-${idx}`} className="timeline-card">
              {/* 상단 카드 (노들섬 줄) */}
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
                onClick={() => onItemToggle && onItemToggle(p)}
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
                  {/* ⚠️ 나중에 사용자가 등록한 썸네일 있으면 여기서 보여주면 됨 */}
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
              </div>

              {/* 펼친 상태에서 사진/글 작성 */}
              {isExpanded && (
                <div className="timeline-editor">
                  {/* 430 x 62 : 사진 등록 줄 */}
                  <div className="timeline-photo-row">
                    <button type="button" className="timeline-photo-label-btn">
                      사진 등록
                    </button>
                    <input
                      type="text"
                      className="timeline-photo-input"
                      placeholder="사진 파일명이나 URL을 적어주세요"
                      value={draft.photo}
                      onChange={(e) =>
                        handleChange(p.id, 'photo', e.target.value)
                      }
                    />
                  </div>

                  {/* 390 x 200 : 글 작성 박스 */}
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

                  <div className="timeline-editor-buttons">
                    <button
                      type="button"
                      className="timeline-editor-btn"
                      onClick={() => onItemToggle && onItemToggle(p)}
                    >
                      닫기
                    </button>
                    <button
                      type="button"
                      className="timeline-editor-btn timeline-editor-btn--primary"
                      onClick={() => handleSubmit(p)}
                    >
                      글 작성하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
