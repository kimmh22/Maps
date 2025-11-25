// src/components/Timeline.jsx

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
    <div
      style={{
        width: '25%',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #ddd',
      }}
    >
      <h3>4·5. 거리 & 타임라인</h3>
      <div style={{ fontSize: '13px', marginBottom: '8px' }}>
        선택한 핑 개수: <b>{selectedPlaces.length}</b>
        <br />총 이동 거리:{' '}
        <b>{totalDistance ? totalDistance.toFixed(2) : 0} km</b>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          borderTop: '1px solid #eee',
          paddingTop: '8px',
        }}
      >
        {selectedPlaces.length === 0 && (
          <p style={{ fontSize: '13px', color: '#777' }}>
            왼쪽에서 장소를 선택하면
            <br />
            여기 타임라인이 채워집니다.
          </p>
        )}

        {selectedPlaces.map((p, idx) => (
          <div
            key={p.order + p.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(idx)}
            style={{
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '1px dashed #ddd',
              backgroundColor:
                draggingIndex === idx ? '#f5f5f5' : 'transparent',
              cursor: 'grab',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            {/* 왼쪽: 정보 */}
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>#{p.order}</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '12px', color: '#555' }}>{p.addr}</div>
              {p.segmentDistance != null && (
                <div style={{ fontSize: '12px', color: '#333' }}>
                  이전 지점과 거리: <b>{p.segmentDistance.toFixed(2)} km</b>
                </div>
              )}
            </div>

            {/* 오른쪽: 삭제 버튼 */}
            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(idx);
              }}
              style={{
                alignSelf: 'center',
                padding: '2px 6px',
                fontSize: '11px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              삭제
            </button> */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(idx); // idx 넘김
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
