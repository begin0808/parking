import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation, RotateCw, Car, MapPin, List, Database, ChevronDown, Coins, LocateFixed, Zap, Info, X } from 'lucide-react';

// ---------------------------------------------------------
// 縣市資料定義 (包含經緯度座標供距離計算與切換)
// ---------------------------------------------------------
const TAIWAN_CITIES = [
  { code: 'Keelung', name: '基隆市 *', lat: 25.1276, lng: 121.7392, hasDynamic: true },
  { code: 'Taipei', name: '臺北市 *', lat: 25.0330, lng: 121.5654, hasDynamic: true },
  { code: 'NewTaipei', name: '新北市 *', lat: 25.0169, lng: 121.4627, hasDynamic: true },
  { code: 'Taoyuan', name: '桃園市 *', lat: 24.9936, lng: 121.3009, hasDynamic: true },
  { code: 'Hsinchu', name: '新竹市 *', lat: 24.8138, lng: 120.9674, hasDynamic: true },
  { code: 'HsinchuCounty', name: '新竹縣', lat: 24.8397, lng: 121.0113, hasDynamic: false },
  { code: 'MiaoliCounty', name: '苗栗縣', lat: 24.5602, lng: 120.8214, hasDynamic: false },
  { code: 'Taichung', name: '臺中市 *', lat: 24.1477, lng: 120.6736, hasDynamic: true },
  { code: 'ChanghuaCounty', name: '彰化縣', lat: 24.0518, lng: 120.5161, hasDynamic: false },
  { code: 'NantouCounty', name: '南投縣', lat: 23.9610, lng: 120.9719, hasDynamic: false },
  { code: 'YunlinCounty', name: '雲林縣', lat: 23.7092, lng: 120.4313, hasDynamic: false },
  { code: 'Chiayi', name: '嘉義市 *', lat: 23.4800, lng: 120.4491, hasDynamic: true },
  { code: 'ChiayiCounty', name: '嘉義縣', lat: 23.4518, lng: 120.2555, hasDynamic: false },
  { code: 'Tainan', name: '臺南市 *', lat: 22.9997, lng: 120.2270, hasDynamic: true },
  { code: 'Kaohsiung', name: '高雄市 *', lat: 22.6272, lng: 120.3014, hasDynamic: true },
  { code: 'PingtungCounty', name: '屏東縣 *', lat: 22.6713, lng: 120.4880, hasDynamic: true },
  { code: 'YilanCounty', name: '宜蘭縣', lat: 24.7021, lng: 121.7377, hasDynamic: false },
  { code: 'HualienCounty', name: '花蓮縣', lat: 23.9872, lng: 121.6016, hasDynamic: false },
  { code: 'TaitungCounty', name: '臺東縣', lat: 22.7583, lng: 121.1444, hasDynamic: false },
  { code: 'PenghuCounty', name: '澎湖縣', lat: 23.5711, lng: 119.5793, hasDynamic: false },
  { code: 'KinmenCounty', name: '金門縣', lat: 24.4403, lng: 118.3235, hasDynamic: false },
  { code: 'LienchiangCounty', name: '連江縣', lat: 26.1505, lng: 119.9264, hasDynamic: false },
];

const leafletStyle = `
  .custom-marker { background: transparent; border: none; }
  .marker-pin {
    width: 42px; height: 42px; border-radius: 50% 50% 50% 0;
    position: absolute; transform: rotate(-45deg);
    left: 50%; top: 50%; margin: -21px 0 0 -21px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
    cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 3px solid #ffffff;
  }
  .marker-pin:hover { transform: rotate(-45deg) scale(1.15); z-index: 999 !important; }
  .marker-text {
    position: absolute; z-index: 10; font-weight: 900; font-size: 14px;
    transform: rotate(45deg); color: #0f172a; text-shadow: 0 0 2px white;
  }
  .marker-pin.small { width: 26px; height: 26px; margin: -13px 0 0 -13px; border: 2px solid #ffffff; }
  .marker-pin.small .marker-text { font-size: 11px; font-weight: 600; }
  .marker-pin::after { content: ''; width: 26px; height: 26px; margin: 8px 0 0 8px; background: #ffffff; position: absolute; border-radius: 50%; }
  .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border-radius: 24px; color: white; border: 1px solid rgba(56, 189, 248, 0.3); }
  
  .custom-user-marker { background: transparent; border: none; }
  .user-pulse {
    background: #ff3333; width: 18px; height: 18px; border-radius: 50%;
    border: 3px solid white; box-shadow: 0 0 20px rgba(255, 51, 51, 0.8);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.7); }
    70% { box-shadow: 0 0 0 18px rgba(255, 51, 51, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); }
  }
`;

// ---------------------------------------------------------
// 圓滾滾小企鵝 Logo (更加胖胖可愛版)
// ---------------------------------------------------------
const PenguinLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]">
    <defs>
      <linearGradient id="pBack" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: '#334155' }} /><stop offset="100%" style={{ stopColor: '#0f172a' }} /></linearGradient>
    </defs>
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
  const [currentCity, setCurrentCity] = useState(TAIWAN_CITIES[13]); // 預設台南
  const [allParkingData, setAllParkingData] = useState([]);
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); 
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef(new Map());
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => { document.title = "小企鵝停車雷達"; }, []);

  // 輔助函式：計算距離
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // 輔助函式：判斷最近縣市
  const findNearestCity = (lat, lng) => {
    let minD = Infinity; let nearest = TAIWAN_CITIES[13];
    TAIWAN_CITIES.forEach(c => {
      const d = calculateDistance(lat, lng, c.lat, c.lng);
      if (d < minD) { minD = d; nearest = c; }
    });
    return nearest;
  };

  // 1. 載入框架
  useEffect(() => {
    if (window.L && window.L.map) { setIsLeafletLoaded(true); return; }
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => setIsLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 2. 啟動與自動化排程邏輯 (修復地圖空白關鍵：移除 return Early)
  useEffect(() => {
    if (!isLeafletLoaded) return;

    // A. 導入時定位判定縣市
    const runStartup = () => {
      if (!navigator.geolocation) {
        setIsInitializing(false);
        fetchParkingData(currentCity.code);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          const city = findNearestCity(loc.lat, loc.lng);
          setUserLocation(loc);
          setCurrentCity(city);
          fetchParkingData(city.code);
          setIsInitializing(false);
        },
        () => {
          setIsInitializing(false);
          fetchParkingData(currentCity.code);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    runStartup();

    // B. 每 20 秒更新紅點定位
    const locInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((p) => {
        setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
      }, null, { enableHighAccuracy: true });
    }, 20000);

    // C. 每 60 秒更新停車資料
    const dataInterval = setInterval(() => {
      fetchParkingData(currentCity.code, true);
    }, 60000);

    // D. 每 60 秒同步中心至 5km 範圍
    const mapSyncInterval = setInterval(() => {
      if (userLocation && mapInstanceRef.current) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, { animate: true });
      }
    }, 60000);

    return () => {
      clearInterval(locInterval);
      clearInterval(dataInterval);
      clearInterval(mapSyncInterval);
    };
  }, [isLeafletLoaded, currentCity.code]);

  // 3. 地圖初始化邏輯 (關鍵修復：監聽 isInitializing)
  useEffect(() => {
    if (isLeafletLoaded && !isInitializing && mapContainerRef.current && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([currentCity.lat, currentCity.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
      
      // 強制修正地圖尺寸
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [isLeafletLoaded, isInitializing]);

  // 4. 資料處理與泡泡顯示 (確保不因 false is not iterable 崩潰)
  useEffect(() => {
    const dataArray = Array.isArray(allParkingData) ? allParkingData : [];
    
    const processed = dataArray.map(lot => {
      const total = lot?.total && typeof lot.total !== 'object' ? Number(lot.total) : 0;
      const available = lot?.available && typeof lot.available !== 'object' ? Number(lot.available) : -1;
      const isUnknown = (available === -1 || isNaN(available));
      const lat = Number(lot?.lat);
      const lng = Number(lot?.lng);
      
      let color = '#94a3b8'; // 預設灰色
      let percentage = total > 0 ? available / total : 1; 

      if (!isUnknown) {
        if (available === 0) color = '#f43f5e';
        else if (total > 0) {
          if (percentage < 0.1) color = '#f43f5e';
          else if (percentage < 0.3) color = '#f59e0b';
          else color = '#10b981';
        } else color = '#10b981'; 
      }

      return { 
        ...lot, lat, lng, total, available, color, isUnknown,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng) : null 
      };
    });

    const filtered = processed.filter(lot => lot.distance !== null && lot.distance <= SEARCH_RADIUS_KM).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setParkingData(filtered.length > 0 ? filtered : processed.slice(0, 100));
    
  }, [allParkingData, userLocation]);

  // 5. 數據抓取
  const fetchParkingData = async (cityCode, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const url = new URL(API_BASE);
      url.searchParams.append('route', 'parking');
      url.searchParams.append('city', cityCode);
      const res = await fetch(url.toString());
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data)) {
        setAllParkingData(result.data);
      } else {
        setAllParkingData([]);
      }
    } catch (e) {
      setAllParkingData([]);
    } finally { setLoading(false); }
  };

  // 6. UI 事件
  const handleCityChange = (e) => {
    const selected = TAIWAN_CITIES.find(c => c.code === e.target.value);
    if (!selected) return;
    setCurrentCity(selected);
    if (mapInstanceRef.current) mapInstanceRef.current.setView([selected.lat, selected.lng], 13, { animate: true });
    fetchParkingData(selected.code);
  };

  const handleNavigate = (lat, lng, name) => {
    const utterance = new SpeechSynthesisUtterance(`小企鵝即刻為您導航至 ${String(name)}。`);
    utterance.lang = 'zh-TW';
    window.speechSynthesis.speak(utterance);
    setTimeout(() => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank'); }, 1800);
  };

  useEffect(() => { window.handleNavigateGlobal = handleNavigate; return () => { delete window.handleNavigateGlobal; }; }, []);

  // 7. 標記渲染同步
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L; const map = mapInstanceRef.current; const currentMarkers = markersRef.current;
    const dataToRender = Array.isArray(parkingData) ? parkingData : [];
    
    const activeIds = new Set(dataToRender.map(l => String(l.id)));
    currentMarkers.forEach((marker, id) => { if (!activeIds.has(String(id))) { map.removeLayer(marker); currentMarkers.delete(id); } });

    dataToRender.forEach(lot => {
      const iconSettings = { 
        className: 'custom-marker', 
        html: `<div class="marker-pin ${lot.isUnknown ? 'small' : ''}" style="background-color: ${lot.color};"><span class="marker-text">${lot.isUnknown ? '?' : lot.available}</span></div>`, 
        iconSize: lot.isUnknown ? [26, 26] : [42, 42], iconAnchor: lot.isUnknown ? [21, 42] : [21, 42], popupAnchor: [0, -42] 
      };

      const popupHtml = `
        <div style="min-width: 210px; padding: 10px; color: white;">
          <b style="font-size:16px; color:#38bdf8;">${String(lot.name)}</b>
          <div style="font-size:11px; margin: 5px 0; color: #94a3b8;">總位數: ${lot.total || '未知'} | 距離: ${lot.distance ? Number(lot.distance).toFixed(1) : '?'}km</div>
          <div style="margin: 8px 0; font-size:12px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; border-left: 3px solid #38bdf8;">${String(lot.fare)}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid #334155; padding-top:10px;">
             <div><span style="font-size:22px; font-weight:900; color:${lot.color};">${lot.isUnknown ? '?' : lot.available}</span> <small>位</small></div>
             <button onclick="window.handleNavigateGlobal(${lot.lat}, ${lot.lng}, '${lot.name}')" style="background:#38bdf8; color:#0f172a; border:none; padding:6px 12px; border-radius:8px; font-weight:bold; cursor:pointer;">導航</button>
          </div>
        </div>
      `;

      if (currentMarkers.has(String(lot.id))) {
        const marker = currentMarkers.get(String(lot.id));
        marker.setIcon(L.divIcon(iconSettings)).getPopup().setContent(popupHtml);
      } else {
        const marker = L.marker([lot.lat, lot.lng], { icon: L.divIcon(iconSettings) }).bindPopup(popupHtml).addTo(map);
        currentMarkers.set(String(lot.id), marker);
      }
    });

    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      else userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: L.divIcon({ className: 'custom-user-marker', html: `<div class="user-pulse"></div>`, iconSize: [18, 18] }), zIndexOffset: 1000 }).addTo(map);
    }
  }, [parkingData, userLocation]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans text-slate-100 relative overflow-hidden">
      <style>{leafletStyle}</style>

      {/* 初始啟動全屏 Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 z-[5000] bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-10 text-center">
          <div className="relative mb-10">
            <PenguinLogo />
            <div className="absolute inset-0 animate-ping rounded-full border-4 border-sky-500/30 scale-150"></div>
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">小企鵝雷達啟動中</h1>
          <p className="text-slate-500 text-sm animate-pulse">正在掃描衛星位置並載入縣市資料...</p>
        </div>
      )}

      {/* 標題與選單控制項 */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-sky-500/30">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <PenguinLogo />
            <div>
              <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 leading-none">小企鵝停車雷達</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">運動偵測模式</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => fetchParkingData(currentCity.code)} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 active:scale-95"><RotateCw size={18} className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </div>
        
        <div className="flex gap-3 h-10">
          <div className="relative flex-1">
            <select value={currentCity.code} onChange={handleCityChange} className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 text-xs font-bold text-white appearance-none focus:outline-none focus:border-sky-500">
              {TAIWAN_CITIES.map(c => <option key={c.code} value={c.code} className="text-slate-900">{String(c.name)}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" size={14} />
          </div>
          <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700">
            <button onClick={() => setViewMode('map')} className={`px-4 rounded-lg text-[10px] font-black transition-all ${viewMode === 'map' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}>雷達</button>
            <button onClick={() => setViewMode('list')} className={`px-4 rounded-lg text-[10px] font-black transition-all ${viewMode === 'list' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}>清單</button>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1 opacity-80">
          <Zap size={10} className="text-sky-400" /> 標註 * 號之縣市提供即時車位查詢
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-900">
        <div className={`absolute inset-0 ${viewMode === 'map' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
           <div ref={mapContainerRef} className="w-full h-full" />
           {loading && <div className="absolute top-40 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 px-4 py-2 rounded-full border border-sky-500 text-sky-400 text-xs font-bold shadow-2xl animate-bounce">掃描中...</div>}
        </div>
        <div className={`absolute inset-0 bg-slate-900 overflow-y-auto px-4 pt-48 pb-10 transition-transform duration-500 ${viewMode === 'list' ? 'translate-y-0 z-20' : 'translate-y-full'}`}>
           <div className="space-y-3">
             {parkingData.map(lot => (
               <div key={String(lot.id)} onClick={() => { setViewMode('map'); if(mapInstanceRef.current) mapInstanceRef.current.setView([lot.lat, lot.lng], 16, {animate:true}); }} className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700 active:scale-95 transition-all">
                 <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded font-mono">#{String(lot.id).slice(-4)}</span>
                        {lot.distance && <span className="text-[10px] font-black text-indigo-400">📡 {Number(lot.distance).toFixed(1)} km</span>}
                      </div>
                      <h3 className="font-black text-slate-100 text-base">{String(lot.name)}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{lot.address}</p>
                    </div>
                    <div className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border-2 ${Number(lot.available) < 10 && !lot.isUnknown ? 'border-rose-500 text-rose-500' : 'border-emerald-500 text-emerald-500'}`}>
                      <span className="text-xl font-black" style={{ color: lot.color }}>{lot.isUnknown ? '?' : Number(lot.available)}</span>
                      <span className="text-[8px] font-bold uppercase">Seats</span>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}