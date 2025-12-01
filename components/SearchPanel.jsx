// src/components/SearchPanel.jsx
import '../styles/SearchPanel.css';

function SearchPanel({
  regionKeyword,
  onRegionKeywordChange,
  onRegionSearch,
  category,
  onCategoryChange,
  categories,
  center,
  places,
  onPlaceClick,
  page,
  totalPages,
  onPageChange,
  selectedPlaces = [], // 🔥 새로 추가
  totalCount,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onRegionSearch();
    }
  };

  const safePage = page && page > 0 ? page : 1;
  const safeTotalPages = totalPages && totalPages > 0 ? totalPages : 1;
  const pageNumbers = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  // 선택된 카드인지 확인 (id + source 기준)
  const isPlaceSelected = (p) =>
    selectedPlaces.some(
      (sp) => sp.id === p.id && (sp.source || '') === (p.source || '')
    );

  return (
    <div className="search-panel-root">
      {/* 상단 헤더 */}
      <header className="search-header">
        <div className="search-header-top">
          <button type="button" className="header-back-btn">
            ←
          </button>
          <div className="header-title-wrap">
            <div className="header-subtitle">Travly 글 작성</div>
            <div className="header-title">Travly 검색</div>
          </div>
          <div className="header-logo">✈️</div>
        </div>

        {/* 검색창 */}
        <div className="header-search-row">
          <input
            type="text"
            value={regionKeyword}
            onChange={(e) => onRegionKeywordChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요"
            className="header-search-input"
          />
          <button
            type="button"
            className="header-search-btn"
            onClick={onRegionSearch}
          >
            검색
          </button>
        </div>

        {/* 카테고리 버튼 */}
        <div className="header-category-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={
                category === cat
                  ? 'header-category-btn header-category-btn--active'
                  : 'header-category-btn'
              }
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* 검색 결과 영역 */}
      <section className="search-results-section">
        <div className="search-results-header">
          {center ? (
            <>
              <span className="results-title">검색 결과</span>
              <span className="results-count">
                (현재 {places.length}건 / 전체 {totalCount}건)
              </span>
            </>
          ) : (
            <span className="results-title">먼저 지역 검색을 해주세요.</span>
          )}
        </div>

        {/* 카드 리스트 */}
        <div className="search-results-list-wrapper">
          <ul className="search-results-list">
            {places.map((p) => {
              const selected = isPlaceSelected(p);

              return (
                <li
                  key={p.id}
                  className={
                    selected
                      ? 'result-card result-card--selected'
                      : 'result-card'
                  }
                  onClick={() => onPlaceClick && onPlaceClick(p)}
                >
                  {/* 썸네일 */}
                  <div className="result-thumb-wrap">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="result-thumb-img"
                      />
                    ) : (
                      <div className="result-thumb-placeholder">No Image</div>
                    )}
                  </div>

                  {/* 텍스트 영역 */}
                  <div className="result-main">
                    <div className="result-category-badge">
                      {/* 카테고리 텍스트 (숙박 / 음식점 / 축제 등) */}
                      {p.category || category || '장소'}
                    </div>
                    <div className="result-name">{p.name}</div>
                    <div className="result-addr">{p.addr}</div>
                  </div>

                  {/* 오른쪽 아이콘 (선택 표시) */}
                  <div className="result-right">
                    {selected ? (
                      <div className="result-selected-icon">✓</div>
                    ) : (
                      <div className="result-marker-icon">📍</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 페이지네이션 */}
        {center && safeTotalPages > 1 && (
          <div className="search-pagination">
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                disabled={num === safePage}
                className={
                  num === safePage ? 'page-btn page-btn--active' : 'page-btn'
                }
                onClick={() => onPageChange(num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SearchPanel;
