import { useState, useEffect, useRef } from "react";
import {
  Package, Truck, MapPin, BarChart2, Settings, HelpCircle,
  Plus, Clock, Wallet, Home, Menu, X, ChevronRight,
  CheckCircle, Circle, AlertCircle, Bell, Star, Copy,
  Download, Upload, Share2, Zap, Shield, Navigation,
  TrendingUp, TrendingDown, RefreshCw, Search, Filter,
  ArrowRight, Phone, MessageCircle, ChevronDown, Moon,
  Sun, LogOut, User, Layers, Activity, DollarSign,
  Award, Target, Eye, MoreHorizontal
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  loginUser,
  fetchShipments,
  createShipment as createShipmentApi,
  fetchTracking,
  fetchPataPoints,
  collectParcel,
  fetchAnalytics,
  fetchAnalyticsVolume
} from "./api.js";

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0A2540",
  green: "#00C853",
  orange: "#FF6D00",
  bg: "#F5F7FA",
  text: "#1A1A2E",
  white: "#FFFFFF",
  darkBg: "#060F1E",
  darkCard: "#0D1F35",
  darkBorder: "#1A3050",
  greenDim: "#00C85320",
  orangeDim: "#FF6D0020",
};

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const MERCHANTS = [
  { id: 1, name: "Zawadi Boutique", type: "Fashion", location: "Westlands", avatar: "ZB" },
  { id: 2, name: "TechZone Kenya", type: "Electronics", location: "CBD", avatar: "TZ" },
  { id: 3, name: "FreshBox Organics", type: "Food", location: "Kilimani", avatar: "FB" },
  { id: 4, name: "PharmaPlus", type: "Pharmacy", location: "Nairobi", avatar: "PP" },
  { id: 5, name: "Jua Kali Supplies", type: "Hardware", location: "Industrial Area", avatar: "JK" },
];

const CUSTOMERS = [
  { name: "Wanjiku Kamau", phone: "+254712345678", geo: "SW-NRB-4829", estate: "Kilimani" },
  { name: "Otieno Ochieng", phone: "+254723456789", geo: "SW-NRB-7731", estate: "South B" },
  { name: "Amina Hassan", phone: "+254734567890", geo: "SW-NRB-2204", estate: "Eastleigh" },
  { name: "Brian Mutuku", phone: "+254745678901", geo: "SW-NRB-5512", estate: "Kasarani" },
  { name: "Faith Njeri", phone: "+254756789012", geo: "SW-NRB-3318", estate: "Westlands" },
  { name: "David Kipchoge", phone: "+254767890123", geo: "SW-NRB-9901", estate: "Karen" },
  { name: "Mercy Akinyi", phone: "+254778901234", geo: "SW-NRB-6643", estate: "Lang'ata" },
  { name: "James Mwangi", phone: "+254789012345", geo: "SW-NRB-1127", estate: "Ruaka" },
];

const STATUSES = ["Picked Up", "In Transit", "At Pata Point", "Delivered", "Failed"];
const STATUS_COLORS = {
  "Picked Up": { bg: "#E3F2FD", text: "#1565C0", dot: "#1976D2" },
  "In Transit": { bg: "#FFF8E1", text: "#F57F17", dot: "#F9A825" },
  "At Pata Point": { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  "Delivered": { bg: "#E8F5E9", text: "#1B5E20", dot: "#00C853" },
  "Failed": { bg: "#FFEBEE", text: "#B71C1C", dot: "#EF5350" },
};

const ACTIVE_DELIVERIES = [
  { id: "SWP-2025-847291", customer: "Wanjiku Kamau", status: "In Transit", eta: "14 min", geo: "SW-NRB-4829", cod: 2400 },
  { id: "SWP-2025-334820", customer: "Otieno Ochieng", status: "Picked Up", eta: "32 min", geo: "SW-NRB-7731", cod: 8500 },
  { id: "SWP-2025-991043", customer: "Amina Hassan", status: "At Pata Point", eta: "Awaiting", geo: "SW-NRB-2204", cod: 1200 },
  { id: "SWP-2025-556677", customer: "Brian Mutuku", status: "Delivered", eta: "Done", geo: "SW-NRB-5512", cod: 4350 },
  { id: "SWP-2025-223344", customer: "Faith Njeri", status: "In Transit", eta: "22 min", geo: "SW-NRB-3318", cod: 15000 },
  { id: "SWP-2025-778899", customer: "David Kipchoge", status: "Picked Up", eta: "45 min", geo: "SW-NRB-9901", cod: 6750 },
];

const VOLUME_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  parcels: Math.floor(80 + Math.random() * 80),
  success: +(94 + Math.random() * 4.5).toFixed(1),
}));

const TIME_DIST = [
  { bucket: "<1hr", count: 42 }, { bucket: "1-2hr", count: 68 },
  { bucket: "2-4hr", count: 24 }, { bucket: "4-8hr", count: 9 }, { bucket: "8hr+", count: 3 },
];
const COD_DATA = [
  { name: "Collected", value: 78, color: C.green },
  { name: "Pending", value: 15, color: C.orange },
  { name: "Failed", value: 7, color: "#EF5350" },
];
const ZONES_DATA = [
  { zone: "Westlands", parcels: 312 }, { zone: "Kilimani", parcels: 287 },
  { zone: "Kasarani", parcels: 245 }, { zone: "South B", parcels: 198 },
  { zone: "Eastleigh", parcels: 176 },
];
const REV_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  revenue: Math.floor(800000 + Math.random() * 600000),
  cost: Math.floor(300000 + Math.random() * 200000),
}));

const PATA_PARCELS = [
  { id: "SWP-2025-112233", customer: "Mercy Akinyi", phone: "+254778901234", arrived: "09:42 AM", pin: "7823", collected: false },
  { id: "SWP-2025-445566", customer: "James Mwangi", phone: "+254789012345", arrived: "10:15 AM", pin: "4491", collected: false },
  { id: "SWP-2025-667788", customer: "Zara Abdullahi", phone: "+254701234567", arrived: "11:03 AM", pin: "2267", collected: false },
];
const PATA_DONE = [
  { id: "SWP-2025-001122", customer: "Peter Kamau", time: "08:30 AM", commission: 20 },
  { id: "SWP-2025-003344", customer: "Grace Wanjiru", time: "08:55 AM", commission: 15 },
  { id: "SWP-2025-005566", customer: "Hassan Abdi", time: "09:20 AM", commission: 25 },
  { id: "SWP-2025-007788", customer: "Lucy Muthoni", time: "09:38 AM", commission: 20 },
];

const TESTIMONIALS = [
  { name: "Zawadi Ouma", biz: "Zawadi Boutique", estate: "Westlands", rating: 5, quote: "Went from 35% failed deliveries to under 3%. My customers keep coming back now because they actually receive their orders.", metric: "Failure rate: 35% → 2.8%" },
  { name: "Kevin Njoroge", biz: "TechZone Kenya", estate: "CBD", rating: 5, quote: "The COD escrow is a game changer. Zero cash fraud since we switched. The dashboard alone is worth every shilling.", metric: "COD fraud: eliminated" },
  { name: "Amani Waweru", biz: "FreshBox Organics", estate: "Kilimani", rating: 5, quote: "90-minute delivery for fresh produce was impossible before SwiftPath. Now it's our daily reality.", metric: "Avg delivery: 87 min" },
];

// ─────────────────────────────────────────────────────────────
// GLOBAL STATE / APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [dark, setDark] = useState(true);
  const [trackCode, setTrackCode] = useState("");
  const [auth, setAuth] = useState({ user: null, token: null });
  const [authForm, setAuthForm] = useState({ email: "merchant@swiftpath.ke", password: "password123" });
  const [authError, setAuthError] = useState("");
  const [shipments, setShipments] = useState(ACTIVE_DELIVERIES);
  const [pataPoints, setPataPoints] = useState(PATA_PARCELS);
  const [analyticsData, setAnalyticsData] = useState({
    summary: { totalParcels: 1032, successRate: 98.2, avgDeliveryTime: 87, revenue: 309600, codCollected: 2100000, failedDeliveries: 19 },
    volume: VOLUME_DATA,
    zones: ZONES_DATA,
    revenue: REV_DATA,
  });
  const [trackResult, setTrackResult] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = (p) => {
    if (["dashboard", "create", "analytics", "patapoint"].includes(p) && !auth?.user) {
      setPage("dashboard");
    } else {
      setPage(p);
    }
    window.scrollTo(0, 0);
  };

  const loadAppData = async (token) => {
    setBusy(true);
    try {
      const [shipmentList, pataList, analytics] = await Promise.all([
        fetchShipments(token),
        fetchPataPoints(token),
        fetchAnalytics(token),
      ]);
      setShipments(shipmentList);
      setPataPoints(pataList);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Could not load app data:", error);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("swiftpath_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          setAuth(parsed);
          loadAppData(parsed.token);
        }
      } catch (error) {
        console.warn("Invalid saved auth state", error);
      }
    }
  }, []);

  const handleLogin = async () => {
    setAuthError("");
    setBusy(true);
    try {
      const { user, token } = await loginUser(authForm.email, authForm.password);
      const saved = { user, token };
      setAuth(saved);
      localStorage.setItem("swiftpath_auth", JSON.stringify(saved));
      await loadAppData(token);
      setPage("dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("swiftpath_auth");
    setAuth({ user: null, token: null });
    setPage("landing");
    setShipments(ACTIVE_DELIVERIES);
    setPataPoints(PATA_PARCELS);
    setAnalyticsData({
      summary: { totalParcels: 1032, successRate: 98.2, avgDeliveryTime: 87, revenue: 309600, codCollected: 2100000, failedDeliveries: 19 },
      volume: VOLUME_DATA,
      zones: ZONES_DATA,
      revenue: REV_DATA,
    });
  };

  const theme = {
    dark,
    bg: dark ? C.darkBg : C.bg,
    card: dark ? C.darkCard : C.white,
    border: dark ? C.darkBorder : "#E2E8F0",
    text: dark ? "#E8EEF4" : C.text,
    sub: dark ? "#7A9BB5" : "#64748B",
    navy: dark ? "#0D1F35" : C.navy,
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.green}40; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.15)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dotMove { 0%{transform:translate(0,0)} 25%{transform:translate(8px,-6px)} 50%{transform:translate(14px,2px)} 75%{transform:translate(6px,8px)} 100%{transform:translate(0,0)} }
        .fade-in { animation: fadeIn .4s ease both; }
        .slide-in { animation: slideIn .35s ease both; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .ticker-wrap { overflow:hidden; white-space:nowrap; }
        .ticker-inner { display:inline-block; animation:ticker 25s linear infinite; }
        input,select,textarea { outline:none; font-family:inherit; }
        button { cursor:pointer; font-family:inherit; border:none; }
      `}</style>

      {page === "landing" && <Landing nav={nav} theme={theme} dark={dark} setDark={setDark} />}
      {page === "dashboard" && <Dashboard nav={nav} theme={theme} dark={dark} setDark={setDark} auth={auth} authForm={authForm} setAuthForm={setAuthForm} authError={authError} onLogin={handleLogin} onLogout={handleLogout} shipments={shipments} busy={busy} />}
      {page === "create" && <CreateShipment nav={nav} theme={theme} dark={dark} auth={auth} createShipmentApi={createShipmentApi} onRefresh={loadAppData} busy={busy} />}
      {page === "track" && <TrackParcel nav={nav} theme={theme} dark={dark} code={trackCode} onTrack={fetchTracking} trackResult={trackResult} setTrackResult={setTrackResult} trackingError={trackingError} setTrackingError={setTrackingError} />}
      {page === "patapoint" && <PataPointPortal nav={nav} theme={theme} dark={dark} auth={auth} pataPoints={pataPoints} onCollect={collectParcel} busy={busy} />}
      {page === "analytics" && <Analytics nav={nav} theme={theme} dark={dark} setDark={setDark} auth={auth} analyticsData={analyticsData} busy={busy} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────
function Landing({ nav, theme, dark, setDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coverageQuery, setCoverageQuery] = useState("");

  return (
    <div>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(6,15,30,.95)" : "rgba(255,255,255,.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${theme.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.green}, #00E676)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Navigation size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: theme.text }}>Swift<span style={{ color: C.green }}>Path</span></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn variant="ghost" small onClick={() => nav("track")} theme={theme}>Track</Btn>
          <Btn variant="ghost" small onClick={() => nav("patapoint")} theme={theme}>Pata Point</Btn>
          <Btn variant="outlined" small onClick={() => nav("dashboard")} theme={theme}>Merchant Login</Btn>
          <Btn variant="primary" small onClick={() => nav("dashboard")} theme={theme}>Start Shipping</Btn>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: theme.sub, display: "flex", alignItems: "center" }}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "60px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ flex: 1, maxWidth: 580, zIndex: 2 }} className="fade-in">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.greenDim, border: `1px solid ${C.green}40`, borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Live across Nairobi</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,5vw,58px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 20, color: theme.text }}>
            Kenya's Last-Mile<br />
            Delivery,{" "}
            <span style={{ color: C.green, position: "relative" }}>Finally Fixed</span>
            <span style={{ color: C.orange }}>.</span>
          </h1>
          <p style={{ fontSize: 18, color: theme.sub, lineHeight: 1.7, marginBottom: 36 }}>
            Geo-addressed. Electric-fleet powered.<br />Delivered in <strong style={{ color: theme.text }}>90 minutes.</strong>
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            <Btn variant="primary" onClick={() => nav("dashboard")} theme={theme} large>
              Start Shipping <ArrowRight size={16} />
            </Btn>
            <Btn variant="outlined" onClick={() => nav("track")} theme={theme} large>
              Track a Package
            </Btn>
          </div>
          {/* Stats Ticker */}
          <div style={{ background: dark ? "#0D1F35" : "#F0FDF4", border: `1px solid ${C.green}30`, borderRadius: 12, padding: "12px 16px", overflow: "hidden" }}>
            <div className="ticker-wrap">
              <div className="ticker-inner" style={{ fontSize: 13, color: theme.sub }}>
                {[
                  "📦 12,847 parcels delivered today",
                  "✅ 98.2% success rate",
                  "📍 2,000 Pata Points nationwide",
                  "⚡ 87min average delivery",
                  "🛵 Electric fleet · Zero emissions",
                  "💚 KES 0 COD fraud this month",
                  "📦 12,847 parcels delivered today",
                  "✅ 98.2% success rate",
                  "📍 2,000 Pata Points nationwide",
                  "⚡ 87min average delivery",
                ].join("   ·   ")}
              </div>
            </div>
          </div>
        </div>

        {/* HERO MAP VISUAL */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          <NairobiMapVisual dark={dark} />
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section style={{ background: dark ? "#080E1A" : C.navy, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>
            30–40% of deliveries in Kenya fail.
            <span style={{ color: C.green }}> Not anymore.</span>
          </h2>
          <p style={{ color: "#7A9BB5", fontSize: 17, marginBottom: 52 }}>Three structural problems. Three SwiftPath solutions.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {[
              { icon: <MapPin size={28} color={C.orange} />, problem: "No street addressing", solution: "SwiftPath Geo-Grid assigns every plot a unique code. Deliveries always find the door.", tag: "Geo-Grid" },
              { icon: <Package size={28} color={C.orange} />, problem: "Failed deliveries waste your money", solution: "2,000 Pata Points mean customers collect from a trusted nearby agent. Zero wasted trips.", tag: "Pata Points" },
              { icon: <Zap size={28} color={C.orange} />, problem: "Petrol fleet kills margins", solution: "100% electric motorcycle fleet at KES 2/km vs KES 12/km petrol. Lower cost, zero emissions.", tag: "Electric Fleet" },
            ].map((item, i) => (
              <div key={i} className="fade-in" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 28, textAlign: "left", animationDelay: `${i * .1}s` }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.orangeDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{item.tag}</div>
                <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: 10, fontSize: 17 }}>❌ {item.problem}</h3>
                <p style={{ color: "#7A9BB5", lineHeight: 1.6, fontSize: 14 }}>✓ {item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: theme.text, marginBottom: 12 }}>How SwiftPath Works</h2>
          <p style={{ color: theme.sub, fontSize: 16 }}>Four steps. 90 minutes. Done.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0, position: "relative" }}>
          {[
            { n: "01", icon: <Plus size={24} />, title: "Merchant Creates Order", desc: "List your parcel on the SwiftPath dashboard in under 60 seconds" },
            { n: "02", icon: <MapPin size={24} />, title: "Geo-Address Assigned", desc: "AI assigns a unique SW-NRB code to the customer's exact location" },
            { n: "03", icon: <Truck size={24} />, title: "Rider Picks Up", desc: "Electric rider collects from sorting hub and heads to customer" },
            { n: "04", icon: <CheckCircle size={24} />, title: "Delivered ✓", desc: "To the door or Pata Point — confirmed via M-Pesa COD escrow" },
          ].map((step, i) => (
            <div key={i} style={{ padding: "28px 24px", position: "relative", textAlign: "center" }}>
              {i < 3 && <div style={{ position: "absolute", top: 52, right: -1, width: "100%", height: 2, background: `linear-gradient(90deg,${C.green}40,transparent)`, zIndex: 0 }} />}
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${C.navy},${C.green}40)`, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", position: "relative", zIndex: 1, color: C.green }}>
                {step.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: 2, marginBottom: 8 }}>STEP {step.n}</div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: theme.sub, fontSize: 13, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: "80px 24px", background: dark ? "#07101E" : "#F0FDF4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: theme.text, marginBottom: 12 }}>Built for Kenya. Built to Last.</h2>
            <p style={{ color: theme.sub, fontSize: 16 }}>Every feature engineered for how commerce actually works here.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {[
              { icon: <Layers size={22} />, title: "SwiftPath Geo-Grid", desc: "Every plot in Kenya mapped with a unique 4-digit code. Deliveries never get lost again.", color: C.green },
              { icon: <MapPin size={22} />, title: "Pata Points Network", desc: "2,000 community collection points in pharmacies, dukas, and M-Pesa agents countrywide.", color: C.green },
              { icon: <Zap size={22} />, title: "Electric Fleet", desc: "Zero emissions. KES 2/km charging vs KES 12/km petrol. Your lower prices fund our edge.", color: C.orange },
              { icon: <Navigation size={22} />, title: "AI Route Optimization", desc: "Our routing engine accounts for Nairobi traffic in real time. 90-minute delivery window, guaranteed.", color: C.green },
              { icon: <Shield size={22} />, title: "M-Pesa COD Escrow", desc: "Customer pays via M-Pesa. Funds held 24 hours. Auto-release to merchant. Zero cash fraud.", color: C.orange },
              { icon: <BarChart2 size={22} />, title: "Merchant SaaS Dashboard", desc: "Every parcel, every shilling, real time. COD reconciliation, analytics, bulk CSV upload.", color: C.green },
            ].map((f, i) => (
              <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, transition: "transform .2s", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: theme.sub, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE MAP SECTION */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: theme.text, marginBottom: 16 }}>Covering All of Nairobi</h2>
            <p style={{ color: theme.sub, fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>From Westlands to Rongai, Kasarani to Karen — our electric fleet and Pata Points network covers every corner of Nairobi and expanding.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              {["Westlands","Kilimani","Kasarani","South B","Karen","Eastleigh","Lang'ata","Rongai","Ruaka","Thika Rd"].map(e => (
                <span key={e} style={{ background: C.greenDim, color: C.green, padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 500 }}>{e}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={coverageQuery} onChange={e => setCoverageQuery(e.target.value)} placeholder="Enter your estate..." style={{ flex: 1, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 14 }} />
              <Btn variant="primary" theme={theme} onClick={() => {}}>Check</Btn>
            </div>
            {coverageQuery.length > 2 && <p style={{ color: C.green, fontSize: 13, marginTop: 8 }}>✓ We deliver to {coverageQuery}! Start shipping today.</p>}
          </div>
          <CoverageMapSVG dark={dark} />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 24px", background: dark ? "#07101E" : "#F8FAFC" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: theme.text, marginBottom: 12 }}>Merchants Love SwiftPath</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={16} fill={C.orange} color={C.orange} />)}
                </div>
                <p style={{ color: theme.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${C.navy},${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{t.name[0]}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{t.name}</div><div style={{ fontSize: 12, color: theme.sub }}>{t.biz}</div></div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.green, background: C.greenDim, padding: "4px 10px", borderRadius: 100 }}>{t.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: theme.text, marginBottom: 12 }}>Simple, Transparent Pricing</h2>
          <p style={{ color: theme.sub }}>SaaS platform free for merchants shipping 100+ parcels/month</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, maxWidth: 820, margin: "0 auto" }}>
          {[
            { tier: "Standard", time: "24 hours", price: "150", desc: "Reliable next-day delivery across Nairobi", featured: false },
            { tier: "Express", time: "Same-day, 6hrs", price: "300", desc: "Our most popular tier — delivered today", featured: true },
            { tier: "Premium", time: "2 hours", price: "450", desc: "Urgent deliveries, guaranteed 2-hour window", featured: false },
          ].map((p, i) => (
            <div key={i} style={{ background: p.featured ? `linear-gradient(135deg,${C.navy},#0D3060)` : theme.card, border: p.featured ? `2px solid ${C.green}` : `1px solid ${theme.border}`, borderRadius: 20, padding: 28, position: "relative" }}>
              {p.featured && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.green, color: C.navy, fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 100, letterSpacing: 1 }}>MOST POPULAR</div>}
              <div style={{ fontSize: 13, fontWeight: 600, color: p.featured ? C.green : theme.sub, marginBottom: 8 }}>{p.tier}</div>
              <div style={{ fontSize: 13, color: p.featured ? "#7ABBD4" : theme.sub, marginBottom: 16 }}>⏱ {p.time}</div>
              <div style={{ fontSize: 42, fontWeight: 700, color: p.featured ? "#fff" : theme.text, marginBottom: 4 }}>KES {p.price}</div>
              <div style={{ fontSize: 13, color: p.featured ? "#7ABBD4" : theme.sub, marginBottom: 20 }}>per parcel</div>
              <p style={{ fontSize: 13, color: p.featured ? "#A8C8E0" : theme.sub, lineHeight: 1.6, marginBottom: 24 }}>{p.desc}</p>
              <Btn variant={p.featured ? "primary" : "outlined"} theme={theme} onClick={() => nav("dashboard")} style={{ width: "100%" }}>Get Started</Btn>
            </div>
          ))}
        </div>
      </section>

      {/* PATA POINT CTA */}
      <section style={{ padding: "80px 24px", background: `linear-gradient(135deg,${C.navy} 0%,#0D3060 100%)` }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
          <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>Earn Extra Income.<br />Become a Pata Point.</h2>
          <p style={{ color: "#7ABBD4", fontSize: 17, lineHeight: 1.7, marginBottom: 12 }}>Already running a duka, pharmacy, or M-Pesa business?</p>
          <p style={{ color: "#A8C8E0", fontSize: 16, marginBottom: 36 }}>Earn <strong style={{ color: C.green }}>KES 10–30 per parcel</strong> collected at your shop. No new equipment needed. Just a shelf and a willingness to help your community.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn variant="primary" theme={theme} large onClick={() => nav("patapoint")}>Register as a Pata Point Agent</Btn>
            <Btn variant="ghost" theme={theme} large onClick={() => {}}>Learn More</Btn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: dark ? "#03080F" : "#0A2540", padding: "48px 24px 24px", color: "#7A9BB5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Navigation size={16} color="#fff" /></div>
                <span style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>Swift<span style={{ color: C.green }}>Path</span></span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>Delivered. Every Time. Nairobi's most reliable last-mile logistics platform.</p>
            </div>
            {[
              { title: "Product", links: ["Dashboard", "Tracking", "Pata Points", "API Docs", "Pricing"] },
              { title: "Company", links: ["About", "Careers", "Press", "Contact", "Blog"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy", "Compliance"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, color: "#fff", marginBottom: 16, fontSize: 14 }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color .15s" }}
                  onMouseEnter={e => e.target.style.color = C.green} onMouseLeave={e => e.target.style.color = "#7A9BB5"}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13 }}>Nairobi, Kenya 🇰🇪 · © 2025 SwiftPath Logistics</span>
            <span style={{ fontSize: 13 }}>Built with ⚡ for Kenya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MERCHANT DASHBOARD
// ─────────────────────────────────────────────────────────────
function Dashboard({ nav, theme, dark, setDark, auth, authForm, setAuthForm, authError, onLogin, onLogout, shipments, busy }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!auth?.user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: theme.bg }}>
        <div style={{ width: "100%", maxWidth: 460, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16, color: theme.text }}>Merchant Login</h2>
          <p style={{ color: theme.sub, marginBottom: 24 }}>Sign in to access your SwiftPath dashboard and shipments.</p>
          <div style={{ display: "grid", gap: 14 }}>
            <input value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" style={{ width: "100%", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "12px 14px", color: theme.text, fontSize: 14 }} />
            <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" style={{ width: "100%", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "12px 14px", color: theme.text, fontSize: 14 }} />
            {authError && <div style={{ color: C.orange, fontSize: 13 }}>{authError}</div>}
            <Btn variant="primary" theme={theme} onClick={onLogin} large disabled={busy}>{busy ? "Signing in…" : "Sign In"}</Btn>
            <div style={{ fontSize: 13, color: theme.sub }}>Use merchant@swiftpath.ke / password123</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ fontSize: 13, color: theme.sub }}>Not a merchant yet?</span>
              <button onClick={() => nav("landing")} style={{ background: "transparent", border: "none", color: C.green, fontWeight: 700, cursor: "pointer" }}>Back to home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { id: "create", icon: <Plus size={18} />, label: "New Shipment", action: () => nav("create") },
    { id: "active", icon: <Truck size={18} />, label: "Active Deliveries", action: () => nav("track") },
    { id: "history", icon: <Clock size={18} />, label: "Delivery History", action: () => nav("track") },
    { id: "payments", icon: <Wallet size={18} />, label: "COD & Payments" },
    { id: "patapoints", icon: <MapPin size={18} />, label: "Pata Points", action: () => nav("patapoint") },
    { id: "analytics", icon: <BarChart2 size={18} />, label: "Analytics", action: () => nav("analytics") },
    { id: "settings", icon: <Settings size={18} />, label: "Settings" },
    { id: "help", icon: <HelpCircle size={18} />, label: "Help" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? 220 : 64, background: dark ? "#060F1E" : C.navy, transition: "width .25s ease", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>Swift<span style={{ color: C.green }}>Path</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#7A9BB5", cursor: "pointer", padding: 4, display: "flex" }}>
            <Menu size={18} />
          </button>
        </div>
        <div style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => item.action ? item.action() : setActivePage(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: activePage === item.id ? C.greenDim : "transparent", color: activePage === item.id ? C.green : "#7A9BB5", transition: "all .15s", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.background = activePage === item.id ? C.greenDim : "rgba(255,255,255,.04)"}
              onMouseLeave={e => e.currentTarget.style.background = activePage === item.id ? C.greenDim : "transparent"}>
              {item.icon}
              {sidebarOpen && <span style={{ fontSize: 14, fontWeight: activePage === item.id ? 600 : 400 }}>{item.label}</span>}
            </div>
          ))}
        </div>
        {sidebarOpen && (
          <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.green},#00E676)`, display: "flex", alignItems: "center", justifyContent: "center", color: C.navy, fontWeight: 700, fontSize: 13 }}>ZB</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Zawadi Boutique</div><div style={{ fontSize: 11, color: "#7A9BB5" }}>zawadi@swiftpath.ke</div></div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* TOP BAR */}
        <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => nav("landing")} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 10px", color: theme.sub, cursor: "pointer", fontSize: 13 }}>
              ← Home
            </button>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.text }}>Merchant Dashboard</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: theme.sub }}>Tue, 19 May 2025</span>
            <button style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 8, padding: "6px 12px", color: C.green, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} /> Live
            </button>
            <button onClick={() => setDark(!dark)} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 10px", color: theme.sub, cursor: "pointer" }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Bell size={18} color={theme.sub} style={{ cursor: "pointer" }} />
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* KPI CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Today's Parcels", value: "147", delta: "+12%", deltaUp: true, icon: <Package size={20} />, color: C.green },
              { label: "Success Rate", value: "98.2%", delta: "↑ 2.1% this week", deltaUp: true, icon: <Target size={20} />, color: C.green },
              { label: "COD Pending", value: "KES 34,500", delta: "Settles in 6 hrs", deltaUp: null, icon: <Wallet size={20} />, color: C.orange },
              { label: "Avg Delivery Time", value: "87 min", delta: "Target: 90 min ✓", deltaUp: true, icon: <Clock size={20} />, color: C.green },
            ].map((k, i) => (
              <div key={i} className="fade-in" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20, animationDelay: `${i*.07}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: theme.sub, fontWeight: 500 }}>{k.label}</span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: k.color }}>{k.icon}</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: k.deltaUp === true ? C.green : k.deltaUp === false ? "#EF5350" : theme.sub, fontWeight: 500 }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* MAIN 2-COL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* MAP */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: theme.text }}>Live Delivery Map</span>
                  <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>● 23 active riders</span>
                </div>
                <DashboardMapSVG dark={dark} />
              </div>

              {/* ACTIVE DELIVERIES TABLE */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16 }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: theme.text }}>Active Deliveries</span>
                  <Btn variant="ghost" small theme={theme} onClick={() => nav("track")}>View All</Btn>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: dark ? "#0A1A2E" : "#F8FAFC" }}>
                        {["Order ID", "Customer", "Status", "ETA", "Geo-Address", "COD"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: theme.sub, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map((d, i) => {
                        const sc = STATUS_COLORS[d.status] || { bg: theme.border, text: theme.text };
                        const customerName = typeof d.customer === "string" ? d.customer : d.customer?.name || "Customer";
                        const geoAddress = typeof d.customer === "string" ? d.geo : d.customer?.geoAddress || "-";
                        return (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}
                            onMouseEnter={e => e.currentTarget.style.background = dark ? "#0A1A2E" : "#F8FAFC"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "12px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: C.green }}>{d.id?.slice(-6)}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: theme.text, fontWeight: 500 }}>{customerName}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 }}>{d.status}</span>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: theme.sub }}>{d.eta || "Pending"}</td>
                            <td style={{ padding: "12px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: theme.sub }}>{geoAddress}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: theme.text }}>KES {Number(d.codAmount || d.cod || 0).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* QUICK ACTIONS */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, color: theme.text, marginBottom: 16 }}>Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Btn variant="primary" theme={theme} onClick={() => nav("create")} style={{ justifyContent: "flex-start", gap: 10 }}><Plus size={16} /> Create New Shipment</Btn>
                  <Btn variant="outlined" theme={theme} onClick={() => {}} style={{ justifyContent: "flex-start", gap: 10 }}><Download size={16} /> Download COD Report</Btn>
                  <Btn variant="outlined" theme={theme} onClick={() => {}} style={{ justifyContent: "flex-start", gap: 10 }}><Upload size={16} /> Bulk Upload (CSV)</Btn>
                </div>
              </div>

              {/* MINI CHART */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, color: theme.text, marginBottom: 16 }}>This Week</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={VOLUME_DATA.slice(-7)}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1A3050" : "#E2E8F0"} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: theme.sub }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12 }} />
                    <Area type="monotone" dataKey="parcels" stroke={C.green} fill="url(#greenGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* ACTIVITY FEED */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20, flex: 1 }}>
                <div style={{ fontWeight: 600, color: theme.text, marginBottom: 16 }}>Recent Activity</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { event: "SWP-847291 delivered", time: "2 min ago", type: "success" },
                    { event: "COD KES 8,500 collected", time: "8 min ago", type: "payment" },
                    { event: "SWP-334820 picked up", time: "15 min ago", type: "info" },
                    { event: "New order created", time: "22 min ago", type: "new" },
                    { event: "SWP-991043 at Pata Point", time: "31 min ago", type: "pata" },
                    { event: "COD KES 4,350 settled", time: "45 min ago", type: "payment" },
                    { event: "SWP-556677 delivered", time: "1 hr ago", type: "success" },
                  ].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 6 ? `1px solid ${theme.border}` : "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: a.type === "success" ? C.green : a.type === "payment" ? C.orange : a.type === "pata" ? "#9C27B0" : "#1976D2" }} />
                      <span style={{ fontSize: 13, color: theme.text, flex: 1 }}>{a.event}</span>
                      <span style={{ fontSize: 11, color: theme.sub, whiteSpace: "nowrap" }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CREATE SHIPMENT WIZARD
// ─────────────────────────────────────────────────────────────
function CreateShipment({ nav, theme, dark, auth, createShipmentApi, onRefresh, busy }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", geo: "", estate: "", pref: "door", item: "", category: "Fashion", weight: 1, fragile: false, highValue: false, value: "", tier: "express", payment: "cod", notes: "", schedule: "now" });
  const [done, setDone] = useState(false);
  const [createdShipmentId, setCreatedShipmentId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [creating, setCreating] = useState(false);

  if (!auth?.user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: theme.bg }}>
        <div style={{ width: "100%", maxWidth: 520, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, color: theme.text, marginBottom: 14 }}>Sign in to create a shipment</h2>
          <p style={{ color: theme.sub, marginBottom: 24 }}>Please log in from the dashboard before creating a shipment.</p>
          <Btn variant="primary" theme={theme} onClick={() => nav("dashboard")} large>Go to Dashboard</Btn>
        </div>
      </div>
    );
  }

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submitShipment = async () => {
    setSubmitError("");
    setCreating(true);
    try {
      const payload = {
        customer: {
          name: form.name,
          phone: form.phone,
          geoAddress: form.geo,
          estate: form.estate,
        },
        parcel: {
          description: form.item,
          category: form.category,
          weight: form.weight,
          value: Number(form.value || 0),
          fragile: form.fragile,
          highValue: form.highValue,
        },
        serviceTier: form.tier,
        paymentMethod: form.payment,
      };
      const response = await createShipmentApi(auth.token, payload);
      setCreatedShipmentId(response.id);
      setDone(true);
      await onRefresh(auth.token);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setCreating(false);
    }
  };
  const TIERS = [
    { id: "standard", label: "Standard", time: "24 hours", price: 150, desc: "Reliable next-day" },
    { id: "express", label: "Express", time: "Same-day, 6hrs", price: 300, desc: "Most popular" },
    { id: "premium", label: "Premium", time: "2 hours", price: 450, desc: "Urgent" },
  ];

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-in" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 48, maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <CheckCircle size={36} color={C.green} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Shipment Created!</h2>
        <p style={{ color: theme.sub, marginBottom: 28 }}>Your rider is being assigned. Track your parcel below.</p>
        <div style={{ background: dark ? "#0A1A2E" : "#F0FDF4", border: `1px solid ${C.green}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6 }}>TRACKING NUMBER</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: C.green, letterSpacing: 2 }}>{createdShipmentId || "SWP-2025-000000"}</div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn variant="primary" theme={theme} onClick={() => nav("track")}><Eye size={16} /> Track Package</Btn>
          <Btn variant="outlined" theme={theme} onClick={() => { setDone(false); setStep(1); }}><Plus size={16} /> New Shipment</Btn>
          <Btn variant="ghost" theme={theme} onClick={() => nav("dashboard")}><Home size={16} /> Dashboard</Btn>
        </div>
      </div>
    </div>
  );

  const steps = ["Customer Details", "Parcel Info", "Delivery Options", "Review & Confirm"];

  return (
    <div style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <button onClick={() => nav("dashboard")} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: theme.sub, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>Create Shipment</h1>
            <p style={{ fontSize: 13, color: theme.sub }}>Swift<span style={{ color: C.green }}>Path</span> Logistics</p>
          </div>
        </div>

        {/* PROGRESS */}
        <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: step > i ? C.green : theme.border }} />}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: step > i + 1 ? C.green : step === i + 1 ? C.navy : theme.border, border: step === i + 1 ? `2px solid ${C.green}` : "none", display: "flex", alignItems: "center", justifyContent: "center", color: step > i + 1 ? "#fff" : step === i + 1 ? C.green : theme.sub, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? C.green : theme.border }} />}
              </div>
              <span style={{ fontSize: 11, color: step === i + 1 ? C.green : theme.sub, fontWeight: step === i + 1 ? 600 : 400, textAlign: "center" }}>{s}</span>
            </div>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div className="fade-in" style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32 }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 24 }}>Customer Details</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <FormField label="Customer Name" value={form.name} onChange={v => up("name", v)} placeholder="Wanjiku Kamau" theme={theme} />
                <FormField label="Phone Number" value={form.phone} onChange={v => up("phone", v.startsWith("+254") ? v : "+254")} placeholder="+254712345678" theme={theme} />
                <FormField label="SwiftPath Geo-Address" value={form.geo} onChange={v => up("geo", v)} placeholder="SW-NRB-4829 (auto-assigned on first delivery)" theme={theme} />
                <FormField label="Estate / Area" value={form.estate} onChange={v => up("estate", v)} placeholder="e.g. Kilimani, South B, Kasarani" theme={theme} />
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: theme.sub, display: "block", marginBottom: 8 }}>Delivery Preference</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[{ id: "door", label: "🚪 Door Delivery", desc: "Rider delivers to address" }, { id: "pata", label: "📍 Pata Point", desc: "Customer collects nearby" }].map(opt => (
                      <div key={opt.id} onClick={() => up("pref", opt.id)} style={{ border: `2px solid ${form.pref === opt.id ? C.green : theme.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", background: form.pref === opt.id ? C.greenDim : "transparent" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: theme.text, marginBottom: 4 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: theme.sub }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 24 }}>Parcel Details</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <FormField label="Item Description" value={form.item} onChange={v => up("item", v)} placeholder="e.g. Ladies dress, Samsung phone charger" theme={theme} />
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: theme.sub, display: "block", marginBottom: 8 }}>Category</label>
                  <select value={form.category} onChange={e => up("category", e.target.value)} style={{ width: "100%", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 14 }}>
                    {["Fashion", "Electronics", "Food", "Documents", "Household", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: theme.sub, display: "block", marginBottom: 8 }}>Weight: <strong style={{ color: theme.text }}>{form.weight} kg</strong></label>
                  <input type="range" min={0.1} max={30} step={0.1} value={form.weight} onChange={e => up("weight", +e.target.value)} style={{ width: "100%", accentColor: C.green }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: theme.sub, marginTop: 4 }}><span>0.1 kg</span><span>30 kg</span></div>
                </div>
                <FormField label="Parcel Value (KES) — for COD" value={form.value} onChange={v => up("value", v)} placeholder="e.g. 2400" theme={theme} type="number" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[{ key: "fragile", label: "🥚 Fragile Item", desc: "Handle with care" }, { key: "highValue", label: "💎 High Value", desc: "Additional insurance" }].map(t => (
                    <div key={t.key} onClick={() => up(t.key, !form[t.key])} style={{ border: `2px solid ${form[t.key] ? C.orange : theme.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", background: form[t.key] ? C.orangeDim : "transparent" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: theme.sub }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 24 }}>Delivery Options</h2>
              <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
                {TIERS.map(t => (
                  <div key={t.id} onClick={() => up("tier", t.id)} style={{ border: `2px solid ${form.tier === t.id ? C.green : theme.border}`, borderRadius: 14, padding: "16px 20px", cursor: "pointer", background: form.tier === t.id ? C.greenDim : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{t.label}</div>
                      <div style={{ fontSize: 13, color: theme.sub }}>⏱ {t.time} · {t.desc}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: form.tier === t.id ? C.green : theme.text }}>KES {t.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: theme.sub, display: "block", marginBottom: 10 }}>Payment Method</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[{ id: "cod", label: "M-Pesa COD" }, { id: "prepaid", label: "Wallet" }, { id: "invoice", label: "Invoice" }].map(p => (
                    <div key={p.id} onClick={() => up("payment", p.id)} style={{ border: `2px solid ${form.payment === p.id ? C.green : theme.border}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "center", background: form.payment === p.id ? C.greenDim : "transparent" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: form.payment === p.id ? C.green : theme.text }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <FormField label="Special Instructions (optional)" value={form.notes} onChange={v => up("notes", v)} placeholder="e.g. Call before delivery, fragile side up" theme={theme} multiline />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 24 }}>Review & Confirm</h2>
              <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Customer", value: form.name || "Wanjiku Kamau" },
                  { label: "Phone", value: form.phone || "+254712345678" },
                  { label: "Estate", value: form.estate || "Kilimani" },
                  { label: "Item", value: form.item || "Fashion item" },
                  { label: "Weight", value: `${form.weight} kg` },
                  { label: "Service Tier", value: TIERS.find(t => t.id === form.tier)?.label || "Express" },
                  { label: "Payment", value: form.payment === "cod" ? "M-Pesa COD" : form.payment },
                  { label: "COD Value", value: form.value ? `KES ${Number(form.value).toLocaleString()}` : "KES 0" },
                  { label: "Delivery Fee", value: `KES ${TIERS.find(t => t.id === form.tier)?.price || 300}` },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: 13, color: theme.sub }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0" }}>
                  <span style={{ fontWeight: 700, color: theme.text }}>Estimated Delivery</span>
                  <span style={{ fontWeight: 700, color: C.green }}>{TIERS.find(t => t.id === form.tier)?.time}</span>
                </div>
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <Btn variant="outlined" theme={theme} onClick={() => step > 1 ? setStep(s => s - 1) : nav("dashboard")}>
              {step > 1 ? "← Back" : "Cancel"}
            </Btn>
            <Btn variant="primary" theme={theme} onClick={() => step < 4 ? setStep(s => s + 1) : submitShipment()} large disabled={creating}>
              {step === 4 ? creating ? "Creating…" : "Confirm & Create Shipment ✓" : `Next: ${steps[step]} →`}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIVE TRACKING PAGE
// ─────────────────────────────────────────────────────────────
function TrackParcel({ nav, theme, dark, code: initialCode, onTrack, trackResult, setTrackResult, trackingError, setTrackingError }) {
  const [code, setCode] = useState(initialCode || "SWP-2025-847291");
  const [searching, setSearching] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [rated, setRated] = useState(0);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    const interval = setInterval(() => setProgress(p => p < 85 ? p + 0.3 : p), 800);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    setTrackingError("");
    setSearching(true);
    setTrackResult(null);
    try {
      const data = await onTrack(code);
      setTrackResult(data);
      setTracked(true);
    } catch (error) {
      setTrackingError(error.message);
      setTracked(false);
    } finally {
      setSearching(false);
    }
  };

  const steps = [
    { label: "Order Created", time: "10:02 AM", desc: "Your order was received by Zawadi Boutique", done: true },
    { label: "Picked Up", time: "11:15 AM", desc: "Rider Kamau collected your parcel from the sorting hub", done: true },
    { label: "In Transit", time: "Live", desc: `Your parcel is ${Math.round((100 - progress) * 0.03 + 1.2).toFixed(1)}km away — arriving in ~${Math.round((100 - progress) * 0.5 + 5)} min`, done: false, active: true },
    { label: "Delivered", time: "~2:45 PM", desc: "Estimated delivery to your door", done: false },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ background: dark ? "#060F1E" : C.navy, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Navigation size={16} color="#fff" /></div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>Swift<span style={{ color: C.green }}>Path</span></span>
        </div>
        <button onClick={() => nav("landing")} style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 13, cursor: "pointer" }}>← Home</button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        {/* SEARCH BAR */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20, marginBottom: 24, display: "flex", gap: 10 }}>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter tracking number e.g. SWP-2025-847291" style={{ flex: 1, background: dark ? "#0A1A2E" : "#F8FAFC", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 16px", color: theme.text, fontSize: 14, fontFamily: "JetBrains Mono, monospace" }} />
          <Btn variant="primary" theme={theme} onClick={handleSearch}>
            {searching ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />} Track
          </Btn>
        </div>

        {trackingError && <div style={{ marginBottom: 24, color: C.orange, fontSize: 14 }}>{trackingError}</div>}

        {tracked && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* LEFT — TIMELINE */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* TRACKING NUMBER */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 12, color: theme.sub, marginBottom: 6 }}>TRACKING NUMBER</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: C.green }}>{code || "SWP-2025-847291"}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: C.greenDim, border: "none", borderRadius: 8, padding: "6px 10px", color: C.green, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><Copy size={13} /> Copy</button>
                    <button style={{ background: C.greenDim, border: "none", borderRadius: 8, padding: "6px 10px", color: C.green, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><Share2 size={13} /> Share</button>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.sub, marginBottom: 6 }}>
                    <span>Progress</span><span style={{ color: C.green, fontWeight: 600 }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ background: theme.border, borderRadius: 100, height: 6, overflow: "hidden" }}>
                    <div style={{ background: `linear-gradient(90deg,${C.green},#00E676)`, height: "100%", width: `${progress}%`, borderRadius: 100, transition: "width .8s ease" }} />
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 20 }}>Delivery Status</h3>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: theme.border, zIndex: 0 }} />
                  {steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, marginBottom: 28, position: "relative" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.done ? C.green : s.active ? C.navy : theme.border, border: s.active ? `2px solid ${C.green}` : s.done ? "none" : `2px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }} className={s.active ? "pulse" : ""}>
                        {s.done ? <CheckCircle size={16} color="#fff" /> : s.active ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green }} /> : <Circle size={12} color={theme.sub} />}
                      </div>
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: s.done || s.active ? theme.text : theme.sub }}>{s.label}</span>
                          <span style={{ fontSize: 11, color: s.active ? C.green : theme.sub, fontWeight: s.active ? 600 : 400 }}>{s.time}</span>
                        </div>
                        <p style={{ fontSize: 13, color: theme.sub, lineHeight: 1.5 }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PARCEL INFO */}
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Parcel Info</h3>
                {(trackResult ? [
                  { label: "Item", value: trackResult.parcel?.description || "N/A" },
                  { label: "Customer", value: trackResult.customer?.name || "N/A" },
                  { label: "Phone", value: trackResult.customer?.phone || "N/A" },
                  { label: "Geo Address", value: trackResult.customer?.geoAddress || "N/A" },
                  { label: "Status", value: trackResult.status || "N/A" },
                  { label: "ETA", value: trackResult.eta || "TBD" },
                  { label: "Rider", value: `${trackResult.rider?.name || "Unknown"} · ⭐ ${trackResult.rider?.rating || "-"}` },
                ] : [
                  { label: "Item", value: "N/A" },
                  { label: "Status", value: "N/A" },
                  { label: "ETA", value: "N/A" },
                ]).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < (trackResult ? 6 : 2) ? `1px solid ${theme.border}` : "none" }}>
                    <span style={{ fontSize: 13, color: theme.sub }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* SUPPORT + RATING */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <a href="https://wa.me/254700000000" style={{ textDecoration: "none" }}>
                  <div style={{ background: "#25D366", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <MessageCircle size={18} color="#fff" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>WhatsApp Support</span>
                  </div>
                </a>
                <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: theme.sub, marginBottom: 6 }}>Rate Delivery</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1,2,3,4,5].map(n => <Star key={n} size={18} fill={rated >= n ? C.orange : "none"} color={rated >= n ? C.orange : theme.sub} style={{ cursor: "pointer" }} onClick={() => setRated(n)} />)}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — MAP */}
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden", height: "fit-content" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: theme.text }}>Live Location</span>
                <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>● Updating live</span>
              </div>
              <TrackingMapSVG dark={dark} progress={progress} />
              <div style={{ padding: "12px 16px", background: dark ? "#0A1A2E" : "#F0FDF4", display: "flex", alignItems: "center", gap: 10 }}>
                <div className="pulse" style={{ width: 10, height: 10, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>Arriving in ~{Math.round((100 - progress) * 0.5 + 5)} minutes</span>
                <span style={{ fontSize: 12, color: theme.sub, marginLeft: "auto" }}>Rider: Kamau J.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PATA POINT PORTAL
// ─────────────────────────────────────────────────────────────
function PataPointPortal({ nav, theme, dark, auth, pataPoints, onCollect, busy }) {
  const [parcelList, setParcelList] = useState(flattenPataPoints(pataPoints));
  const [showNotif, setShowNotif] = useState(true);
  const point = pataPoints[0] || { name: "Pata Point Portal", estate: "Nairobi", earningsToday: 0 };

  useEffect(() => {
    setParcelList(flattenPataPoints(pataPoints));
  }, [pataPoints]);

  const markCollected = async (pointId, parcelId) => {
    if (!auth?.token) return;
    try {
      await onCollect(auth.token, pointId, parcelId);
      setParcelList(current => current.map(parcel => parcel.id === parcelId ? { ...parcel, collected: true } : parcel));
    } catch (error) {
      console.error("Collect parcel failed", error);
    }
  };

  function flattenPataPoints(points) {
    return points.flatMap(point => point.parcels.map(parcel => ({
      ...parcel,
      pointId: point.id,
      pointName: point.name,
      estate: point.estate,
    })));
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg }}>
      {/* TOP BAR */}
      <div style={{ background: dark ? "#060F1E" : C.navy, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => nav("dashboard")} style={{ background: "none", border: `1px solid rgba(255,255,255,.25)`, borderRadius: 10, padding: "8px 10px", color: "#fff", cursor: "pointer", fontSize: 13 }}>
            ← Dashboard
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={14} color="#fff" /></div>
              <span style={{ fontWeight: 700, color: "#fff" }}>{point.name}</span>
            </div>
            <div style={{ fontSize: 13, color: "#7ABBD4", marginTop: 2 }}>{point.estate}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: C.green, borderRadius: 12, padding: "6px 14px" }}>
            <div style={{ fontSize: 11, color: C.navy, fontWeight: 700 }}>TODAY'S EARNINGS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>KES {point.earningsToday?.toLocaleString() || 0}</div>
          </div>
          <Bell size={20} color="#fff" />
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {showNotif && (
        <div style={{ background: C.orange, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={16} color="#fff" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>🆕 New parcel arrived for James Mwangi (SWP-2025-445566)</span>
          </div>
          <button onClick={() => setShowNotif(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Awaiting", value: parcelList.filter(p => !p.collected).length, color: C.orange },
            { label: "Collected Today", value: parcelList.filter(p => p.collected).length, color: C.green },
            { label: "Week Total", value: parcelList.length, color: C.green },
            { label: "Today's Earnings", value: `KES ${point.earningsToday?.toLocaleString() || 0}`, color: C.green },
          ].map((s, i) => (
            <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: theme.sub }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* AWAITING COLLECTION */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, marginBottom: 20 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Package size={18} color={C.orange} />
            <span style={{ fontWeight: 700, color: theme.text }}>Parcels Awaiting Collection</span>
            <span style={{ background: C.orange, color: "#fff", borderRadius: 100, padding: "2px 10px", fontSize: 12, fontWeight: 700, marginLeft: 4 }}>{parcelList.filter(p => !p.collected).length}</span>
          </div>

          {parcelList.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <CheckCircle size={48} color={C.green} style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600, color: theme.text, marginBottom: 6 }}>All clear!</div>
              <div style={{ color: theme.sub, fontSize: 14 }}>No parcels awaiting collection right now.</div>
            </div>
          ) : parcelList.map((p, i) => (
            <div key={p.id} style={{ padding: "16px 20px", borderTop: i > 0 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: C.green, marginBottom: 4 }}>{p.id}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 4 }}>{p.customer}</div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <a href={`tel:${p.phone}`} style={{ textDecoration: "none" }}>
                      <span style={{ fontSize: 13, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {p.phone}</span>
                    </a>
                    <span style={{ fontSize: 13, color: theme.sub }}>⏱ Arrived: {p.arrived}</span>
                    <span style={{ fontSize: 13, color: theme.sub }}>📍 {p.pointName}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: dark ? "#0A1A2E" : "#F0FDF4", border: `2px dashed ${C.green}`, borderRadius: 12, padding: "10px 18px", marginBottom: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: theme.sub, marginBottom: 4 }}>COLLECTION PIN</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 28, fontWeight: 700, color: C.green, letterSpacing: 6 }}>{p.pin}</div>
                  </div>
                  <button onClick={() => markCollected(p.pointId, p.id)} style={{ background: C.green, border: "none", borderRadius: 10, padding: "10px 20px", color: C.navy, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                    <CheckCircle size={16} /> Mark Collected
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TODAY'S ACTIVITY */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={18} color={C.green} />
            <span style={{ fontWeight: 700, color: theme.text }}>Today's Collections</span>
          </div>
          {parcelList.filter(p => p.collected).length > 0 ? parcelList.filter(p => p.collected).map((d, i) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: i > 0 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.greenDim, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle size={18} color={C.green} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{d.customer}</div>
                  <div style={{ fontSize: 12, color: theme.sub }}>{d.id.slice(-6)} · {d.arrived}</div>
                </div>
              </div>
              <span style={{ background: C.greenDim, color: C.green, fontWeight: 700, fontSize: 14, padding: "4px 12px", borderRadius: 100 }}>Collected</span>
            </div>
          )) : (
            <div style={{ padding: 24, textAlign: "center", color: theme.sub }}>No parcels have been collected yet today.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────
function Analytics({ nav, theme, dark, setDark, auth, analyticsData, busy }) {
  const [range, setRange] = useState("30");
  const [volumeData, setVolumeData] = useState(analyticsData.volume || []);

  useEffect(() => {
    setVolumeData(analyticsData.volume || []);
  }, [analyticsData.volume]);

  useEffect(() => {
    if (!auth?.token) return;
    let active = true;
    fetchAnalyticsVolume(auth.token, range)
      .then(data => {
        if (active) setVolumeData(data);
      })
      .catch(error => console.error("Could not fetch analytics volume:", error));
    return () => {
      active = false;
    };
  }, [auth?.token, range]);

  const data = volumeData;
  const summary = analyticsData.summary || {};

  if (!auth?.user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: theme.bg }}>
        <div style={{ width: "100%", maxWidth: 520, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, color: theme.text, marginBottom: 14 }}>Sign in to view analytics</h2>
          <p style={{ color: theme.sub, marginBottom: 24 }}>Analytics are available to signed-in merchants only.</p>
          <Btn variant="primary" theme={theme} onClick={() => nav("dashboard")} large>Go to Dashboard</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* MINI SIDEBAR */}
      <div style={{ width: 64, background: dark ? "#060F1E" : C.navy, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 24, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => nav("landing")}><Navigation size={18} color="#fff" /></div>
        {[
          { icon: <Home size={18} />, action: () => nav("dashboard") },
          { icon: <Plus size={18} />, action: () => nav("create") },
          { icon: <Truck size={18} />, action: () => {} },
          { icon: <BarChart2 size={18} />, action: () => {}, active: true },
          { icon: <Settings size={18} />, action: () => {} },
        ].map((item, i) => (
          <div key={i} onClick={item.action} style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: item.active ? C.greenDim : "transparent", color: item.active ? C.green : "#7A9BB5" }}>{item.icon}</div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {/* TOP BAR */}
        <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => nav("dashboard")} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 10px", color: theme.sub, cursor: "pointer", fontSize: 13 }}>
              ← Back
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Analytics</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4, background: dark ? "#0A1A2E" : "#F0F4F8", borderRadius: 10, padding: 4 }}>
              {["30","60","90"].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{ background: range === r ? theme.card : "transparent", border: range === r ? `1px solid ${theme.border}` : "none", borderRadius: 8, padding: "5px 14px", color: range === r ? theme.text : theme.sub, fontWeight: range === r ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{r}d</button>
              ))}
            </div>
            <Btn variant="outlined" small theme={theme} onClick={() => {}}><Download size={14} /> Export CSV</Btn>
            <Btn variant="primary" small theme={theme} onClick={() => {}}><Download size={14} /> PDF Report</Btn>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* KPI TABLE */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Performance Summary</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: dark ? "#0A1A2E" : "#F8FAFC" }}>
                    {["Metric", "This Week", "Last Week", "This Month"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: theme.sub, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: "Total Parcels", w: summary.totalParcels?.toLocaleString() || "-", lw: "924", m: "3,891" },
                    { metric: "Success Rate", w: summary.successRate ? `${summary.successRate}%` : "-", lw: "96.1%", m: "97.4%" },
                    { metric: "Avg Delivery Time", w: summary.avgDeliveryTime ? `${summary.avgDeliveryTime} min` : "-", lw: "94 min", m: "91 min" },
                    { metric: "Revenue", w: summary.revenue ? `KES ${summary.revenue.toLocaleString()}` : "-", lw: "KES 277,200", m: "KES 1,167,300" },
                    { metric: "COD Collected", w: summary.codCollected ? `KES ${summary.codCollected.toLocaleString()}` : "-", lw: "KES 1.8M", m: "KES 7.4M" },
                    { metric: "Failed Deliveries", w: summary.failedDeliveries?.toString() || "-", lw: "36", m: "103" },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, color: theme.text }}>{row.metric}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.green, fontWeight: 600 }}>{row.w}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: theme.sub }}>{row.lw}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: theme.text }}>{row.m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CHARTS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Volume Chart */}
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Delivery Volume</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1A3050" : "#E2E8F0"} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 6)} />
                  <YAxis tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12 }} />
                  <Area type="monotone" dataKey="parcels" stroke={C.green} fill="url(#volGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Success Rate */}
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Success Rate Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="succGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.orange} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.orange} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1A3050" : "#E2E8F0"} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 6)} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12 }} />
                  <ReferenceLine y={95} stroke={C.green} strokeDasharray="4 4" label={{ value: "95% target", fontSize: 10, fill: C.green }} />
                  <Area type="monotone" dataKey="success" stroke={C.orange} fill="url(#succGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Delivery Time Distribution */}
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Delivery Time Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={TIME_DIST}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1A3050" : "#E2E8F0"} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: theme.sub }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12 }} />
                  <Bar dataKey="count" fill={C.green} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* COD Pie */}
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>COD Collection Status</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={COD_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                      {COD_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {COD_DATA.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: theme.text }}>{d.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginLeft: "auto" }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Zones + Revenue */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Top 5 Delivery Zones</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.zones} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1A3050" : "#E2E8F0"} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="zone" tick={{ fontSize: 11, fill: theme.sub }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12 }} />
                  <Bar dataKey="parcels" fill={C.orange} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: theme.text, marginBottom: 16 }}>Revenue vs. Cost</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analyticsData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1A3050" : "#E2E8F0"} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: theme.sub }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v/1000)}K`} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12 }} formatter={v => `KES ${v.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 12, color: theme.sub }} />
                  <Line type="monotone" dataKey="revenue" stroke={C.green} strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="cost" stroke={C.orange} strokeWidth={2} dot={false} name="Cost" strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SVG MAP COMPONENTS
// ─────────────────────────────────────────────────────────────
function NairobiMapVisual({ dark }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1200); return () => clearInterval(t); }, []);

  const dots = [
    { x: 180, y: 120 }, { x: 260, y: 160 }, { x: 140, y: 200 },
    { x: 300, y: 100 }, { x: 220, y: 240 }, { x: 160, y: 280 },
    { x: 340, y: 200 }, { x: 100, y: 150 }, { x: 280, y: 290 },
  ];

  return (
    <div style={{ position: "relative", width: 420, height: 380 }}>
      <svg width="420" height="380" viewBox="0 0 420 380">
        {/* Background */}
        <rect width="420" height="380" rx="20" fill={dark ? "#0D1F35" : "#EBF3FF"} />
        {/* Grid lines */}
        {[60, 120, 180, 240, 300].map(y => <line key={y} x1="20" y1={y} x2="400" y2={y} stroke={dark ? "#1A3050" : "#D0E4F7"} strokeWidth="1" />)}
        {[60, 120, 180, 240, 300, 360].map(x => <line key={x} x1={x} y1="20" x2={x} y2="360" stroke={dark ? "#1A3050" : "#D0E4F7"} strokeWidth="1" />)}
        {/* Roads */}
        <path d="M50 190 Q210 170 380 200" stroke={dark ? "#1E4080" : "#A0C4E8"} strokeWidth="3" fill="none" />
        <path d="M210 30 Q200 190 195 360" stroke={dark ? "#1E4080" : "#A0C4E8"} strokeWidth="3" fill="none" />
        <path d="M80 80 Q200 190 340 290" stroke={dark ? "#1E4080" : "#A0C4E8"} strokeWidth="2" fill="none" strokeDasharray="6,4" />
        <path d="M320 60 Q200 190 80 310" stroke={dark ? "#1E4080" : "#A0C4E8"} strokeWidth="2" fill="none" strokeDasharray="6,4" />
        {/* Coverage blob */}
        <ellipse cx="210" cy="190" rx="140" ry="110" fill={C.green} fillOpacity="0.07" stroke={C.green} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4,4" />
        {/* Pata Point markers */}
        {dots.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r={8 + (tick === i ? 6 : 0)} fill={C.green} fillOpacity={0.12} style={{ transition: "all .4s" }} />
            <circle cx={d.x} cy={d.y} r="5" fill={C.green} />
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">P</text>
          </g>
        ))}
        {/* Moving delivery dots */}
        {[{x:180+(tick*7)%60,y:160+(tick*3)%40},{x:240-(tick*5)%50,y:200+(tick*4)%30},{x:160+(tick*6)%70,y:240-(tick*4)%35}].map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="10" fill={C.orange} fillOpacity="0.15" />
            <circle cx={d.x} cy={d.y} r="6" fill={C.orange} />
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="7" fill="#fff">🛵</text>
          </g>
        ))}
        {/* Center label */}
        <text x="210" y="195" textAnchor="middle" fontSize="12" fontWeight="700" fill={dark ? "#7ABBD4" : "#1A3A5C"}>NAIROBI</text>
      </svg>
    </div>
  );
}

function DashboardMapSVG({ dark }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => (x + 1) % 100), 400); return () => clearInterval(t); }, []);

  const riders = [
    { x: 150 + Math.sin(tick * 0.1) * 20, y: 120 + Math.cos(tick * 0.08) * 15 },
    { x: 280 + Math.cos(tick * 0.07) * 25, y: 160 + Math.sin(tick * 0.09) * 18 },
    { x: 200 + Math.sin(tick * 0.06) * 30, y: 220 + Math.cos(tick * 0.11) * 12 },
    { x: 350 + Math.cos(tick * 0.09) * 15, y: 100 + Math.sin(tick * 0.07) * 20 },
    { x: 120 + Math.sin(tick * 0.08) * 18, y: 240 + Math.cos(tick * 0.06) * 22 },
  ];

  return (
    <svg width="100%" height="280" viewBox="0 0 580 280" style={{ display: "block" }}>
      <rect width="580" height="280" fill={dark ? "#070F1C" : "#EBF3FF"} />
      {[40, 80, 120, 160, 200, 240].map(y => <line key={y} x1="0" y1={y} x2="580" y2={y} stroke={dark ? "#0F2035" : "#D0E4F7"} strokeWidth="1" />)}
      {[60, 120, 180, 240, 300, 360, 420, 480, 540].map(x => <line key={x} x1={x} y1="0" x2={x} y2="280" stroke={dark ? "#0F2035" : "#D0E4F7"} strokeWidth="1" />)}
      <path d="M0 140 Q290 120 580 145" stroke={dark ? "#1A3A60" : "#90B8D8"} strokeWidth="3" fill="none" />
      <path d="M290 0 Q285 140 290 280" stroke={dark ? "#1A3A60" : "#90B8D8"} strokeWidth="3" fill="none" />
      <path d="M80 40 Q290 140 500 240" stroke={dark ? "#1A3A60" : "#90B8D8"} strokeWidth="2" fill="none" strokeDasharray="5,4" />
      <ellipse cx="290" cy="140" rx="200" ry="100" fill={C.green} fillOpacity="0.05" stroke={C.green} strokeOpacity="0.15" strokeWidth="1" />
      {riders.map((r, i) => (
        <g key={i}>
          <circle cx={r.x} cy={r.y} r="12" fill={C.orange} fillOpacity="0.15" />
          <circle cx={r.x} cy={r.y} r="7" fill={C.orange} />
          <text x={r.x} y={r.y + 3} textAnchor="middle" fontSize="8" fill="#fff">🛵</text>
        </g>
      ))}
      {[{x:120,y:160},{x:240,y:90},{x:380,y:180},{x:460,y:120},{x:180,y:210}].map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={C.green} />
          <text x={p.x} y={p.y+4} textAnchor="middle" fontSize="7" fill="#fff">P</text>
        </g>
      ))}
      <text x="290" y="145" textAnchor="middle" fontSize="11" fontWeight="700" fill={dark ? "#7ABBD4" : "#1A3A5C"} opacity="0.6">NAIROBI</text>
    </svg>
  );
}

function TrackingMapSVG({ dark, progress }) {
  const riderX = 100 + (progress / 100) * 200;
  const riderY = 200 - (progress / 100) * 80 + Math.sin(progress * 0.3) * 15;

  return (
    <svg width="100%" height="300" viewBox="0 0 500 300" style={{ display: "block" }}>
      <rect width="500" height="300" fill={dark ? "#070F1C" : "#EBF3FF"} />
      {[50, 100, 150, 200, 250].map(y => <line key={y} x1="0" y1={y} x2="500" y2={y} stroke={dark ? "#0F2035" : "#D0E4F7"} strokeWidth="1" />)}
      {[80, 160, 240, 320, 400].map(x => <line key={x} x1={x} y1="0" x2={x} y2="300" stroke={dark ? "#0F2035" : "#D0E4F7"} strokeWidth="1" />)}
      <path d="M60 250 Q200 180 380 150" stroke={dark ? "#1A3A60" : "#90B8D8"} strokeWidth="3" fill="none" />
      <path d="M150 40 Q200 180 180 260" stroke={dark ? "#1A3A60" : "#90B8D8"} strokeWidth="2" fill="none" />
      {/* Dashed route */}
      <path d="M100 200 Q200 160 380 120" stroke={C.green} strokeWidth="2" fill="none" strokeDasharray="8,5" strokeOpacity="0.6" />
      {/* Rider */}
      <circle cx={riderX} cy={riderY} r="16" fill={C.orange} fillOpacity="0.2" />
      <circle cx={riderX} cy={riderY} r="10" fill={C.orange} />
      <text x={riderX} y={riderY + 4} textAnchor="middle" fontSize="11" fill="#fff">🛵</text>
      {/* Destination */}
      <circle cx="380" cy="120" r="14" fill={C.green} fillOpacity="0.2" />
      <circle cx="380" cy="120" r="8" fill={C.green} />
      <text x="380" y="124" textAnchor="middle" fontSize="10" fill="#fff">🏠</text>
      {/* ETA badge */}
      <rect x="310" y="70" width="130" height="32" rx="8" fill={C.green} />
      <text x="375" y="91" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">~{Math.round((100 - progress) * 0.5 + 5)} min away</text>
      {/* Origin */}
      <circle cx="100" cy="200" r="8" fill="#7A9BB5" />
      <text x="100" y="204" textAnchor="middle" fontSize="9" fill="#fff">📦</text>
      <text x="290" y="170" textAnchor="middle" fontSize="10" fontWeight="600" fill={dark ? "#7ABBD4" : "#1A3A5C"} opacity="0.7">KILIMANI → WESTLANDS</text>
    </svg>
  );
}

function CoverageMapSVG({ dark }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${dark ? "#1A3050" : "#D0E4F7"}` }}>
      <svg width="100%" height="320" viewBox="0 0 400 320">
        <rect width="400" height="320" fill={dark ? "#0D1F35" : "#EBF3FF"} />
        {[40, 80, 120, 160, 200, 240, 280].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={dark ? "#1A3050" : "#C8DFF5"} strokeWidth="1" />)}
        {[50, 100, 150, 200, 250, 300, 350].map(x => <line key={x} x1={x} y1="0" x2={x} y2="320" stroke={dark ? "#1A3050" : "#C8DFF5"} strokeWidth="1" />)}
        <ellipse cx="200" cy="160" rx="160" ry="120" fill={C.green} fillOpacity="0.12" stroke={C.green} strokeOpacity="0.4" strokeWidth="1.5" />
        <path d="M50 160 Q200 140 370 165" stroke={dark ? "#1E4080" : "#90B8D8"} strokeWidth="2.5" fill="none" />
        <path d="M200 30 Q195 160 200 300" stroke={dark ? "#1E4080" : "#90B8D8"} strokeWidth="2.5" fill="none" />
        {[
          {x:120,y:100,name:"Westlands"},{x:200,y:80,name:"Kasarani"},{x:280,y:120,name:"Karen"},
          {x:90,y:180,name:"Rongai"},{x:200,y:160,name:"CBD"},{x:310,y:180,name:"Eastleigh"},
          {x:140,y:240,name:"Lang'ata"},{x:260,y:240,name:"South B"},{x:200,y:280,name:"Kitengela"},
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill={C.green} />
            <circle cx={p.x} cy={p.y} r="12" fill={C.green} fillOpacity="0.15" />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fontWeight="600" fill={dark ? "#7ABBD4" : "#1A3A5C"}>{p.name}</text>
          </g>
        ))}
        <text x="200" y="168" textAnchor="middle" fontSize="11" fontWeight="700" fill={dark ? "#7ABBD4" : "#1A3A5C"}>NAIROBI</text>
        <text x="200" y="182" textAnchor="middle" fontSize="9" fill={C.green}>Coverage Active</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REUSABLE UI COMPONENTS
// ─────────────────────────────────────────────────────────────
function Btn({ children, variant = "primary", onClick, theme, small, large, style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, fontWeight: 600, cursor: "pointer",
    transition: "all .15s", border: "none",
    padding: small ? "6px 14px" : large ? "13px 28px" : "9px 20px",
    fontSize: small ? 13 : large ? 15 : 14,
    ...style,
  };
  const variants = {
    primary: { background: C.green, color: C.navy, boxShadow: `0 4px 14px ${C.green}30` },
    outlined: { background: "transparent", color: theme?.text || C.text, border: `1.5px solid ${theme?.border || "#E2E8F0"}` },
    ghost: { background: "transparent", color: theme?.sub || "#64748B" },
    danger: { background: "#EF5350", color: "#fff" },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (variant === "primary") { e.currentTarget.style.background = "#00E676"; e.currentTarget.style.transform = "translateY(-1px)"; } else if (variant === "outlined") { e.currentTarget.style.background = theme?.dark ? "#0D1F35" : "#F8FAFC"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = variants[variant].background || "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}>
      {children}
    </button>
  );
}

function FormField({ label, value, onChange, placeholder, theme, type = "text", multiline }) {
  const style = { width: "100%", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 14, transition: "border-color .15s" };
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: theme.sub, display: "block", marginBottom: 8 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...style, resize: "vertical" }} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = theme.border} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = theme.border} />
      }
    </div>
  );
}
