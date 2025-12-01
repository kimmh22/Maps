// src/components/PlaceDetailPanel.jsx
import '../styles/PlaceDetailPanel.css';

function PlaceDetailPanel({
  place,
  detail,
  loading,
  error,
  onClose,
  onAddToTimeline,
}) {
  if (!place) return null;

  const { name, addr, category, imageUrl } = place;

  const formatYmd = (str) => {
    if (!str || str.length !== 8) return str;
    const y = str.slice(0, 4);
    const m = str.slice(4, 6);
    const d = str.slice(6, 8);
    return `${y}.${m}.${d}`;
  };

  // detail이 있으면 TourAPI 이미지/설명으로 덮어쓰기
  const displayImage =
    detail?.firstimage || detail?.firstimage2 || imageUrl || null;
  const displayAddr = detail?.addr1 || addr;
  const overview = detail?.overview;
  const tel = detail?.tel;
  const useTime = detail?.useTime;
  const eventStartDate = detail?.eventStartDate;
  const eventEndDate = detail?.eventEndDate;

  const replaceBrToNewline = (str) =>
    typeof str === 'string' ? str.replace(/<br\s*\/?>/gi, '\n') : str;

  const cleanUseTime = replaceBrToNewline(useTime)?.replace(
    /^이용시간\s*:/,
    ''
  );

  const cleanOverview = replaceBrToNewline(overview);

  const prettyStart = eventStartDate && formatYmd(eventStartDate);
  const prettyEnd = eventEndDate && formatYmd(eventEndDate);

  return (
    <div className="place-detail-root">
      {/* 상단 이미지 */}
      <div className="place-detail-image-wrap">
        {displayImage ? (
          <img src={displayImage} alt={name} className="place-detail-image" />
        ) : (
          <div className="place-detail-image-placeholder">이미지 없음</div>
        )}
      </div>

      <div className="place-detail-content">
        {/* 상단 제목 */}
        <div className="place-detail-header">
          <h2 className="place-detail-name">{name}</h2>
          {category && <span className="place-detail-badge">{category}</span>}
        </div>

        <div className="place-detail-addr">{displayAddr}</div>

        {/* 로딩/에러 상태 */}
        {loading && (
          <p className="place-detail-status">
            TourAPI에서 정보를 불러오는 중...
          </p>
        )}
        {error && (
          <p className="place-detail-status place-detail-status--error">
            {error}
          </p>
        )}

        {/* 상세 정보 */}
        {!loading && !error && (
          <>
            {tel && (
              <div className="place-detail-meta-row">
                <span className="label">전화 :</span>
                <span className="value">{tel}</span>
              </div>
            )}

            {useTime && (
              <div className="place-detail-meta-row">
                <span className="label">이용시간 :</span>
                <span className="value value-multiline">{cleanUseTime}</span>
              </div>
            )}

            {prettyStart && (
              <div className="place-detail-meta-row">
                <span className="label">행사기간 :</span>
                <span className="value">
                  {prettyStart} ~ {prettyEnd || '정보 없음'}
                </span>
              </div>
            )}

            {overview && (
              <div className="place-detail-overview">
                <h3>소개</h3>
                <p>{overview}</p>
              </div>
            )}
          </>
        )}

        {/* 버튼 */}
        <div className="place-detail-actions">
          <button
            type="button"
            className="btn-main"
            onClick={onAddToTimeline}
            disabled={loading}
          >
            경로에 추가하기
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>

        {/* 여행톡 자리 (나중에 확장) */}
        <div className="place-detail-footer">
          <h3 className="place-detail-footer-title">여행톡</h3>
          <p className="place-detail-footer-empty">
            나중에 이 장소에 대한 리뷰/후기를 여기에 넣을 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlaceDetailPanel;
