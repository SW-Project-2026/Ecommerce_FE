import { useState, useEffect } from "react";
import "./CampaignListPage.css";
import CampaignCreatePage from "./CampaignCreatePage";
import CampaignDetailPage from "./CampaignDetailPage";
import CouponListPage from "./CouponListPage";
import CouponCreatePage from "./CouponCreatePage";
import DataManagePage from "./DataManagePage";
import EventFieldPage from "./EventFieldPage";
import AdManagePage from "./AdManagePage";
import AdCreatePage from "./AdCreatePage";
import DashboardPage from "./DashboardPage";
import CustomerDashboardPage from "./CustomerDashboardPage";
import { campaignList, campaignDetail } from "../api/campaigns";

const PAGE_SIZE = 10;

const STATUS_TABS = ["전체", "수행중", "일시정지", "종료"];

const STATUS_TAB_TO_API = {
  "수행중":   "IN_PROGRESS",
  "일시정지": "PAUSED",
  "종료":     "ENDED",
};

const STATUS_BADGE = {
  IN_PROGRESS: { className: "badge-running",   label: "수행중" },
  PAUSED:      { className: "badge-paused",    label: "일시정지" },
  ENDED:       { className: "badge-simulated", label: "종료" },
};

const NAV_ITEMS = [
  { label: "전체 고객 대시보드", key: "전체 고객 대시보드", depth: 0 },
  { label: "개인 고객 대시보드", key: "개인 고객 대시보드", depth: 0 },
  { label: "캠페인 관리",        key: "캠페인 관리",        depth: 0, hasChild: true, group: "campaign" },
  { label: "캠페인 목록",        key: "캠페인 목록",        depth: 1, group: "campaign" },
  { label: "캠페인 생성",        key: "캠페인 생성",        depth: 1, group: "campaign" },
  { label: "쿠폰 관리",          key: "쿠폰 관리",          depth: 0, hasChild: true, group: "coupon" },
  { label: "쿠폰 목록",          key: "쿠폰 목록",          depth: 1, group: "coupon" },
  { label: "쿠폰 등록",          key: "쿠폰 등록",          depth: 1, group: "coupon" },
  { label: "광고 관리",          key: "광고 관리",          depth: 0, hasChild: true, group: "ad" },
  { label: "광고 목록",          key: "광고 목록",          depth: 1, group: "ad" },
  { label: "광고 등록",          key: "광고 등록",          depth: 1, group: "ad" },
  { label: "이벤트 필드 설정",   key: "이벤트 필드 설정",   depth: 0 },
  { label: "데이터 관리",        key: "데이터 관리",        depth: 0 },
];

export default function CampaignListPage() {
  const [activePage,       setActivePage]       = useState("캠페인 목록");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailLoading,    setDetailLoading]    = useState(false);
  const [detailError,      setDetailError]      = useState(null);
  const [campaignOpen,     setCampaignOpen]     = useState(true);
  const [couponOpen,       setCouponOpen]       = useState(false);
  const [adOpen,           setAdOpen]           = useState(false);
  const [activeTab,        setActiveTab]        = useState("전체");
  const [searchText,       setSearchText]       = useState("");
  const [selectedNo,       setSelectedNo]       = useState(null);
  const [currentPage,      setCurrentPage]      = useState(1);

  const [editCoupon, setEditCoupon] = useState(null);
  const [editAd,     setEditAd]     = useState(null);

  const [campaignData, setCampaignData] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const fetchCampaigns = () => {
    if (activePage !== "캠페인 목록") return;
    setLoading(true);
    setError(null);
    const apiStatus = STATUS_TAB_TO_API[activeTab] ?? undefined;
    campaignList({ status: apiStatus })
      .then(data => { setCampaignData(Array.isArray(data) ? data : []); setCurrentPage(1); })
      .catch(err => {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError('로그인이 필요합니다. 관리자 계정으로 로그인해주세요.');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, [activePage, activeTab]);

  const handleCampaignDetailClick = async (campaignId) => {
    if (detailLoading) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await campaignDetail({ campaignId });
      setSelectedCampaign(detail);
      setActivePage("캠페인 상세");
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredData = campaignData.filter(row =>
    !searchText ||
    (row.campaignName ?? "").includes(searchText) ||
    String(row.campaignId ?? "").includes(searchText)
  );
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pagedData  = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchText]);

  const handleNavClick = (item) => {
    if (item.key === "캠페인 관리") { setCampaignOpen((p) => !p); return; }
    if (item.key === "쿠폰 관리")   { setCouponOpen((p) => !p);   return; }
    if (item.key === "광고 관리")   { setAdOpen((p) => !p);       return; }
    if (item.group === "coupon") setCouponOpen(true);
    if (item.group === "ad")     setAdOpen(true);
    if (item.key === "쿠폰 등록") setEditCoupon(null);
    if (item.key === "광고 등록") setEditAd(null);
    setActivePage(item.key);
  };

  const renderNavHeader = () => (
    <header className="cl-nav-header">
      <div className="cl-nav-header-logo">
        <div className="cl-logo-icon">
          <span className="cl-logo-d">D</span>
          <span className="cl-logo-dot" />
        </div>
        <span className="cl-logo-text">Da-On</span>
      </div>
      <span className="cl-admin-label">admin</span>
    </header>
  );

  const renderSidebar = () => (
    <aside className="cl-sidebar">
      <nav className="cl-nav">
        {NAV_ITEMS.map((item, i) => {
          if (item.depth === 1 && item.group === "campaign" && !campaignOpen) return null;
          if (item.depth === 1 && item.group === "coupon"   && !couponOpen)   return null;
          if (item.depth === 1 && item.group === "ad"       && !adOpen)       return null;
          const isActive       = item.key === activePage;
          const isCampaignOpen = item.key === "캠페인 관리" && campaignOpen;
          const isCouponOpen   = item.key === "쿠폰 관리"   && couponOpen;
          const isAdOpen       = item.key === "광고 관리"   && adOpen;
          return (
            <div
              key={i}
              className={[
                "cl-nav-item",
                item.depth === 1 ? "cl-nav-sub" : "",
                isActive ? "cl-nav-active" : "",
                isCampaignOpen || isCouponOpen || isAdOpen ? "cl-nav-parent-open" : "",
              ].join(" ")}
              onClick={() => handleNavClick(item)}
            >
              <span>{item.label}</span>
              {item.hasChild && <span className="cl-nav-arrow" />}
            </div>
          );
        })}
      </nav>
    </aside>
  );

  const Layout = ({ children }) => (
    <div className="cl-root">
      {renderNavHeader()}
      <div className="cl-body">
        {renderSidebar()}
        {children}
      </div>
    </div>
  );

  if (activePage === "캠페인 상세") {
    return (
      <Layout>
        <div className="cl-main">
          {detailLoading ? (
            <div className="cl-table-state">불러오는 중...</div>
          ) : detailError ? (
            <div className="cl-table-state cl-table-error">{detailError}</div>
          ) : (
            <CampaignDetailPage
              campaign={selectedCampaign}
              onNavigate={(page) => {
                if (page === "list") {
                  setSelectedCampaign(null);
                  setActivePage("캠페인 목록");
                  fetchCampaigns();
                } else {
                  setActivePage(page);
                }
              }}
            />
          )}
        </div>
      </Layout>
    );
  }

  if (activePage === "캠페인 생성") {
    return (
      <Layout>
        <div className="cl-main">
          <CampaignCreatePage
            onNavigate={(page) => {
              if (page === "list") {
                setActivePage("캠페인 목록");
                fetchCampaigns();
              } else {
                setActivePage(page);
              }
            }}
          />
        </div>
      </Layout>
    );
  }

  if (activePage === "쿠폰 목록") {
    return (
      <Layout>
        <CouponListPage
          onNavigate={(page, data) => {
            if (page === "create") {
              setEditCoupon(data ?? null);
              setActivePage("쿠폰 등록");
            } else {
              setActivePage(page);
            }
          }}
        />
      </Layout>
    );
  }

  if (activePage === "쿠폰 등록") {
    return (
      <Layout>
        <CouponCreatePage
          coupon={editCoupon}
          onNavigate={(page) => {
            setEditCoupon(null);
            setActivePage(page === "list" ? "쿠폰 목록" : page);
          }}
        />
      </Layout>
    );
  }

  if (activePage === "개인 고객 대시보드") {
    return <Layout><CustomerDashboardPage /></Layout>;
  }

  if (activePage === "전체 고객 대시보드") {
    return <Layout><DashboardPage /></Layout>;
  }

  if (activePage === "광고 목록" || activePage === "광고 관리") {
    return (
      <Layout>
        <AdManagePage
          onNavigate={(page, data) => {
            if (page === "create") {
              setEditAd(data ?? null);
              setActivePage("광고 등록");
            } else {
              setActivePage(page);
            }
          }}
        />
      </Layout>
    );
  }

  if (activePage === "광고 등록") {
    return (
      <Layout>
        <AdCreatePage
          ad={editAd}
          onNavigate={(page) => {
            setEditAd(null);
            setActivePage(page === "list" ? "광고 목록" : page);
          }}
        />
      </Layout>
    );
  }

  if (activePage === "이벤트 필드 설정") {
    return <Layout><EventFieldPage /></Layout>;
  }

  if (activePage === "데이터 관리") {
    return <Layout><DataManagePage /></Layout>;
  }

  return (
    <Layout>
      <div className="cl-main">
        <div className="cl-page-header">
          <div>
            <h1 className="cl-page-title">캠페인 목록</h1>
            <p className="cl-page-sub">캠페인 목록을 조회합니다</p>
          </div>
          <button className="cl-btn-primary" onClick={() => setActivePage("캠페인 생성")}>
            + 캠페인 생성
          </button>
        </div>

        <div className="cl-content">
          <div className="cl-card">
            <div className="cl-toolbar">
              <div className="cl-search-wrap">
                <input
                  className="cl-search"
                  placeholder="캠페인명 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="cl-search-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </div>
              <div className="cl-tabs">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`cl-tab ${activeTab === tab ? "cl-tab-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {detailLoading && (
              <div className="cl-table-state" style={{ padding: "8px 16px", color: "#666", fontSize: 13 }}>
                캠페인 상세 불러오는 중...
              </div>
            )}
            {detailError && (
              <div className="cl-table-state cl-table-error" style={{ padding: "8px 16px", fontSize: 13 }}>
                {detailError}
              </div>
            )}

            <table className="cl-table">
              <thead>
                <tr>
                  <th>No</th><th>선택</th><th>캠페인 ID</th><th>분류1</th><th>분류2</th>
                  <th>캠페인 명</th><th>상태</th><th>시작일자</th><th>종료일자</th><th>기안자</th><th>기안일자</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={11} className="cl-table-state">불러오는 중...</td></tr>
                )}
                {!loading && error && (
                  <tr><td colSpan={11} className="cl-table-state cl-table-error">{error}</td></tr>
                )}
                {!loading && !error && pagedData.length === 0 && (
                  <tr><td colSpan={11} className="cl-table-state">데이터가 없습니다</td></tr>
                )}
                {!loading && !error && pagedData.map((row, i) => {
                  const globalNo = (currentPage - 1) * PAGE_SIZE + i + 1;
                  const badge    = STATUS_BADGE[row.status];
                  const isSelected = selectedNo === row.campaignId;
                  return (
                    <tr
                      key={row.campaignId}
                      className={`cl-clickable-row ${isSelected ? "cl-row-selected" : ""}`}
                      onClick={() => {
                        setSelectedNo(row.campaignId);
                        handleCampaignDetailClick(row.campaignId);
                      }}
                    >
                      <td>{globalNo}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="selectedRow"
                          checked={isSelected}
                          onChange={() => setSelectedNo(row.campaignId)}
                          className="cl-radio"
                        />
                      </td>
                      <td style={{ color: "#3F76E4", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        {row.campaignId}
                      </td>
                      <td>{row.campaignGoalType}</td>
                      <td>{row.customerSegment}</td>
                      <td className="cl-campaign-name">{row.campaignName}</td>
                      <td>
                        <span className={`cl-badge ${badge?.className ?? ""}`}>
                          {badge?.label ?? row.status}
                        </span>
                      </td>
                      <td>{row.startedAt}</td>
                      <td>{row.endedAt}</td>
                      <td>{row.createdBy}</td>
                      <td>{row.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && !error && (
              <div className="cl-pagination">
                <button
                  className="cl-page-btn cl-page-prev"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                  <button
                    key={p}
                    className={`cl-page-btn ${currentPage === p ? "cl-page-active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="cl-page-btn cl-page-next"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}