import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation, RotateCw, Car, MapPin, List, Database, ChevronDown, Coins, LocateFixed, Zap, Info, X } from 'lucide-react';

// ---------------------------------------------------------
// 縣市選單 (依北而南, 西而東排列)
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
  .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border-radius: 24px; color: white; }
  
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
  .btn-locate-glow {
    background: #ff3333 !important; color: white !important;
    border-color: #ff6666 !important; box-shadow: 0 0 15px rgba(255, 51, 51, 0.5) !important;
  }
`;

const PenguinLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="15 10" className="animate-[spin_8s_linear_infinite] opacity-60" />
    <path d="M50 15 C35 15 28 30 28 55 C28 75 38 88 50 88 C62 88 72 75 72 55 C72 30 65 15 50 15 Z" fill="#1e293b" />
    <path d="M50 32 C40 32 35 42 35 58 C35 73 42 82 50 82 C58 82 65 73 65 58 C65 42 60 32 50 32 Z" fill="#ffffff" />
    <circle cx="43" cy="40" r="2.5" fill="#0f172a" /><circle cx="57" cy="40" r="2.5" fill="#0f172a" />
    <path d="M46 48 L54 48 L50 56 Z" fill="#f59e0b" />
  </svg>
);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const penguinSpeak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = 'zh-TW';
  utterance.rate = 1.0;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
};

const API_BASE = 'https://script.google.com/macros/s/AKfycbzB4JwfxZlnkysWOSDQ9Fpp-PaPvo4bOk95Wi9Gh8TV-bH35gukiFG0xfHlEQqOX8hQ/exec';
const SEARCH_RADIUS_KM = 3; 

export default function App() {
  const [currentCity, setCurrentCity] = useState(TAIWAN_CITIES[13]); // 預設台南
  const [allParkingData, setAllParkingData] = useState([]);
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [userLocation, setUserLocation] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false); // 預設關閉說明
  const [isLocatingEnabled, setIsLocatingEnabled] = useState(false); 
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef(new Map()); 
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => { document.title = "小企鵝停車雷達"; }, []);

  // 1. 載入 Leaflet
  useEffect(() => {
    if (window.L && window.L.map) { setIsLeafletLoaded(true); return; }
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => setIsLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 2. 啟動邏輯：靜默載入台南資料，不主動定位
  useEffect(() => {
    if (isLeafletLoaded) {
      fetchParkingData(currentCity.code);
    }
  }, [isLeafletLoaded]);

  // 3. 初始化地圖
  useEffect(() => {
    if (isLeafletLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([currentCity.lat, currentCity.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }
  }, [isLeafletLoaded]);

  // 4. 資料過濾與顏色判定邏輯 (核心修復)
  useEffect(() => {
    const dataArray = Array.isArray(allParkingData) ? allParkingData : [];
    
    let processed = dataArray.map(lot => {
      const total = parseInt(lot.total) || 0;
      const available = parseInt(lot.available);
      const isUnknown = (available === -1 || isNaN(available));
      
      let color = '#94a3b8'; // 預設灰色 (靜態資料)
      let percentage = total > 0 ? available / total : 1; 

      if (!isUnknown) {
        if (available === 0) {
          color = '#f43f5e'; // 紅色 (滿位)
        } else if (total > 0) {
          // 只有在總數明確且大於 0 的情況下才計算比例
          if (percentage < 0.1) color = '#f43f5e';
          else if (percentage < 0.3) color = '#f59e0b';
          else color = '#10b981';
        } else {
          // 修復重點：若無總量資訊但剩餘位子 > 0，強制顯示綠色
          color = '#10b981'; 
        }
      }

      return { 
        ...lot, total, available, color, isUnknown,
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng) : null 
      };
    });

    if (isLocatingEnabled && userLocation) {
      // 雷達模式：過濾 3km
      setParkingData(processed.filter(lot => lot.distance !== null && lot.distance <= SEARCH_RADIUS_KM).sort((a, b) => a.distance - b.distance));
    } else {
      // 瀏覽模式：顯示全區 (依車位排序)
      setParkingData([...processed].sort((a, b) => (b.available || 0) - (a.available || 0)));
    }
  }, [allParkingData, userLocation, isLocatingEnabled]);

  // 5. 數據抓取
  const fetchParkingData = async (cityCode) => {
    setLoading(true);
    try {
      const url = new URL(API_BASE);
      url.searchParams.append('route', 'parking');
      url.searchParams.append('city', cityCode);
      const res = await fetch(url.toString());
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data)) {
        setAllParkingData(result.data);
      } else setAllParkingData([]);
    } catch (e) {
      setAllParkingData([]);
    } finally { setLoading(false); }
  };

  // 6. 手動觸發定位按鈕
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        setUserLocation(loc);
        setIsLocatingEnabled(true);
        if (mapInstanceRef.current) mapInstanceRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
        setLoading(false);
        penguinSpeak("已定位，啟動 3 公里雷達。");
      },
      () => setLoading(false),
      { enableHighAccuracy: true }
    );
  };

  // 7. 切換縣市
  const handleCityChange = (e) => {
    const selected = TAIWAN_CITIES.find(c => c.code === e.target.value);
    if (!selected) return;
    setCurrentCity(selected);
    setIsLocatingEnabled(false); // 切換城市時自動切回瀏覽模式
    if (mapInstanceRef.current) mapInstanceRef.current.setView([selected.lat, selected.lng], 14, { animate: true });
    fetchParkingData(selected.code);
  };

  const handleNavigate = (lat, lng, name) => {
    penguinSpeak(`小企鵝即刻為您導航至 ${name}。`);
    setTimeout(() => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank'); }, 1800);
  };

  useEffect(() => { window.handleNavigateGlobal = handleNavigate; return () => { delete window.handleNavigateGlobal; }; }, []);

  const handleSelectLot = (lot) => {
    const distText = lot.distance ? `距離約 ${lot.distance.toFixed(1)} 公里。` : '';
    const fareText = lot.fare && lot.fare !== '無資訊' ? `費率為：${lot.fare}。` : '費率詳洽現場。';
    penguinSpeak(`${lot.name}。${distText}${fareText}`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lot.lat, lot.lng], 16, { animate: true });
      const marker = markersRef.current.get(lot.id.toString());
      if (marker) marker.openPopup();
    }
  };

  // 8. 標記與紅點同步
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L; const map = mapInstanceRef.current; const currentMarkers = markersRef.current;
    
    const activeIds = new Set(parkingData.map(l => l.id.toString()));
    currentMarkers.forEach((marker, id) => { if (!activeIds.has(id.toString())) { map.removeLayer(marker); currentMarkers.delete(id); } });

    parkingData.forEach(lot => {
      const isSmall = lot.isUnknown;
      const iconSettings = { 
        className: 'custom-marker', 
        html: `<div class="marker-pin ${isSmall ? 'small' : ''}" style="background-color: ${lot.color};"><span class="marker-text">${isSmall ? '?' : lot.available}</span></div>`, 
        iconSize: isSmall ? [26, 26] : [42, 42], iconAnchor: isSmall ? [13, 13] : [21, 42], popupAnchor: isSmall ? [0, -13] : [0, -42] 
      };

      const popupHtml = `
        <div style="min-width: 210px; text-align: left; padding: 12px; color: white;">
          <div style="margin-bottom:8px;"><b style="font-size:16px; color:#38bdf8;">${String(lot.name)}</b></div>
          <div style="color:#94a3b8; font-size:11px; margin-bottom:4px; display:flex; justify-content:space-between;">
             <span>🏢 總格數: ${lot.total || '未知'}</span>
             <span>📡 ${lot.distance ? lot.distance.toFixed(1) + ' km' : '全區瀏覽'}</span>
          </div>
          <div style="margin: 8px 0; font-size:12px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; border-left: 4px solid #38bdf8;">${String(lot.fare || '現場為準')}</div>
          <div style="display:flex; justify-content:space-between; align-items:end; border-top: 1px solid rgba(255,255,255,0.1); padding-top:12px;">
             <div><div style="font-size:9px; color:#64748b;">剩餘位子</div><div style="font-size:22px; font-weight:900; color:${lot.color};">${lot.isUnknown ? '?' : lot.available}</div></div>
             <button onclick="window.handleNavigateGlobal(${lot.lat}, ${lot.lng}, '${lot.name}')" style="background:#38bdf8; color:#0f172a; border:none; padding:8px 16px; border-radius:12px; font-weight:bold; cursor:pointer;">導航 GO</button>
          </div>
        </div>
      `;

      if (currentMarkers.has(lot.id.toString())) {
        const marker = currentMarkers.get(lot.id.toString());
        marker.setIcon(L.divIcon(iconSettings)).getPopup().setContent(popupHtml);
      } else {
        const marker = L.marker([lot.lat, lot.lng], { icon: L.divIcon(iconSettings) }).bindPopup(popupHtml).on('click', (e) => { L.DomEvent.stopPropagation(e); handleSelectLot(lot); }).addTo(map);
        currentMarkers.set(lot.id.toString(), marker);
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

      {/* 標題與導覽列 */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-sky-500/30">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <PenguinLogo />
            <div>
              <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 leading-none">小企鵝停車雷達</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-sky-400 animate-ping' : 'bg-sky-500'}`}></div>
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">{isLocatingEnabled ? '3KM 雷達模式' : '全縣市瀏覽'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={handleLocateMe} title="手動定位掃描" className={`p-2.5 rounded-xl border transition-all ${userLocation ? 'btn-locate-glow' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><LocateFixed size={18} /></button>
             <button onClick={() => fetchParkingData(currentCity.code)} title="重新整理" className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 transition-all active:bg-slate-700"><RotateCw size={18} className={loading ? 'animate-spin' : ''} /></button>
             <button onClick={() => setShowInstructions(true)} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 transition-all hover:bg-slate-700"><Info size={18} /></button>
          </div>
        </div>
        
        <div className="flex gap-3 h-10">
          <div className="relative flex-1">
            <select 
              value={currentCity.code} 
              onChange={handleCityChange}
              className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 text-xs font-bold text-sky-400 appearance-none focus:outline-none focus:border-sky-500"
            >
              {TAIWAN_CITIES.map(c => <option key={c.code} value={c.code}>{String(c.name)}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" size={14} />
          </div>
          <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700">
            <button onClick={() => setViewMode('map')} className={`px-4 rounded-lg text-[10px] font-black transition-all ${viewMode === 'map' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}>雷達</button>
            <button onClick={() => setViewMode('list')} className={`px-4 rounded-lg text-[10px] font-black transition-all ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}>推薦</button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-900">
        <div className={`absolute inset-0 ${viewMode === 'map' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
           <div ref={mapContainerRef} className="w-full h-full" />
           {loading && <div className="absolute top-40 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 px-4 py-2 rounded-full border border-sky-500 text-sky-400 text-xs font-bold">發射掃描波...</div>}
        </div>
        <div className={`absolute inset-0 bg-slate-900 overflow-y-auto px-4 pt-40 pb-10 transition-transform duration-500 ${viewMode === 'list' ? 'translate-y-0 z-20' : 'translate-y-full'}`}>
           <div className="space-y-3">
             {parkingData.map(lot => (
               <div key={lot.id} onClick={() => handleSelectLot(lot)} className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700 active:scale-95 transition-all">
                 <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">#{String(lot.id).slice(-4)}</span>
                        {lot.distance && <span className="text-[10px] font-black text-indigo-400">📡 {Number(lot.distance).toFixed(1)} km</span>}
                      </div>
                      <h3 className="font-black text-slate-100 text-base">{String(lot.name)}</h3>
                      <div className="flex gap-3 mt-2">
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><Car size={10} /> 總車位: {Number(lot.total) || '未知'}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate"><MapPin size={10} /> {String(lot.address || '座標鎖定')}</p>
                      </div>
                    </div>
                    <div className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border-2 ${Number(lot.available) < 10 && !lot.isUnknown ? 'border-rose-500 text-rose-500' : 'border-emerald-500 text-emerald-500'}`}>
                      <span className="text-xl font-black" style={{ color: lot.color }}>{lot.isUnknown ? '?' : Number(lot.available)}</span>
                      <span className="text-[8px] font-bold uppercase">Seats</span>
                    </div>
                 </div>
               </div>
             ))}
             {parkingData.length === 0 && !loading && (
               <div className="text-center py-20 text-slate-500 text-xs px-10">
                 {isLocatingEnabled ? "周邊 3 公里內無連網場站資料" : "該區域目前無停車場資料"}
               </div>
             )}
           </div>
        </div>
      </div>

      {showInstructions && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-800 border border-sky-500/50 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><Info className="text-sky-400" size={24} /><h2 className="text-xl font-black text-white">操作手冊</h2></div>
                <button onClick={() => setShowInstructions(false)} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-4 text-xs text-slate-300">
                <p>1. 系統導入預設為台南市全區資料。</p>
                <p>2. 可使用上方下拉選單切換全台各縣市。</p>
                <p>3. 點選 <span className="text-red-500 font-bold">紅色定位按鈕</span> 才會啟動 GPS 並掃描周邊 3 公里空位。</p>
                <p>4. 灰色泡泡代表該場站無即時剩餘車位資訊。</p>
              </div>
              <button onClick={() => setShowInstructions(false)} className="w-full bg-sky-500 text-white font-black py-3 rounded-2xl">返回雷達</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}