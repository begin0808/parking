import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation, RotateCw, Car, MapPin, List, Database, ChevronDown, Coins, LocateFixed, Zap, Info, X, Navigation2 } from 'lucide-react';

// ---------------------------------------------------------
// 縣市中心點定義 (僅用於啟動時判定所在縣市)
// ---------------------------------------------------------
const TAIWAN_CITIES = [
  { code: 'Keelung', name: '基隆市', lat: 25.1276, lng: 121.7392 },
  { code: 'Taipei', name: '臺北市', lat: 25.0330, lng: 121.5654 },
  { code: 'NewTaipei', name: '新北市', lat: 25.0169, lng: 121.4627 },
  { code: 'Taoyuan', name: '桃園市', lat: 24.9936, lng: 121.3009 },
  { code: 'Hsinchu', name: '新竹市', lat: 24.8138, lng: 120.9674 },
  { code: 'HsinchuCounty', name: '新竹縣', lat: 24.8397, lng: 121.0113 },
  { code: 'MiaoliCounty', name: '苗栗縣', lat: 24.5602, lng: 120.8214 },
  { code: 'Taichung', name: '臺中市', lat: 24.1477, lng: 120.6736 },
  { code: 'ChanghuaCounty', name: '彰化縣', lat: 24.0518, lng: 120.5161 },
  { code: 'NantouCounty', name: '南投縣', lat: 23.9610, lng: 120.9719 },
  { code: 'YunlinCounty', name: '雲林縣', lat: 23.7092, lng: 120.4313 },
  { code: 'Chiayi', name: '嘉義市', lat: 23.4800, lng: 120.4491 },
  { code: 'ChiayiCounty', name: '嘉義縣', lat: 23.4518, lng: 120.2555 },
  { code: 'Tainan', name: '臺南市', lat: 22.9997, lng: 120.2270 },
  { code: 'Kaohsiung', name: '高雄市', lat: 22.6272, lng: 120.3014 },
  { code: 'PingtungCounty', name: '屏東縣', lat: 22.6713, lng: 120.4880 },
  { code: 'YilanCounty', name: '宜蘭縣', lat: 24.7021, lng: 121.7377 },
  { code: 'HualienCounty', name: '花蓮縣', lat: 23.9872, lng: 121.6016 },
  { code: 'TaitungCounty', name: '臺東縣', lat: 22.7583, lng: 121.1444 },
  { code: 'PenghuCounty', name: '澎湖縣', lat: 23.5711, lng: 119.5793 },
  { code: 'KinmenCounty', name: '金門縣', lat: 24.4403, lng: 118.3235 },
  { code: 'LienchiangCounty', name: '連江縣', lat: 26.1505, lng: 119.9264 },
];

const leafletStyle = `
  .custom-marker { background: transparent; border: none; }
  .marker-pin {
    width: 42px; height: 42px; border-radius: 50% 50% 50% 0;
    position: absolute; transform: rotate(-45deg);
    left: 50%; top: 50%; margin: -21px 0 0 -21px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    cursor: pointer; transition: all 0.2s ease;
    border: 3px solid #ffffff;
  }
  .marker-pin:hover { transform: rotate(-45deg) scale(1.15); z-index: 1000 !important; }
  .marker-text {
    position: absolute; z-index: 10; font-weight: 900; font-size: 15px;
    transform: rotate(45deg); color: #0f172a; text-shadow: 0 0 2px white;
  }
  .marker-pin.grey { background-color: #94a3b8 !important; width: 34px; height: 34px; margin: -17px 0 0 -17px; }
  .marker-pin.blue-static {
    background-color: #3b82f6 !important;
    width: 28px; height: 28px; margin: -14px 0 0 -14px;
  }
  .marker-pin.blue-static .marker-text { color: white; text-shadow: none; font-size: 14px; font-weight: 800; }
  .marker-pin::after { content: ''; width: 26px; height: 26px; margin: 8px 0 0 8px; background: #ffffff; position: absolute; border-radius: 50%; opacity: 0.2; }
  .marker-pin.blue-static::after { width: 14px; height: 14px; margin: 7px 0 0 7px; }
  
  .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border-radius: 24px; color: white; border: 1px solid rgba(255, 255, 255, 0.2); }
  .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); }
  
  .custom-user-marker { background: transparent; border: none; }
  .user-pulse { background: #ff3333; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px rgba(255, 51, 51, 0.8); animation: pulse 2s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(255, 51, 51, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); } }
`;

const PenguinLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]">
    <defs><linearGradient id="pBack" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: '#334155' }} /><stop offset="100%" style={{ stopColor: '#0f172a' }} /></linearGradient></defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="15 10" className="animate-[spin_8s_linear_infinite] opacity-60" />
    <path d="M50 20 C30 20 22 35 22 55 C22 80 35 90 50 90 C65 90 78 80 78 55 C78 35 70 20 50 20 Z" fill="url(#pBack)" />
    <path d="M50 38 C40 38 32 48 32 62 C32 75 40 85 50 85 C60 85 68 75 68 62 C68 48 60 38 50 38 Z" fill="#ffffff" />
    <circle cx="42" cy="44" r="3" fill="#0f172a" /><circle cx="58" cy="44" r="3" fill="#0f172a" />
    <path d="M45 52 L55 52 L50 60 Z" fill="#f59e0b" />
    <path d="M22 55 Q12 60 16 75 T26 68" fill="url(#pBack)" /><path d="M78 55 Q88 60 84 75 T74 68" fill="url(#pBack)" />
    <path d="M35 86 Q30 92 40 92 T46 88" fill="#f59e0b" /><path d="M65 86 Q70 92 60 92 T54 88" fill="#f59e0b" />
  </svg>
);

const API_BASE = 'https://script.google.com/macros/s/AKfycbzB4JwfxZlnkysWOSDQ9Fpp-PaPvo4bOk95Wi9Gh8TV-bH35gukiFG0xfHlEQqOX8hQ/exec';
const SEARCH_RADIUS_KM = 5; 

export default function App() {
  const [detectedCity, setDetectedCity] = useState(TAIWAN_CITIES[13]); 
  const [allParkingData, setAllParkingData] = useState([]);
  const [parkingData, setParkingData] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); 
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [showInstructions, setShowInstructions] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef(new Map());
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => { document.title = "小企鵝停車雷達"; }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const findNearestCity = (lat, lng) => {
    let minD = Infinity; let nearest = TAIWAN_CITIES[13];
    TAIWAN_CITIES.forEach(c => {
      const d = calculateDistance(lat, lng, c.lat, c.lng);
      if (d < minD) { minD = d; nearest = c; }
    });
    return nearest;
  };

  useEffect(() => {
    if (window.L && window.L.map) { setIsLeafletLoaded(true); return; }
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => setIsLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 自動化排程邏輯
  useEffect(() => {
    if (!isLeafletLoaded) return;

    const startup = () => {
      if (!navigator.geolocation) { setIsInitializing(false); fetchParkingData(detectedCity.code); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          const city = findNearestCity(loc.lat, loc.lng);
          setUserLocation(loc);
          setDetectedCity(city);
          fetchParkingData(city.code);
          setIsInitializing(false);
          if (mapInstanceRef.current) mapInstanceRef.current.setView([loc.lat, loc.lng], 13);
        },
        () => { setIsInitializing(false); fetchParkingData(detectedCity.code); },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    startup();

    // 20s 更新定位紅點 (維持)
    const tLoc = setInterval(() => {
      navigator.geolocation.getCurrentPosition((p) => {
        setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
      }, null, { enableHighAccuracy: true });
    }, 20000);

    // 60s 更新資料 (維持)
    const tData = setInterval(() => { fetchParkingData(detectedCity.code, true); }, 60000);

    // [已取消] 每 60 秒視野自動同步中心功能，讓使用者能自由查看地圖

    return () => { clearInterval(tLoc); clearInterval(tData); };
  }, [isLeafletLoaded, detectedCity.code]);

  useEffect(() => {
    if (isLeafletLoaded && !isInitializing && mapContainerRef.current && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([detectedCity.lat, detectedCity.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 500);
    }
  }, [isLeafletLoaded, isInitializing]);

  useEffect(() => {
    const dataArray = Array.isArray(allParkingData) ? allParkingData : [];
    const processed = dataArray.map(lot => {
      const total = lot?.total && typeof lot.total !== 'object' ? Number(lot.total) : 0;
      const available = lot?.available && typeof lot.available !== 'object' ? Number(lot.available) : -1;
      const isUnknown = (available === -1 || isNaN(available));
      const plat = Number(lot?.lat);
      const plng = Number(lot?.lng);
      const name = String(lot?.name || "未知");
      const isDynamicCapable = !!lot.isDynamicCapable; 

      let color = '#3b82f6'; 
      let markerType = 'blue-static';
      let percentage = total > 0 ? available / total : 1; 

      if (!isUnknown) {
        markerType = 'dynamic';
        if (available === 0) color = '#f43f5e';
        else if (total > 0) {
          if (percentage < 0.1) color = '#f43f5e';
          else if (percentage < 0.3) color = '#f59e0b';
          else color = '#10b981';
        } else color = '#10b981'; 
      } else if (isDynamicCapable) {
        color = '#94a3b8';
        markerType = 'grey';
      }

      return { 
        ...lot, name, lat: plat, lng: plng, total, available, color, isUnknown, markerType,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, plat, plng) : null 
      };
    });
    const filtered = processed.filter(lot => lot.distance !== null && lot.distance <= SEARCH_RADIUS_KM).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setParkingData(filtered.length > 0 ? filtered : processed.slice(0, 150));
  }, [allParkingData, userLocation]);

  const fetchParkingData = async (cityCode, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const url = new URL(API_BASE);
      url.searchParams.append('route', 'parking');
      url.searchParams.append('city', cityCode);
      const res = await fetch(url.toString());
      const result = await res.json();
      if (result?.success && Array.isArray(result.data)) setAllParkingData(result.data);
      else setAllParkingData([]);
    } catch (e) { setAllParkingData([]); } 
    finally { setLoading(false); }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition((p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        setUserLocation(loc);
        const city = findNearestCity(loc.lat, loc.lng);
        if (city.code !== detectedCity.code) { setDetectedCity(city); fetchParkingData(city.code); }
        if (mapInstanceRef.current) mapInstanceRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
        setLoading(false);
      }, () => setLoading(false), { enableHighAccuracy: true });
  };

  const handleNavigate = (lat, lng, name) => {
    if (!lat || !lng) return;
    const utterance = new SpeechSynthesisUtterance(`即將為您導航到 ${String(name)}`);
    utterance.lang = 'zh-TW';
    window.speechSynthesis.speak(utterance);
    
    setTimeout(() => { window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`; }, 1600);
  };

  useEffect(() => { window.handleNavigateGlobal = handleNavigate; return () => { delete window.handleNavigateGlobal; }; }, []);

  // 標記渲染同步
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L; const map = mapInstanceRef.current; const currentMarkers = markersRef.current;
    const dataToRender = Array.isArray(parkingData) ? parkingData : [];
    
    const activeIds = new Set(dataToRender.map(l => String(l.id)));
    currentMarkers.forEach((marker, id) => { if (!activeIds.has(String(id))) { map.removeLayer(marker); currentMarkers.delete(id); } });

    dataToRender.forEach(lot => {
      const isBlue = lot.markerType === 'blue-static';
      const isGrey = lot.markerType === 'grey';
      const iconSettings = { 
        className: 'custom-marker', 
        html: `<div class="marker-pin ${isBlue ? 'blue-static' : (isGrey ? 'grey' : '')}" style="background-color: ${lot.color};"><span class="marker-text">${isBlue ? 'P' : (isGrey ? '?' : lot.available)}</span></div>`, 
        iconSize: isBlue ? [28, 28] : [42, 42], 
        iconAnchor: isBlue ? [14, 28] : [21, 42], 
        popupAnchor: [0, -28] 
      };

      const popupHtml = `
        <div style="min-width: 210px; padding: 12px; color: white;">
          <b style="font-size:16px; color:#38bdf8; display:block; margin-bottom:4px;">${lot.name}</b>
          <div style="font-size:11px; color: #94a3b8; margin-bottom:8px;">
            ${isBlue ? '🏢 全量資料庫場站' : `🏢 總位數: ${lot.total || '未知'}`} | 📡 ${lot.distance ? Number(lot.distance).toFixed(1) : '?'}km
          </div>
          <div style="margin: 8px 0; font-size:12px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; border-left: 4px solid ${lot.color}; line-height:1.4;">
            ${lot.fare}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid rgba(255,255,255,0.1); padding-top:12px; margin-top:10px;">
             <div><div style="font-size:10px; color:#64748b;">類型</div><div style="font-size:24px; font-weight:900; color:${lot.color}; line-height:1;">${isBlue ? 'P' : (isGrey ? '?' : lot.available)}</div></div>
             <button onclick="window.handleNavigateGlobal(${lot.lat}, ${lot.lng}, '${lot.name}')" style="background:#38bdf8; color:#0f172a; border:none; padding:10px 20px; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow: 0 4px 15px rgba(56,189,248,0.4);">導航 GO</button>
          </div>
        </div>
      `;

      if (currentMarkers.has(String(lot.id))) {
        const marker = currentMarkers.get(String(lot.id));
        marker.setIcon(L.divIcon(iconSettings)).getPopup().setContent(popupHtml);
      } else {
        const marker = L.marker([lot.lat, lot.lng], { icon: L.divIcon(iconSettings) })
          .bindPopup(popupHtml, {
            autoPan: true,
            autoPanPadding: L.point(50, 150),
            offset: L.point(0, -5)
          })
          .on('click', () => {
             // 點選時不語音播報，保持安靜
          })
          .addTo(map);
        currentMarkers.set(String(lot.id), marker);
      }
    });
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      else userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: L.divIcon({ className: 'custom-user-marker', html: `<div class="user-pulse"></div>`, iconSize: [20, 20] }), zIndexOffset: 1000 }).addTo(map);
    }
  }, [parkingData, userLocation]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-10 text-center">
        <div className="relative mb-10"><PenguinLogo /><div className="absolute inset-0 animate-ping rounded-full border-4 border-sky-500/30 scale-150"></div></div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">小企鵝雷達同步中</h1>
        <p className="text-slate-500 text-sm animate-pulse uppercase font-black tracking-widest">正在鎖定衛星座標並同步週邊資訊...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans text-slate-100 relative overflow-hidden">
      <style>{leafletStyle}</style>

      <div className="absolute top-0 left-0 right-0 z-[1500] px-4 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-sky-500/30 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PenguinLogo />
            <div>
              <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 leading-none">小企鵝停車雷達</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">定位：{detectedCity.name}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={handleLocateMe} title="手動重新定位" className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-red-500 active:scale-95 shadow-sm transition-all"><LocateFixed size={18} /></button>
             <button onClick={() => fetchParkingData(detectedCity.code)} title="刷新資料" className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 active:scale-95 shadow-sm transition-all"><RotateCw size={18} className={loading ? 'animate-spin' : ''} /></button>
             <button onClick={() => setShowInstructions(true)} title="說明" className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 active:scale-95 shadow-sm transition-all"><Info size={18} /></button>
          </div>
        </div>
        
        <div className="flex gap-2 h-10 items-center justify-center">
          <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700 h-10 w-full">
            <button onClick={() => setViewMode('map')} className={`flex-1 rounded-lg text-[10px] font-black transition-all ${viewMode === 'map' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}>雷達圖層</button>
            <button onClick={() => setViewMode('list')} className={`flex-1 rounded-lg text-[10px] font-black transition-all ${viewMode === 'list' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}>清單模式</button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-900">
        <div id="map-wrap" className={`absolute inset-0 ${viewMode === 'map' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
           <div ref={mapContainerRef} className="w-full h-full" />
           {loading && <div className="absolute top-48 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 px-4 py-2 rounded-full border border-sky-500 text-sky-400 text-xs font-bold shadow-2xl animate-pulse">更新中...</div>}
        </div>
        <div className={`absolute inset-0 bg-slate-900 overflow-y-auto px-4 pt-44 pb-10 transition-transform duration-500 ${viewMode === 'list' ? 'translate-y-0 z-20' : 'translate-y-full'}`}>
           <div className="space-y-3">
             {parkingData.map(lot => (
               <div key={String(lot.id)} onClick={() => { setViewMode('map'); if(mapInstanceRef.current) mapInstanceRef.current.setView([lot.lat, lot.lng], 16, {animate:true}); }} className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700 active:scale-95 transition-all">
                 <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <div className="flex items-center gap-2 mb-1"><span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded font-mono">#{String(lot.id).slice(-4)}</span>{lot.distance && <span className="text-[10px] font-black text-indigo-400">📡 {Number(lot.distance).toFixed(1)} km</span>}</div>
                      <h3 className="font-black text-slate-100 text-base leading-tight">${lot.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">${lot.address}</p>
                    </div>
                    <div className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border-2 ${lot.markerType === 'blue-static' ? 'border-blue-500 text-blue-500' : (lot.markerType === 'grey' ? 'border-slate-500 text-slate-400' : (Number(lot.available) < 10 ? 'border-rose-500 text-rose-500' : 'border-emerald-500 text-emerald-500'))}`}>
                      <span className="text-xl font-black">${lot.markerType === 'blue-static' ? 'P' : (lot.markerType === 'grey' ? '?' : Number(lot.available))}</span>
                      <span className="text-[8px] font-bold uppercase tracking-tighter">${lot.markerType === 'blue-static' ? 'Static' : 'Seats'}</span>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {showInstructions && (
        <div className="absolute inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-800 border border-sky-500/50 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><Info className="text-sky-400" size={24} /><h2 className="text-xl font-black text-white">使用說明</h2></div>
                <button onClick={() => setShowInstructions(false)} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700 items-center">
                  <div className="text-2xl text-red-500"><LocateFixed size={28} /></div>
                  <div><p className="font-bold text-white underline underline-offset-4">全自動定位</p><p>啟動後自動判定縣市，並鎖定 5 公里內的場站。移動或偏移時可按紅色鈕重新對準中心。</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 font-bold text-[10px]">
                   <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 border border-emerald-500/20">● 綠色：位子充足</div>
                   <div className="bg-blue-600/20 p-2 rounded-xl text-blue-500 border border-blue-600/20">● 藍色 P：靜態場站</div>
                   <div className="bg-rose-500/20 p-2 rounded-xl text-rose-400 border border-rose-500/20">● 紅色：目前滿位</div>
                   <div className="bg-slate-500/20 p-2 rounded-xl text-slate-400 border border-slate-500/20">● 灰色 ?：資料暫斷</div>
                </div>
              </div>
              <button onClick={() => setShowInstructions(false)} className="w-full bg-sky-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all">開始掃描</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}