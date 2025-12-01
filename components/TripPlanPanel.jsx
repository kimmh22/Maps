// src/components/TripPlanPanel.jsx
import { useState } from 'react';
import '../styles/TripPlanPanel.css';

function TripPlanPanel({ place, totalPlaces, totalDistance, onClose }) {
  // 카드 펼침/접기 상태
  const [isOpen, setIsOpen] = useState(true);

  // 사진 / 내용 입력 상태
  const [photoText, setPhotoText] = useState('');
  const [content, setContent] = useState('');

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = () => {
    // TODO: 나중에 백엔드랑 연결해서 저장
    console.log('저장 데이터:', {
      placeId: place.id,
      order: place.order,
      photoText,
      content,
    });
    alert('나중에 백엔드 API랑 연결해서 진짜 저장하면 돼요!');
  };

  return (
    <div className="trip-plan-root">
      {/* 상단 타이틀 */}
      <header className="trip-plan-header">
        <h2 className="trip-plan-title">나의 여행계획</h2>
      </header>

      {/* 경로 요약 */}
      <section className="trip-plan-sub">
        <div className="trip-plan-summary-row">
          <div className="trip-plan-summary-labels">
            <div>총 {totalPlaces}개 여행지</div>
            <div>총 이동 거리 {totalDistance?.toFixed(1) || 0} km</div>
          </div>
        </div>

        {/* 🔥 장소 카드 (여길 클릭하면 바로 밑에 폼이 펼쳐짐) */}
        <div className="trip-plan-place-card">
          <button
            type="button"
            className="trip-plan-place-toggle"
            onClick={handleToggle}
          >
            <div className="trip-plan-place-left">
              <span className="trip-plan-place-order">#{place.order}</span>
              <div className="trip-plan-place-text">
                <div className="trip-plan-place-name">{place.name}</div>
                <div className="trip-plan-place-addr">{place.addr}</div>
              </div>
            </div>
            {place.imageUrl && (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="trip-plan-place-thumb"
              />
            )}
            <span className="trip-plan-place-arrow">{isOpen ? '▴' : '▾'}</span>
          </button>

          {/* 🔥 여기! 카드 바로 밑에 사진+내용 폼이 펼쳐진다 */}
          {isOpen && (
            <div className="trip-plan-inline-editor">
              {/* 사진 텍스트 입력만 (파일 업로드는 나중에) */}
              <div className="trip-plan-photo-row">
                <label className="trip-plan-photo-label">사진</label>
                <input
                  type="text"
                  className="trip-plan-photo-input"
                  placeholder="사진 파일명이나 URL을 적어주세요"
                  value={photoText}
                  onChange={(e) => setPhotoText(e.target.value)}
                />
              </div>

              {/* 내용 작성 */}
              <div className="trip-plan-textarea-wrap">
                <textarea
                  className="trip-plan-textarea"
                  placeholder="이 장소에 대한 소개나 후기, 여행계획을 작성해보세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 하단 버튼 */}
      <footer className="trip-plan-footer">
        <button
          type="button"
          className="trip-plan-btn-secondary"
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="button"
          className="trip-plan-btn-primary"
          onClick={handleSubmit}
        >
          글 작성하기
        </button>
      </footer>
    </div>
  );
}

export default TripPlanPanel;
