// src/components/SearchPanel.jsx

function SearchPanel({
  regionKeyword,
  onRegionKeywordChange,
  onRegionSearch,
  category,
  onCategoryChange,
  categories,
  center,
  places,
  onPlaceSelect,
}) {
  const handleKeyDown = (e) => {
    // 엔터로 검색
    if (e.key === 'Enter') {
      onRegionSearch();
    }

    // 스페이스바로 검색
    if (e.key === ' ') {
      // 입력창에 공백이 하나 더 생기는 게 싫으면 주석 해제
      // e.preventDefault();
      onRegionSearch();
    }
  };
  return (
    <div
      style={{
        width: '30%',
        borderRight: '1px solid #ddd',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* 1. 지역 검색 */}
      <div>
        <h3>1. 지역 검색</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={regionKeyword}
            onChange={(e) => onRegionKeywordChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 서울 중구, 부산 해운대"
            style={{ flex: 1, padding: '6px' }}
          />
          <button onClick={onRegionSearch}>검색</button>
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
          검색 후에 카테고리를 바꾸면, 같은 지역 기준으로 다른
          종류(숙박/음식점/축제)를 불러옵니다.
        </div>
      </div>

      {/* 2. 카테고리 선택 */}
      <div>
        <h3>2. 카테고리</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                padding: '6px 10px',
                backgroundColor: category === cat ? '#333' : '#eee',
                color: category === cat ? '#fff' : '#000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 장소 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3>3. 장소 선택</h3>

        {!center && (
          <p style={{ fontSize: '13px', color: '#777' }}>
            먼저 위에서 <b>지역 검색</b>을 해주세요.
          </p>
        )}

        {center && places.length === 0 && (
          <p style={{ fontSize: '13px', color: '#777' }}>
            이 지역에서 선택한 카테고리({category}) 데이터가 없거나, 아직
            불러오는 중일 수 있습니다.
          </p>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {places.map((p) => (
            <li
              key={p.id}
              style={{
                padding: '8px 4px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
              }}
              onClick={() => onPlaceSelect(p)}
            >
              {/* 왼쪽 텍스트 영역 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>{p.addr}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  카테고리: {p.category}
                </div>
              </div>

              {/* 오른쪽 썸네일 (TourAPI에만 있음) */}
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: '80px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchPanel;
