import "./DashboardPage.css";

export default function DashboardPage() {
  return (
    <div className="db-main">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">전체 고객 대시보드</h1>
          <p className="db-page-sub">실시간 마케팅 캠페인 성과 모니터링</p>
        </div>
      </div>
      <div className="db-content" />
    </div>
  );
}