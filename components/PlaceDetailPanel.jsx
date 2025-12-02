// src/components/PlaceDetailPanel.jsx
import '../styles/PlaceDetailPanel.css';

// ===== 헬퍼 함수들 =====
const formatYmd = (str) => {
  if (!str || str.length !== 8) return str;
  const y = str.slice(0, 4);
  const m = str.slice(4, 6);
  const d = str.slice(6, 8);
  return `${y}.${m}.${d}`;
};

const replaceBrToNewline = (str) =>
  typeof str === 'string' ? str.replace(/<br\s*\/?>/gi, '\n') : str;

// ===== 메인 컴포넌트 =====
function PlaceDetailPanel({
  place,
  detail,
  loading,
  error,
  onClose,
  onAddToTimeline,
}) {
  if (!place) return null;

  // ----- 기본 정보(검색 결과에서 온 것) -----
  const { name, addr, category, imageUrl } = place;

  // ----- TourAPI 상세 정보 반영 -----
  const displayImage =
    detail?.firstimage || detail?.firstimage2 || imageUrl || null;
  const displayAddr = detail?.addr1 || addr;

  const tel = detail?.tel;
  const useTime = detail?.useTime;
  const eventStartDate = detail?.eventStartDate;
  const eventEndDate = detail?.eventEndDate;

  // 숙박 전용
  const checkInTime = detail?.checkInTime;
  const checkOutTime = detail?.checkOutTime;
  const roomCount = detail?.roomCount;
  const roomType = detail?.roomType;
  const parkingLodging = detail?.parkingLodging;
  const reservationLodging = detail?.reservationLodging;
  const subFacility = detail?.subFacility;

  // 음식점 전용
  const firstMenu = detail?.firstMenu;
  const treatMenu = detail?.treatMenu;
  const restDate = detail?.restDate;
  const parkingFood = detail?.parkingFood;
  const packing = detail?.packing;

  const overview = detail?.overview;

  // ----- 문자열 정리 -----
  const cleanUseTime = replaceBrToNewline(useTime)?.replace(
    /^이용시간\s*:/,
    ''
  );
  const cleanOverview = replaceBrToNewline(overview);
  const prettyStart = eventStartDate && formatYmd(eventStartDate);
  const prettyEnd = eventEndDate && formatYmd(eventEndDate);

  // 실제 주차 정보(숙박/음식 둘 중 하나)
  const parkingInfo = parkingLodging || parkingFood || null;

  return (
    <div className="place-detail-root">
      {/* ===== 상단 이미지 ===== */}
      <div className="place-detail-image-wrap">
        {displayImage ? (
          <img src={displayImage} alt={name} className="place-detail-image" />
        ) : (
          <div className="place-detail-image-placeholder">이미지 없음</div>
        )}
      </div>

      {/* ===== 텍스트 영역 ===== */}
      <div className="place-detail-content">
        {/* 제목 + 카테고리 배지 */}
        <div className="place-detail-header">
          <h2 className="place-detail-name">{name}</h2>
          {category && <span className="place-detail-badge">{category}</span>}
        </div>

        {/* 주소 */}
        <div className="place-detail-addr">{displayAddr}</div>

        {/* 로딩 / 에러 상태 */}
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

        {/* ===== 상세 메타 정보 ===== */}
        {!loading && !error && (
          <>
            {/* 연락처 / 이용시간 / 행사기간 등 */}
            <div className="place-detail-meta">
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

              {/* 숙박 정보 */}
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
                    {roomCount && `객실 수 ${roomCount} `}
                    {roomType && `(${roomType})`}
                  </span>
                </div>
              )}

              {subFacility && (
                <div className="place-detail-meta-row">
                  <span className="label">부대시설 :</span>
                  <span className="value value-multiline">{subFacility}</span>
                </div>
              )}

              {/* 공통/음식점 주차 */}
              {parkingInfo && (
                <div className="place-detail-meta-row">
                  <span className="label">주차 :</span>
                  <span className="value value-multiline">{parkingInfo}</span>
                </div>
              )}

              {reservationLodging && (
                <div className="place-detail-meta-row">
                  <span className="label">예약 :</span>
                  <span className="value value-multiline">
                    {reservationLodging}
                  </span>
                </div>
              )}

              {/* 음식점 정보 */}
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
            </div>

            {/* 소개문 */}
            {overview && (
              <div className="place-detail-overview">
                <h3>소개</h3>
                <p className="value-multiline">{cleanOverview}</p>
              </div>
            )}
          </>
        )}

        {/* ===== 버튼 영역 ===== */}
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

        {/* ===== 여행톡 자리(향후 확장) ===== */}
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
