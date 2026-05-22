import "./CustomerDashboardPage.css";

export default function CustomerDashboardPage() {
  return (
    <div className="cd-main">
      <div className="cd-page-header">
        <div>
          <h1 className="cd-page-title">개인 고객 대시보드</h1>
          <p className="cd-page-sub">고객별 행동 데이터 및 캠페인 성과를 확인합니다</p>
        </div>
      </div>
      <div className="cd-content" />
    </div>
  );
}