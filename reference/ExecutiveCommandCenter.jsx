import { useState, useEffect } from "react";

// ── Executive Command Center: The "So What" for an IT Director ──
// This replaces the current landing page grid with an actionable intelligence view
// that surfaces signals from noise across all 17 dashboards

const DOMAIN_HEALTH = [
  {
    id: "itsm",
    label: "IT Service Management",
    status: "warning",
    score: 72,
    headline: "SLA compliance declining — P1 response breached 22% this week",
    metrics: [
      { label: "Open P1s", value: "12", trend: "up", bad: true },
      { label: "MTTR", value: "4.2h", trend: "down", bad: false },
      { label: "SLA Met", value: "78%", trend: "down", bad: true },
      { label: "CSAT", value: "4.3", trend: "up", bad: false },
    ],
    actions: [
      { text: "Review 13 SLA-breached P1 incidents", priority: "critical", page: "incident" },
      { text: "3 problems recurring without root cause", priority: "high", page: "problem" },
    ],
  },
  {
    id: "itom",
    label: "Infrastructure & Observability",
    status: "critical",
    score: 58,
    headline: "40 servers unreachable — 10 critical alarms active now",
    metrics: [
      { label: "Devices", value: "772", trend: "flat", bad: false },
      { label: "Servers Down", value: "40", trend: "up", bad: true },
      { label: "Critical Alarms", value: "10", trend: "down", bad: true },
      { label: "Apps Down", value: "5", trend: "up", bad: true },
    ],
    actions: [
      { text: "40 servers not responding — escalate to infra team", priority: "critical", page: "observability" },
      { text: "Financial ERP + 1 other business app down", priority: "critical", page: "bizapps" },
      { text: "API Gateway failure affecting 3 dependent services", priority: "high", page: "techapps" },
    ],
  },
  {
    id: "itam",
    label: "IT Asset Management",
    status: "healthy",
    score: 88,
    headline: "12 M365 licenses expiring in 30 days — renewal needed",
    metrics: [
      { label: "M365 Util.", value: "91.6%", trend: "up", bad: false },
      { label: "Entra Users", value: "1,247", trend: "flat", bad: false },
      { label: "Expiring Licenses", value: "12", trend: "up", bad: true },
      { label: "Lifecycle Compliance", value: "94%", trend: "up", bad: false },
    ],
    actions: [
      { text: "12 M365 licenses expire within 30 days", priority: "medium", page: "m365" },
      { text: "23 devices past warranty — replacement planning needed", priority: "low", page: "lifecycle" },
    ],
  },
  {
    id: "optimization",
    label: "FinOps & Cloud Optimization",
    status: "warning",
    score: 65,
    headline: "Azure spend up 8% MoM — $13.9K in January, forecast rising",
    metrics: [
      { label: "Monthly Spend", value: "$13.9K", trend: "up", bad: true },
      { label: "MoM Change", value: "+8%", trend: "up", bad: true },
      { label: "Savings Found", value: "$14.7K", trend: "up", bad: false },
      { label: "CCOE Velocity", value: "82%", trend: "up", bad: false },
    ],
    actions: [
      { text: "Azure costs rose 8% — 3 subscriptions driving spike", priority: "high", page: "finops" },
      { text: "FinOps maturity at 2.4/5 — review improvement plan", priority: "medium", page: "finops-maturity" },
    ],
  },
];

const URGENT_ACTIONS = [
  { domain: "ITOM", text: "40 servers unreachable across production environment", severity: "critical", time: "Active now", page: "observability" },
  { domain: "ITOM", text: "Financial ERP system is DOWN — business impact", severity: "critical", time: "12 min ago", page: "bizapps" },
  { domain: "ITSM", text: "13 P1 incidents breached response SLA this week", severity: "critical", time: "This week", page: "incident" },
  { domain: "ITOM", text: "API Gateway failure — 3 downstream services affected", severity: "high", time: "47 min ago", page: "techapps" },
  { domain: "ITSM", text: "3 recurring problems without root cause assigned", severity: "high", time: "Ongoing", page: "problem" },
  { domain: "FinOps", text: "Azure spend +8% MoM — forecast exceeds budget", severity: "high", time: "Jan 2026", page: "finops" },
  { domain: "ITAM", text: "12 M365 licenses expiring within 30 days", severity: "medium", time: "30 days", page: "m365" },
  { domain: "ITSM", text: "2 emergency changes pending PIR completion", severity: "medium", time: "Overdue", page: "change" },
];

const TRENDS = [
  { label: "SLA Compliance", current: 78, previous: 85, unit: "%", bad: true },
  { label: "MTTR", current: 4.2, previous: 4.5, unit: "hrs", bad: false },
  { label: "Infrastructure Availability", current: 94.8, previous: 99.2, unit: "%", bad: true },
  { label: "Azure Monthly Cost", current: 13921, previous: 12890, unit: "$", bad: true },
  { label: "CSAT Score", current: 4.3, previous: 4.1, unit: "/5", bad: false },
  { label: "Change Success Rate", current: 91, previous: 88, unit: "%", bad: false },
];

const statusColor = (s) => s === "critical" ? "#FF5A65" : s === "warning" || s === "high" ? "#c97b30" : s === "medium" ? "#4a80d0" : s === "low" ? "#a29576" : "#14CA74";
const statusBg = (s) => s === "critical" ? "rgba(255,90,101,0.12)" : s === "warning" || s === "high" ? "rgba(201,123,48,0.12)" : s === "medium" ? "rgba(74,128,208,0.12)" : s === "low" ? "rgba(162,149,116,0.10)" : "rgba(20,202,116,0.10)";
const statusBorder = (s) => s === "critical" ? "rgba(255,90,101,0.3)" : s === "warning" || s === "high" ? "rgba(201,123,48,0.25)" : s === "medium" ? "rgba(74,128,208,0.25)" : s === "low" ? "rgba(162,149,116,0.2)" : "rgba(20,202,116,0.25)";
const statusLabel = (s) => s === "critical" ? "CRITICAL" : s === "warning" ? "NEEDS ATTENTION" : s === "healthy" ? "HEALTHY" : s.toUpperCase();

function HealthScore({ score, status }) {
  const r = 36, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  const clr = statusColor(status);
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" style={{ flexShrink: 0 }}>
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={clr} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      <text x="44" y="40" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700" fontFamily="Rajdhani, sans-serif">{score}</text>
      <text x="44" y="54" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Cairo, sans-serif">/100</text>
    </svg>
  );
}

function PulseDot({ color }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, boxShadow: `0 0 8px ${color}`,
      animation: "pulse 2s infinite",
    }} />
  );
}

function MiniTrend({ current, previous, unit, bad }) {
  const delta = current - previous;
  const pct = previous !== 0 ? ((delta / previous) * 100).toFixed(1) : 0;
  const improving = bad === false;
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
  const color = improving ? "#14CA74" : "#FF5A65";
  const formatted = unit === "$" ? `$${current.toLocaleString()}` : `${current}${unit}`;

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{formatted}</span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{arrow} {Math.abs(pct)}%</span>
    </div>
  );
}

export default function ExecutiveCommandCenter() {
  const [time, setTime] = useState(new Date());
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const critCount = URGENT_ACTIONS.filter(a => a.severity === "critical").length;
  const highCount = URGENT_ACTIONS.filter(a => a.severity === "high").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030F1F",
      color: "#fff",
      fontFamily: "'Cairo', sans-serif",
      overflow: "auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Rajdhani:wght@500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } 
        ::-webkit-scrollbar-track { background: rgba(3,15,31,0.6); }
        ::-webkit-scrollbar-thumb { background: rgba(0,103,193,0.3); border-radius: 4px; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", borderBottom: "1px solid rgba(237,237,237,0.08)",
        background: "rgba(3,9,20,0.97)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.5 }}>
            NPC — IT Operations Command Center
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(20,202,116,0.08)", border: "1px solid rgba(20,202,116,0.2)",
            borderRadius: 6, padding: "4px 10px", fontSize: 10, color: "#14CA74",
          }}>
            <PulseDot color="#14CA74" /> LIVE
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            fontSize: 10, color: "rgba(180,184,188,1)",
            background: "rgba(0,103,193,0.1)", border: "1px solid rgba(237,237,237,0.13)",
            borderRadius: 6, padding: "4px 10px",
          }}>
            {time.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,90,101,0.1)", border: "1px solid rgba(255,90,101,0.25)",
            borderRadius: 6, padding: "4px 10px", fontSize: 10, color: "#FF5A65", fontWeight: 600,
          }}>
            {critCount} Critical · {highCount} High
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Executive Headline ── */}
        <div style={{
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s ease", marginBottom: 28,
        }}>
          <div style={{ fontSize: 11, color: "rgba(162,149,116,0.85)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
            Executive Summary — What Needs Your Attention
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, maxWidth: 800 }}>
            Infrastructure is degraded with 40 servers unreachable and Financial ERP down. ITSM SLA compliance dropped to 78% with 13 P1 breaches this week. Azure costs trending above budget. Asset management is stable.
          </div>
        </div>

        {/* ── Domain Health Cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24,
        }}>
          {DOMAIN_HEALTH.map((d, i) => (
            <div key={d.id} onClick={() => setSelectedDomain(selectedDomain === d.id ? null : d.id)}
              style={{
                background: selectedDomain === d.id
                  ? "linear-gradient(165deg, rgba(0,103,193,0.15) 0%, rgba(5,27,68,0.85) 50%, rgba(0,103,193,0.22) 100%)"
                  : "linear-gradient(165deg, rgba(0,103,193,0.10) 0%, rgba(0,103,193,0.02) 50%, rgba(0,103,193,0.18) 100%)",
                border: `1px solid ${selectedDomain === d.id ? "rgba(162,149,116,0.45)" : "rgba(237,237,237,0.20)"}`,
                borderRadius: 24, padding: "20px 20px 16px", cursor: "pointer",
                backdropFilter: "blur(20px)",
                transition: "all 0.3s ease",
                opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 0.1}s`,
              }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.5)", marginBottom: 4, textTransform: "uppercase" }}>{d.label}</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: statusBg(d.status), border: `1px solid ${statusBorder(d.status)}`,
                    borderRadius: 3, padding: "2px 8px", fontSize: 9, fontWeight: 700,
                    color: statusColor(d.status), letterSpacing: 0.5,
                  }}>
                    <PulseDot color={statusColor(d.status)} />
                    {statusLabel(d.status)}
                  </div>
                </div>
                <HealthScore score={d.score} status={d.status} />
              </div>

              {/* Headline — The "So What" */}
              <div style={{
                fontSize: 12, fontWeight: 600, color: statusColor(d.status),
                lineHeight: 1.4, marginBottom: 14, minHeight: 34,
              }}>
                {d.headline}
              </div>

              {/* Mini Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                {d.metrics.map((m) => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{m.label}</span>
                    <span style={{
                      fontFamily: "Rajdhani, sans-serif", fontSize: 14, fontWeight: 700,
                      color: m.bad ? (m.trend === "up" ? "#FF5A65" : "#c97b30") : "#14CA74",
                    }}>
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Two Column: Actions + Trends ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>

          {/* Left: Urgent Action Queue */}
          <div style={{
            background: "linear-gradient(165deg, rgba(0,103,193,0.10) 0%, rgba(0,103,193,0.02) 50%, rgba(0,103,193,0.18) 100%)",
            border: "1px solid rgba(237,237,237,0.20)", borderRadius: 24,
            padding: 24, backdropFilter: "blur(20px)",
            opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease 0.4s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>
                Action Queue — What Needs Decision or Escalation
              </div>
              <div style={{ fontSize: 10, color: "rgba(180,184,188,1)" }}>{URGENT_ACTIONS.length} items</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {URGENT_ACTIONS.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 14px", borderRadius: 10,
                  background: a.severity === "critical" ? "rgba(255,90,101,0.06)" : "rgba(0,40,100,0.12)",
                  border: `1px solid ${a.severity === "critical" ? "rgba(255,90,101,0.15)" : "rgba(237,237,237,0.08)"}`,
                  cursor: "pointer", transition: "all 0.2s",
                  opacity: loaded ? 1 : 0,
                  animation: loaded ? `slideIn 0.4s ease ${0.5 + i * 0.06}s both` : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = a.severity === "critical" ? "rgba(255,90,101,0.12)" : "rgba(0,103,193,0.15)"; e.currentTarget.style.borderColor = "rgba(237,237,237,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = a.severity === "critical" ? "rgba(255,90,101,0.06)" : "rgba(0,40,100,0.12)"; e.currentTarget.style.borderColor = a.severity === "critical" ? "rgba(255,90,101,0.15)" : "rgba(237,237,237,0.08)"; }}
                >
                  {/* Severity indicator */}
                  <div style={{
                    width: 6, minHeight: 32, borderRadius: 3, flexShrink: 0, marginTop: 2,
                    background: statusColor(a.severity),
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                        color: statusColor(a.severity),
                        background: statusBg(a.severity),
                        border: `1px solid ${statusBorder(a.severity)}`,
                        padding: "1px 6px", borderRadius: 3,
                      }}>
                        {a.severity.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 9, color: "rgba(162,149,116,0.7)", fontWeight: 600 }}>{a.domain}</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{a.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{a.text}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(162,149,116,0.6)", flexShrink: 0, alignSelf: "center" }}>→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Key Trends */}
          <div style={{
            background: "linear-gradient(165deg, rgba(0,103,193,0.10) 0%, rgba(0,103,193,0.02) 50%, rgba(0,103,193,0.18) 100%)",
            border: "1px solid rgba(237,237,237,0.20)", borderRadius: 24,
            padding: 24, backdropFilter: "blur(20px)",
            opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease 0.5s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3, marginBottom: 16 }}>
              Key Trends — Are Things Getting Better or Worse?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {TRENDS.map((t, i) => {
                const delta = t.current - t.previous;
                const improving = t.bad === false;
                const pct = t.previous !== 0 ? Math.abs((delta / t.previous) * 100).toFixed(1) : 0;
                const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
                const color = improving ? "#14CA74" : "#FF5A65";
                const formatted = t.unit === "$" ? `$${t.current.toLocaleString()}` : `${t.current}${t.unit}`;
                const barPct = t.unit === "%" ? t.current : t.unit === "/5" ? (t.current / 5) * 100 : Math.min((t.current / (t.previous * 1.5)) * 100, 100);

                return (
                  <div key={t.label} style={{
                    opacity: loaded ? 1 : 0,
                    animation: loaded ? `fadeUp 0.4s ease ${0.6 + i * 0.08}s both` : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{t.label}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{formatted}</span>
                        <span style={{ fontSize: 10, color, fontWeight: 600 }}>{arrow} {pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: "rgba(0,40,100,0.3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${Math.min(barPct, 100)}%`,
                        background: improving
                          ? "linear-gradient(90deg, #0a5c3a, #14CA74)"
                          : "linear-gradient(90deg, #5a0f22, #FF5A65)",
                        borderRadius: 2, transition: "width 1s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Domain Quick-Nav */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(237,237,237,0.08)" }}>
              <div style={{ fontSize: 10, color: "rgba(162,149,116,0.7)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                Drill Into Domain →
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["ITSM", "ITOM", "ITAM", "FinOps"].map(d => (
                  <div key={d} style={{
                    padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(0,40,100,0.15)", border: "1px solid rgba(237,237,237,0.08)",
                    cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(162,149,116,0.4)"; e.currentTarget.style.color = "#a29576"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(237,237,237,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                  >
                    {d} →
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "20px 18px", fontSize: 11,
          color: "rgba(255,255,255,0.3)", letterSpacing: 1,
          borderTop: "1px solid rgba(237,237,237,0.08)", marginTop: 24,
        }}>
          NPC IT Operations Command Center · Last data refresh: {time.toLocaleTimeString("en-GB")} · Copyright © 2026 Malomatia · RU'YA Platform
        </div>
      </div>
    </div>
  );
}
