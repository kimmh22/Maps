// src/components/TravelCategoryModal.jsx
import { useState } from 'react';
import '../styles/TravelCategoryModal.css';

const WITH_WHO_OPTIONS = [
  '혼자',
  '친구와',
  '연인과',
  '배우자와',
  '아이와',
  '부모님과',
  '반려동물과',
  '기타',
];

const DURATION_OPTIONS = [
  '당일',
  '1박2일',
  '2박3일',
  '3박4일',
  '4박5일',
  '5박6일',
  '7일 이상',
  '기타',
];

const STYLE_OPTIONS = [
  '체험/액티비티',
  'SNS/핫플레이스',
  '자연',
  '유명 관광지',
  '여유롭게',
  '문화/예술/역사',
  '여행지 느낌',
  '쇼핑/음식',
];

function TravelCategoryModal({ onNext }) {
  const [withWho, setWithWho] = useState([]);
  const [duration, setDuration] = useState('');
  const [styles, setStyles] = useState([]);

  // 최대 3개
  const toggleWithWho = (value) => {
    // 이미 선택되어 있으면 해제
    if (withWho.includes(value)) {
      setWithWho(withWho.filter((v) => v !== value));
      return;
    }

    // 아직 선택 안 됐는데, 이미 3개 선택되어 있으면 -> 알림
    if (withWho.length >= 3) {
      alert('동행자는 최대 3개까지 선택할 수 있어요.');
      return;
    }

    // 정상적으로 추가
    setWithWho([...withWho, value]);
  };

  // 1개 고정
  const selectDuration = (value) => {
    setDuration(value);
  };

  // 최대 5개
  const toggleStyle = (value) => {
    if (styles.includes(value)) {
      setStyles(styles.filter((v) => v !== value));
      return;
    }

    if (styles.length >= 5) {
      alert('여행 스타일은 최대 5개까지 선택할 수 있어요.');
      return;
    }

    setStyles([...styles, value]);
  };

  const handleNext = () => {
    if (withWho.length === 0) {
      alert('누구와 떠나는지 최소 1개 이상 선택해 주세요.');
      return;
    }
    if (!duration) {
      alert('여행 기간을 1개 선택해 주세요.');
      return;
    }
    if (styles.length === 0) {
      alert('여행 스타일을 최소 1개 이상 선택해 주세요.');
      return;
    }

    const meta = { withWho, duration, styles };
    onNext && onNext(meta);
  };

  return (
    <div className="tcm-backdrop">
      <header className="tcm-global-header">
        <button className="tcm-global-back-btn">←</button>
        <div className="tcm-global-title">Travly 글 작성</div>
      </header>

      <div className="tcm-card">
        <div className="tcm-header-center">
          <div className="tcm-logo">✈️</div>
          <h1 className="tcm-title">나의 여행 카테고리</h1>
        </div>

        {/* 내용 */}
        <div className="tcm-body">
          {/* 1. 누구와 떠나나요 */}
          <section className="tcm-section">
            <div className="tcm-section-title">
              누구와 떠나나요?{' '}
              <span className="tcm-section-sub">(최대 3개)</span>
            </div>
            <div className="tcm-chip-grid">
              {WITH_WHO_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleWithWho(opt)}
                  className={
                    withWho.includes(opt)
                      ? 'tcm-chip tcm-chip--active'
                      : 'tcm-chip'
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* 2. 여행 기간 */}
          <section className="tcm-section">
            <div className="tcm-section-title">
              여행 기간은? <span className="tcm-section-sub">(1개)</span>
            </div>
            <div className="tcm-chip-grid">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectDuration(opt)}
                  className={
                    duration === opt ? 'tcm-chip tcm-chip--active' : 'tcm-chip'
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* 3. 여행 스타일 */}
          <section className="tcm-section">
            <div className="tcm-section-title">
              여행 스타일? <span className="tcm-section-sub">(최대 5개)</span>
            </div>
            <div className="tcm-chip-grid">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleStyle(opt)}
                  className={
                    styles.includes(opt)
                      ? 'tcm-chip tcm-chip--active'
                      : 'tcm-chip'
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 하단 버튼 */}
        <footer className="tcm-footer">
          <button type="button" className="tcm-next-btn" onClick={handleNext}>
            다음으로
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TravelCategoryModal;
