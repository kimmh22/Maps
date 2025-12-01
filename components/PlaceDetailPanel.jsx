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

  const checkInTime = detail?.checkInTime;
  const checkOutTime = detail?.checkOutTime;
  const roomCount = detail?.roomCount;
  const roomType = detail?.roomType;
  const parkingLodging = detail?.parkingLodging;
  const reservationLodging = detail?.reservationLodging;
  const subFacility = detail?.subFacility;

  const firstMenu = detail?.firstMenu;
  const treatMenu = detail?.treatMenu;
  const restDate = detail?.restDate;
  const parkingFood = detail?.parkingFood;
  const packing = detail?.packing;

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
            {/* 🔥 숙박 전용 정보 */}
            {(checkInTime || checkOutTime) && (
              <div className="place-detail-meta-row">
                <span className="label">체크인/체크아웃 :</span>
                <span className="value">
                  {checkInTime && `체크인 ${checkInTime} `}
                  {checkOutTime && ` / 체크아웃 ${checkOutTime}`}
                </span>
              </div>
            )}

            {(roomCount || roomType) && (
              <div className="place-detail-meta-row">
                <span className="label">객실 정보 :</span>
                <span className="value">
                  {roomCount && `객실 수 ${roomCount} `}{' '}
                  {roomType && `(${roomType})`}
                </span>
              </div>
            )}

            {(parkingLodging || parkingFood) && (
              <div className="place-detail-meta-row">
                <span className="label">주차 :</span>
                <span className="value">{parkingLodging || parkingFood}</span>
              </div>
            )}

            {reservationLodging && (
              <div className="place-detail-meta-row">
                <span className="label">예약 :</span>
                <span className="value">{reservationLodging}</span>
              </div>
            )}

            {subFacility && (
              <div className="place-detail-meta-row">
                <span className="label">부대시설 :</span>
                <span className="value value-multiline">{subFacility}</span>
              </div>
            )}

            {/* 🔥 음식점 전용 정보 */}
            {(firstMenu || treatMenu) && (
              <div className="place-detail-meta-row">
                <span className="label">대표메뉴 :</span>
                <span className="value value-multiline">
                  {firstMenu && `${firstMenu}\n`}
                  {treatMenu && treatMenu}
                </span>
              </div>
            )}

            {restDate && (
              <div className="place-detail-meta-row">
                <span className="label">휴무일 :</span>
                <span className="value value-multiline">{restDate}</span>
              </div>
            )}

            {packing && (
              <div className="place-detail-meta-row">
                <span className="label">포장 :</span>
                <span className="value">{packing}</span>
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
