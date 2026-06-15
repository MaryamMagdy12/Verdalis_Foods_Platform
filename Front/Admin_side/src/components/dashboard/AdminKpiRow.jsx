import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faArrowTrendDown } from "@fortawesome/free-solid-svg-icons";
import { Sparkline } from "./Sparkline";

export function AdminKpiRow({ cards = [] }) {
  if (!cards.length) return null;
  return (
    <div className="admin-kpi-row">
      {cards.map((card) => {
        const trendUp = card.trendUp !== false && (card.trend == null || !String(card.trend).startsWith("-"));
        return (
          <div key={card.label} className={`admin-kpi-card admin-kpi-card--${card.variant || "default"}`}>
            <div className="admin-kpi-card-top">
              <div className={`admin-kpi-icon admin-kpi-icon--${card.iconVariant || "green"}`}>
                {card.icon && <FontAwesomeIcon icon={card.icon} />}
              </div>
              <Sparkline data={card.sparkline} color={card.sparkColor || (trendUp ? "#2e7d32" : "#dc2626")} />
            </div>
            <span className="admin-kpi-label">{card.label}</span>
            <strong className="admin-kpi-value">{card.value}</strong>
            {card.trend != null && (
              <span className={`admin-kpi-trend ${trendUp ? "is-up" : "is-down"}`}>
                <FontAwesomeIcon icon={trendUp ? faArrowTrendUp : faArrowTrendDown} />
                {card.trend} {card.trendSuffix || "vs last 30 days"}
              </span>
            )}
            {card.subtext && <span className="admin-kpi-subtext">{card.subtext}</span>}
          </div>
        );
      })}
    </div>
  );
}
