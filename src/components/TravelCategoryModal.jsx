// src/components/TravelCategoryModal.jsx
import { useState, useEffect } from 'react';
import '../styles/TravelCategoryModal.css';
import apiClient from '../services/apiClient';

function TravelCategoryModal({ onNext, onClose }) {
  // DB에서 가져온 filter + filterItem 전체
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true); // 처음엔 true로 시작
  const [error, setError] = useState(null);

  // 선택 상태 (모두 id 기준)
  const [withWhoIds, setWithWhoIds] = useState([]); // 여러 개 선택
  const [durationId, setDurationId] = useState(null); // 1개 선택
  const [styleIds, setStyleIds] = useState([]); // 여러 개 선택

  // ==========================
  // 필터 데이터 로딩
  // ==========================
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/filter');
        console.log('필터 데이터 : ', res.data); // ✅ 오타 수정

        setFilters(res.data);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('여행 카테고리 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ==========================
  // 코드별(혹은 id별) 그룹 분리
  // ==========================
  // 👉 백엔드 JSON에는 code가 없으니까 id 기준으로 분리
  //    (1: 누구와, 2: 기간, 3: 스타일)
  const withWhoFilter =
    filters?.find((f) => f.id === 1 || f.code === 'WITH_WHO') || null;
  const durationFilter =
    filters?.find((f) => f.id === 2 || f.code === 'DURATION') || null;
  const styleFilter =
    filters?.find((f) => f.id === 3 || f.code === 'STYLE') || null;

  const withWhoOptions = withWhoFilter?.items || [];
  const durationOptions = durationFilter?.items || [];
  const styleOptions = styleFilter?.items || [];

  const withWhoMax = withWhoFilter?.multiSelectCount ?? 3;
  const styleMax = styleFilter?.multiSelectCount ?? 5;

  // ==========================
  // 선택 핸들러
  // ==========================

  // 누구와? (최대 multiSelectCount)
  const toggleWithWho = (itemId) => {
    setWithWhoIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      if (prev.length >= withWhoMax) {
        // 최대 개수 도달
        return prev;
      }
      return [...prev, itemId];
    });
  };

  // 기간 (1개)
  const selectDuration = (itemId) => {
    setDurationId(itemId);
  };

  // 스타일 (최대 multiSelectCount)
  const toggleStyle = (itemId) => {
    setStyleIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      if (prev.length >= styleMax) {
        return prev;
      }
      return [...prev, itemId];
    });
  };

  // 다음 단계로 넘기기
  const handleNext = () => {
    const filterItemIds = [
      ...withWhoIds,
      ...(durationId ? [durationId] : []),
      ...styleIds,
    ];

    const meta = {
      withWhoIds,
      durationId,
      styleIds,
      filterItemIds,
    };

    onNext && onNext(meta);
    onClose && onClose();
  };

  // ==========================
  // 로딩/에러 상태
  // ==========================

  if (loading) {
    return (
      <div className="tcm-backdrop">
        <div className="tcm-card">
          <div className="tcm-header-center">
            <div className="tcm-logo">✈️</div>
            <h1 className="tcm-title">여행 카테고리 불러오는 중...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tcm-backdrop">
        <div className="tcm-card">
          <div className="tcm-header-center">
            <div className="tcm-logo">⚠️</div>
            <h1 className="tcm-title">오류</h1>
            <p style={{ marginTop: 16 }}>{error}</p>
            <button type="button" className="tcm-next-btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // filters가 뭔가 꼬여서 하나도 못 찾은 경우 방어
  if (!withWhoFilter || !durationFilter || !styleFilter) {
    return (
      <div className="tcm-backdrop">
        <div className="tcm-card">
          <div className="tcm-header-center">
            <div className="tcm-logo">⚠️</div>
            <h1 className="tcm-title">카테고리 설정 오류</h1>
            <p style={{ marginTop: 16 }}>
              여행 카테고리 정보가 올바르지 않습니다. 관리자에게 문의해 주세요.
            </p>
            <button type="button" className="tcm-next-btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // 실제 렌더링
  // ==========================

  return (
    <div className="tcm-backdrop">
      <header className="tcm-global-header">
        <button className="tcm-global-back-btn" type="button" onClick={onClose}>
          ←
        </button>
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
              {withWhoFilter.name}{' '}
              <span className="tcm-section-sub">(최대 {withWhoMax}개)</span>
            </div>
            <div className="tcm-chip-grid">
              {withWhoOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleWithWho(item.id)}
                  className={
                    withWhoIds.includes(item.id)
                      ? 'tcm-chip tcm-chip--active'
                      : 'tcm-chip'
                  }
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          {/* 2. 여행 기간 */}
          <section className="tcm-section">
            <div className="tcm-section-title">
              {durationFilter.name}{' '}
              <span className="tcm-section-sub">(1개)</span>
            </div>
            <div className="tcm-chip-grid">
              {durationOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectDuration(item.id)}
                  className={
                    durationId === item.id
                      ? 'tcm-chip tcm-chip--active'
                      : 'tcm-chip'
                  }
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          {/* 3. 여행 스타일 */}
          <section className="tcm-section">
            <div className="tcm-section-title">
              {styleFilter.name}{' '}
              <span className="tcm-section-sub">(최대 {styleMax}개)</span>
            </div>
            <div className="tcm-chip-grid">
              {styleOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleStyle(item.id)}
                  className={
                    styleIds.includes(item.id)
                      ? 'tcm-chip tcm-chip--active'
                      : 'tcm-chip'
                  }
                >
                  {item.name}
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
