import React, { useEffect, useMemo, useState } from "react";
import "../assets/css/ShipperProfilePage.css";
import { useNavigate } from "react-router-dom";
import { getUser, setToken, setUser, shipperApi } from "../api";

function buildDonutGradient(completed, failed, today) {
  const total = completed + failed + today || 1;
  const cEnd = (completed / total) * 100;
  const fEnd = cEnd + (failed / total) * 100;
  return `conic-gradient(var(--sp-green-mid) 0 ${cEnd}%, #b91c1c ${cEnd}% ${fEnd}%, var(--sp-green-dark) ${fEnd}% 100%)`;
}

function segmentPercent(value, completed, failed, today) {
  const total = completed + failed + today;
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getUser());
  const [perf, setPerf] = useState({
    delivered_total: 0,
    failed_total: 0,
    delivered_today: 0,
    success_rate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([shipperApi.me(), shipperApi.performance()])
      .then(([meRes, perfRes]) => {
        if (meRes.data) {
          setUser(meRes.data);
          setUserState(meRes.data);
        }
        setPerf(perfRes.data || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await shipperApi.logout();
    } catch {
      /* clear local session even if API fails */
    }
    setToken(null);
    navigate("/login");
  };

  const photoSrc = user?.photo_url || user?.photo;
  const completed = perf.delivered_total ?? 0;
  const failed = perf.failed_total ?? 0;
  const today = perf.delivered_today ?? 0;
  const successRate = perf.success_rate ?? 100;

  const donutStyle = useMemo(
    () => ({ background: buildDonutGradient(completed, failed, today) }),
    [completed, failed, today]
  );

  const completedPct = segmentPercent(completed, completed, failed, today);
  const failedPct = segmentPercent(failed, completed, failed, today);
  const todayPct = segmentPercent(today, completed, failed, today);

  return (
    <div className="sp-profile-page">
      <div className="sp-profile-top">
        <section className="sp-profile-banner">
          <div className="sp-profile-banner__scene" aria-hidden>
            {/* <div className="sp-profile-banner__skyline" /> */}
            {/* <div className="sp-profile-banner__road" /> */}
            {/* <div className="sp-profile-banner__boxes">
              <span />
              <span />
              <span />
            </div> */}
            {/* <i className="fa-solid fa-truck-fast sp-profile-banner__truck" aria-hidden /> */}
          </div>

          <div className="sp-profile-banner__content">
            <div className="sp-profile-banner__avatar-wrap">
              {photoSrc ? (
                <img src={photoSrc} alt="" className="sp-profile-banner__avatar" />
              ) : (
                <div className="sp-profile-banner__avatar sp-profile-banner__avatar--placeholder" aria-hidden />
              )}
              {user?.has_pin && (
                <span className="sp-profile-banner__avatar-badge" aria-hidden>
                  <i className="fa-solid fa-check" />
                </span>
              )}
            </div>

            <div className="sp-profile-banner__info">
              <h1 className="sp-profile-banner__name">
                {user?.name || "Shipper"}
                {user?.has_pin && <i className="fa-solid fa-circle-check" aria-hidden />}
              </h1>
              {user?.email && (
                <p className="sp-profile-banner__meta">
                  <i className="fa-solid fa-envelope" aria-hidden />
                  {user.email}
                </p>
              )}
              {user?.phone && (
                <p className="sp-profile-banner__meta">
                  <i className="fa-solid fa-phone" aria-hidden />
                  {user.phone}
                </p>
              )}
              <span className={`sp-profile-banner__status${user?.has_pin ? " is-verified" : ""}`}>
                <i className="fa-solid fa-shield-halved" aria-hidden />
                {user?.has_pin ? "Verified Shipper" : "Shipper"}
              </span>
            </div>
          </div>
        </section>

        <aside className="sp-profile-account">
          <button
            type="button"
            className="sp-profile-account__head"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
          >
            <i className="fa-solid fa-user" aria-hidden />
            <span>{user?.email || "Account"}</span>
            <i className={`fa-solid fa-chevron-down${menuOpen ? " is-open" : ""}`} aria-hidden />
          </button>
          {user?.phone && (
            <div className="sp-profile-account__phone">
              <i className="fa-solid fa-phone" aria-hidden />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="sp-profile-account__divider" />
          <button type="button" className="sp-profile-account__logout" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden />
            Logout
          </button>
        </aside>
      </div>

      <div className="sp-profile-kpis">
        <article className="sp-profile-kpi sp-profile-kpi--today">
          <div className="sp-profile-kpi__icon">
            <i className="fa-regular fa-calendar" aria-hidden />
          </div>
          <span className="sp-profile-kpi__label">Today</span>
          <strong className="sp-profile-kpi__value">{today}</strong>
          <svg className="sp-profile-kpi__wave" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden>
            <path d="M0 12 Q30 0 60 12 T120 12 V24 H0 Z" fill="currentColor" />
          </svg>
        </article>

        <article className="sp-profile-kpi sp-profile-kpi--completed">
          <div className="sp-profile-kpi__icon">
            <i className="fa-solid fa-clipboard-list" aria-hidden />
          </div>
          <span className="sp-profile-kpi__label">Completed</span>
          <strong className="sp-profile-kpi__value">{completed}</strong>
          <svg className="sp-profile-kpi__wave" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden>
            <path d="M0 12 Q30 0 60 12 T120 12 V24 H0 Z" fill="currentColor" />
          </svg>
        </article>

        <article className="sp-profile-kpi sp-profile-kpi--failed">
          <div className="sp-profile-kpi__icon">
            <i className="fa-solid fa-circle-xmark" aria-hidden />
          </div>
          <span className="sp-profile-kpi__label">Failed</span>
          <strong className="sp-profile-kpi__value">{failed}</strong>
          <svg className="sp-profile-kpi__wave" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden>
            <path d="M0 12 Q30 0 60 12 T120 12 V24 H0 Z" fill="currentColor" />
          </svg>
        </article>

        <article className="sp-profile-kpi sp-profile-kpi--success">
          <div className="sp-profile-kpi__icon">
            <i className="fa-solid fa-chart-simple" aria-hidden />
          </div>
          <span className="sp-profile-kpi__label">Success</span>
          <strong className="sp-profile-kpi__value">{successRate}%</strong>
          <svg className="sp-profile-kpi__wave" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden>
            <path d="M0 12 Q30 0 60 12 T120 12 V24 H0 Z" fill="currentColor" />
          </svg>
        </article>
      </div>

      <section className="sp-profile-performance">
        <h2 className="sp-profile-performance__title">Delivery Performance</h2>

        {loading ? (
          <p className="sp-profile-performance__loading">Loading performance…</p>
        ) : (
          <div className="sp-profile-performance__body">
            <div className="sp-profile-donut" style={donutStyle}>
              <div className="sp-profile-donut__center">
                <strong>{successRate}%</strong>
                <span>Success Rate</span>
              </div>
            </div>

            <ul className="sp-profile-legend">
              <li>
                <span className="sp-profile-legend__dot sp-profile-legend__dot--completed" aria-hidden />
                <span className="sp-profile-legend__label">Completed</span>
                <strong className="sp-profile-legend__count">{completed}</strong>
                <span className="sp-profile-legend__pill sp-profile-legend__pill--completed">{completedPct}%</span>
              </li>
              <li>
                <span className="sp-profile-legend__dot sp-profile-legend__dot--failed" aria-hidden />
                <span className="sp-profile-legend__label">Failed</span>
                <strong className="sp-profile-legend__count">{failed}</strong>
                <span className="sp-profile-legend__pill sp-profile-legend__pill--failed">{failedPct}%</span>
              </li>
              <li>
                <span className="sp-profile-legend__dot sp-profile-legend__dot--today" aria-hidden />
                <span className="sp-profile-legend__label">Today</span>
                <strong className="sp-profile-legend__count">{today}</strong>
                <span className="sp-profile-legend__pill sp-profile-legend__pill--today">{todayPct}%</span>
              </li>
            </ul>

            {/* <div className="sp-profile-performance__globe" aria-hidden>
              <div className="sp-profile-globe">
                <span className="sp-profile-globe__pin sp-profile-globe__pin--1" />
                <span className="sp-profile-globe__pin sp-profile-globe__pin--2" />
                <span className="sp-profile-globe__pin sp-profile-globe__pin--3" />
              </div>
              <i className="fa-solid fa-leaf sp-profile-performance__leaf sp-profile-performance__leaf--1" />
              <i className="fa-solid fa-leaf sp-profile-performance__leaf sp-profile-performance__leaf--2" />
            </div> */}
          </div>
        )}
      </section>
    </div>
  );
}
