// src/components/Timeline.jsx
import '../styles/Timeline.css';

function Timeline({
  selectedPlaces,
  totalDistance,
  draggingIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onRemove,
}) {
  return (
    <div className="timeline-root">
      <h3 className="timeline-title">4·5. 거리 & 타임라인</h3>
      <div className="timeline-summary">
        선택한 핑 개수: <b>{selectedPlaces.length}</b>
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

        {selectedPlaces.map((p, idx) => (
          <div
            key={`${p.id}-${idx}`}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(idx)}
            className={
              draggingIndex === idx
                ? 'timeline-item timeline-item--dragging'
                : 'timeline-item'
            }
          >
            <div className="timeline-item-text">
              <div className="timeline-item-order">#{p.order}</div>
              <div className="timeline-item-name">{p.name}</div>
              <div className="timeline-item-addr">{p.addr}</div>
              {p.segmentDistance != null && (
                <div className="timeline-item-distance">
                  이전 지점과 거리: <b>{p.segmentDistance.toFixed(2)} km</b>
                </div>
              )}
            </div>

            <button
              type="button"
              className="timeline-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(idx);
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
