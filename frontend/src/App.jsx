import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation, RotateCw, Car, MapPin, List, Database, ChevronDown, Coins, LocateFixed, Zap, Info, X } from 'lucide-react';

// ---------------------------------------------------------
// 縣市中心點座標對照表
// ---------------------------------------------------------
const TAIWAN_CITIES = [
  { code: 'Keelung', name: '基隆市', lat: 25.1276, lng: 121.7392 },
  { code: 'Taipei', name: '臺北市', lat: 25.0330, lng: 121.5654 },
  { code: 'NewTaipei', name: '新北市', lat: 25.0169, lng: 121.4627 },
  { code: 'Taoyuan', name: '桃園市', lat: 24.9936, lng: 121.3009 },
  { code: 'Hsinchu', name: '新竹市', lat: 24.8138, lng: 120.9674 },
  { code: 'HsinchuCounty', name: '新竹縣', lat: 24.8397, lng: 121.0113 },
  { code: 'YilanCounty', name: '宜蘭縣', lat: 24.7021, lng: 121.7377 },
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
  .marker-pin.small::after { width: 16px; height: 16px; margin: 5px 0 0 5px; }
  
  .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid rgba(56, 189, 248, 0.3); color: white; }
  .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); }
  
  .custom-user-marker { background: transparent; border: none; }
  .user-pulse {
    background: #ff3333; width: 18px; height: 18px; border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 20px rgba(255, 51, 51, 0.8);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.8); }
    70% { box-shadow: 0 0 0 18px rgba(255, 51, 51, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); }
  }
  .btn-locate-glow {
    background: #ff3333 !important;
    color: white !important;
    border-color: #ff6666 !important;
    box-shadow: 0 0 15px rgba(255, 51, 51, 0.5) !important;
  }
`;

const PenguinLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]">
    <defs>
      <linearGradient id="pBody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: '#334155' }} /><stop offset="100%" style={{ stopColor: '#0f172a' }} /></linearGradient>
      <linearGradient id="pBelly" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style={{ stopColor: '#ffffff' }} /><stop offset="100%" style={{ stopColor: '#e2e8f0' }} /></linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="15 10" className="animate-[spin_8s_linear_infinite] opacity-60" />
    <path d="M50 15 C35 15 28 30 28 55 C28 75 38 88 50 88 C62 88 72 75 72 55 C72 30 65 15 50 15 Z" fill="url(#pBody)" />
    <path d="M50 32 C40 32 35 42 35 58 C35 73 42 82 50 82 C58 82 65 73 65 58 C65 42 60 32 50 32 Z" fill="url(#pBelly)" />
    <circle cx="43" cy="40" r="2.5" fill="#0f172a" /><circle cx="57" cy="40" r="2.5" fill="#0f172a" />
    <path d="M46 48 L54 48 L50 56 Z" fill="#f59e0b" />
  </svg>
);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ---------------------------------------------------------
// 語音播報邏輯
// ---------------------------------------------------------
const penguinSpeak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.rate = 1.0;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
};

const API_BASE = 'https://script.google.com/macros/s/AKfycbzB4JwfxZlnkysWOSDQ9Fpp-PaPvo4bOk95Wi9Gh8TV-bH35gukiFG0xfHlEQqOX8hQ/exec';
const SEARCH_RADIUS_KM = 5; 
const AUTO_REFRESH_INTERVAL = 60000; 

export default function App() {
  // 1. 狀態宣告 (State Declaration)
  const [currentCity, setCurrentCity] = useState(TAIWAN_CITIES[14]); 
  const [allParkingData, setAllParkingData] = useState([]);
  const [parkingData, setParkingData] = useState([]); // 被過濾後的顯示資料
  const [loading, setLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [dataSource, setDataSource] = useState('正在初始化雷達...');
  const [userLocation, setUserLocation] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef(new Map()); 
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => { document.title = "小企鵝停車雷達"; }, []);

  // 2. 載入 Leaflet 引擎
  useEffect(() => {
    if (window.L && window.L.map) { setIsLeafletLoaded(true); return; }
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => setIsLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  const findNearestCity = (lat, lng) => {
    let minDistance = Infinity;
    let nearest = TAIWAN_CITIES[14];
    TAIWAN_CITIES.forEach(city => {
      const dist = calculateDistance(lat, lng, city.lat, city.lng);
      if (dist < minDistance) { minDistance = dist; nearest = city; }
    });
    return nearest;
  };

  // 3. 核心啟動邏輯：[定位優先 ➜ 判定城市 ➜ 抓取全區資料]
  useEffect(() => {
    if (!isLeafletLoaded) return;
    if (navigator.geolocation) {
      setDataSource('正在掃描您的座標...');
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          const city = findNearestCity(loc.lat, loc.lng);
          setUserLocation(loc);
          setCurrentCity(city);
          fetchParkingData(city.code);
          if (mapInstanceRef.current) mapInstanceRef.current.setView([loc.lat, loc.lng], 14, { animate: true });
          penguinSpeak(`已定位至 ${city.name}，正在同步全區資訊。`);
        },
        () => fetchParkingData(currentCity.code),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
      const id = navigator.geolocation.watchPosition((p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }), null, { enableHighAccuracy: true });
      return () => navigator.geolocation.clearWatch(id);
    } else fetchParkingData(currentCity.code);
  }, [isLeafletLoaded]);

  // 4. 初始化地圖
  useEffect(() => {
    if (isLeafletLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([currentCity.lat, currentCity.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }
  }, [isLeafletLoaded]);

  // 5. 定時自動更新
  useEffect(() => {
    const timer = setInterval(() => { if (currentCity) fetchParkingData(currentCity.code, true); }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [currentCity]);

  // 6. 更新紅點
  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
        icon: L.divIcon({ className: 'custom-user-marker', html: `<div class="user-pulse"></div>`, iconSize: [18, 18] }), 
        zIndexOffset: 1000 
      }).bindPopup("<span style='color:#0f172a; font-weight:bold;'>小企鵝目前位置</span>").addTo(mapInstanceRef.current);
    }
  }, [userLocation]);

  // 7. 數據篩選邏輯 (決定 parkingData)
  useEffect(() => {
    if (allParkingData.length === 0) return;
    if (userLocation) {
      const filtered = allParkingData.map(lot => ({ ...lot, distance: calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng) }))
        .filter(lot => lot.distance <= SEARCH_RADIUS_KM).sort((a, b) => a.distance - b.distance);
      setParkingData(filtered);
    } else {
      setParkingData([...allParkingData].sort((a, b) => (b.available || 0) - (a.available || 0)).slice(0, 50));
    }
  }, [userLocation, allParkingData]);

  // 8. 數據抓取函式
  const fetchParkingData = async (cityCode, isBackground = false) => {
    if (isBackground) setIsAutoRefreshing(true); 
    else { setLoading(true); setDataSource('發射雷達掃描波...'); }
    try {
      const url = new URL(API_BASE); url.searchParams.append('route', 'parking'); url.searchParams.append('city', cityCode);
      const res = await fetch(url.toString()); const result = await res.json();
      if (result.success) {
        setDataSource(`連線成功`);
        setAllParkingData(result.data.map(d => ({ ...d, type: 'parking' })));
      }
    } catch (e) {
      if (!isBackground) setDataSource('模擬模式');
    } finally { setLoading(false); setIsAutoRefreshing(false); }
  };

  const handleNavigate = (lat, lng, name) => {
    penguinSpeak(`小企鵝即刻為您導航至 ${name}。`);
    setTimeout(() => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank'); }, 2000);
  };

  useEffect(() => { window.handleNavigateGlobal = handleNavigate; return () => { delete window.handleNavigateGlobal; }; }, []);

  const handleSelectLot = (lot) => {
    const distText = lot.distance ? `距離您約 ${lot.distance.toFixed(1)} 公里。` : '正在計算距離。';
    const fareText = lot.fare && lot.fare !== '無資訊' ? `費率為：${lot.fare}。` : '費率詳洽現場。';
    penguinSpeak(`${lot.name}。${distText}${fareText}`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lot.lat, lot.lng], 16, { animate: true });
      const marker = markersRef.current.get(lot.id.toString());
      if (marker) marker.openPopup();
    }
  };

  // 9. 標記同步
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L; const map = mapInstanceRef.current; const currentMarkers = markersRef.current;
    const activeIds = new Set(parkingData.map(l => l.id.toString()));
    currentMarkers.forEach((marker, id) => { if (!activeIds.has(id.toString())) { map.removeLayer(marker); currentMarkers.delete(id); } });

    parkingData.forEach(lot => {
      const percentage = lot.total > 0 ? lot.available / lot.total : 0;
      let color = '#94a3b8'; let isSmall = lot.available === -1;
      if (!isSmall) {
        if (lot.total === 0 || percentage < 0.1 || lot.available === 0) color = '#f43f5e';
        else if (percentage < 0.3) color = '#f59e0b';
        else color = '#10b981';
      }
      const iconSettings = { className: 'custom-marker', html: `<div class="marker-pin ${isSmall ? 'small' : ''}" style="background-color: ${color};"><span class="marker-text">${isSmall ? '?' : lot.available}</span></div>`, iconSize: isSmall ? [26, 26] : [42, 42], iconAnchor: isSmall ? [13, 13] : [21, 42], popupAnchor: isSmall ? [0, -13] : [0, -42] };
      const popupHtml = `
        <div style="min-width: 210px; text-align: left; padding: 12px; color: white;">
          <div style="margin-bottom:8px;"><b style="font-size:16px; color:#38bdf8;">${lot.name}</b></div>
          <div style="color:#94a3b8; font-size:12px; margin-bottom:4px; display:flex; justify-content:space-between;">
             <span>📡 距離: ${lot.distance?.toFixed(1) || '...'} km</span>
             <span>🏢 總車位: ${lot.total || '未知'}</span>
          </div>
          <div style="margin: 8px 0; font-size:12px; line-height:1.5; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px; border-left: 4px solid #38bdf8;"><b>費率:</b> ${lot.fare || '現場為準'}</div>
          <div style="display:flex; justify-content:space-between; align-items:end; border-top: 1px solid rgba(255,255,255,0.1); padding-top:12px; margin-top:8px;">
             <div><div style="font-size:10px; color:#64748b; text-transform:uppercase;">剩餘位子</div><div style="font-size:24px; font-weight:900; color:${color}; line-height:1;">${lot.available === -1 ? '?' : lot.available}</div></div>
             <button onclick="window.handleNavigateGlobal(${lot.lat}, ${lot.lng}, '${lot.name}')" style="background: #38bdf8; color:#0f172a; border:none; padding:8px 18px; border-radius:12px; cursor:pointer; font-weight:bold; font-size:14px;">導航 GO</button>
          </div>
        </div>
      `;
      if (currentMarkers.has(lot.id.toString())) { const marker = currentMarkers.get(lot.id.toString()); marker.setIcon(L.divIcon(iconSettings)); marker.getPopup().setContent(popupHtml); }
      else { const marker = L.marker([lot.lat, lot.lng], { icon: L.divIcon(iconSettings) }).bindPopup(popupHtml).on('click', (e) => { L.DomEvent.stopPropagation(e); handleSelectLot(lot); }).addTo(map); currentMarkers.set(lot.id.toString(), marker); }
    });
  }, [parkingData]);

  // 10. UI 渲染 (UI Rendering)
  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans text-slate-100 relative overflow-hidden">
      <style>{leafletStyle}</style>

      {/* 科技感標題欄 */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-sky-500/30 shadow-[0_0_20px_rgba(0,165,233,0.2)] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PenguinLogo />
            <div>
              <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 leading-none">小企鵝停車雷達</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isAutoRefreshing ? 'bg-sky-400 animate-ping' : 'bg-sky-500'}`}></div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{currentCity.name} · 全區偵測中</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => { if(navigator.geolocation) { setLoading(true); navigator.geolocation.getCurrentPosition((p) => { const loc={lat:p.coords.latitude, lng:p.coords.longitude}; setUserLocation(loc); mapInstanceRef.current.setView([loc.lat, loc.lng], 15, {animate:true}); setLoading(false); penguinSpeak("已重新校準雷達座標。"); }, () => setLoading(false)); } }} className={`p-2.5 rounded-xl border transition-all ${userLocation ? 'btn-locate-glow' : 'bg-slate-800 border-slate-700 text-slate-400'}`}><LocateFixed size={20} /></button>
             <button onClick={() => fetchParkingData(currentCity.code)} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 transition-all active:bg-slate-700"><RotateCw size={20} className={loading ? 'animate-spin' : ''} /></button>
             <button onClick={() => setShowInstructions(true)} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 transition-all hover:bg-slate-700"><Info size={20} /></button>
          </div>
        </div>
        
        <div className="flex gap-3 h-11">
          <div className="flex-1 flex items-center px-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-sky-400"><Zap size={14} className="mr-2" /> 自動偵測模式已開啟</div>
          <div className="bg-slate-800/50 p-1 rounded-2xl flex border border-slate-700">
            <button onClick={() => setViewMode('map')} className={`px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}><MapIcon size={14} /> 雷達</button>
            <button onClick={() => setViewMode('list')} className={`px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}><List size={14} /> 推薦</button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-900">
        <div className={`absolute inset-0 ${viewMode === 'map' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
           <div ref={mapContainerRef} className="w-full h-full" />
           {loading && <div className="absolute top-48 left-0 right-0 flex justify-center z-50"><div className="bg-slate-900/80 px-6 py-3 rounded-full border border-sky-500 text-sky-400 font-bold animate-pulse shadow-lg">發射雷達波中...</div></div>}
        </div>
        <div className={`absolute inset-0 bg-slate-900 overflow-y-auto px-4 pt-48 pb-10 transition-transform duration-500 ${viewMode === 'list' ? 'translate-y-0 z-20' : 'translate-y-full'}`}>
           <div className="space-y-4">
             {parkingData.map(lot => (
               <div key={lot.id} onClick={() => handleSelectLot(lot)} className="bg-slate-800/60 backdrop-blur-md p-5 rounded-3xl border border-slate-700 hover:border-sky-500/50 transition-all active:scale-95 group">
                 <div className="flex justify-between items-start">
                    <div className="flex-1 mr-3">
                      <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">#{lot.id.toString().slice(-4)}</span>{lot.distance && <span className="text-xs font-black text-indigo-400">📡 {lot.distance.toFixed(1)} KM</span>}</div>
                      <h3 className="font-black text-slate-100 text-lg group-hover:text-sky-400 transition-colors">{lot.name}</h3>
                      <div className="flex gap-4 mt-2">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Car size={12} /> 總車位: {lot.total || '未知'}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} /> {lot.address || '座標鎖定中'}</p>
                      </div>
                    </div>
                    <div className={`flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-2xl border-2 ${lot.available < 10 ? 'border-rose-500 text-rose-500' : 'border-emerald-500 text-emerald-500'}`}>
                      <span className="text-2xl font-black">{lot.available === -1 ? '?' : lot.available}</span>
                      <span className="text-[10px] font-bold">Seats</span>
                    </div>
                 </div>
                 <button onClick={(e) => { e.stopPropagation(); handleNavigate(lot.lat, lot.lng, lot.name); }} className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-slate-900 py-3 rounded-2xl text-sm font-black flex justify-center items-center gap-2 transition-all"><Navigation size={18} fill="currentColor" /> 即刻導航</button>
               </div>
             ))}

             {/* 無資料顯示邏輯 */}
             {parkingData.length === 0 && !loading && (
               <div className="text-center py-20 px-10 text-slate-500">
                 <div className="text-4xl mb-4">🔍</div>
                 <p className="font-bold text-slate-300">雷達半徑 {SEARCH_RADIUS_KM}km 內未偵測到連網場站</p>
                 <p className="text-xs mt-2 leading-relaxed text-slate-400">
                   歸仁、仁德、大灣等地區多為非連網平面場站，政府 API 暫無即時數據提供。建議尋找路邊停車格。
                 </p>
                 <button 
                   onClick={() => fetchParkingData(currentCity.code)} 
                   className="mt-6 px-6 py-2 border border-sky-500 text-sky-400 rounded-full text-xs hover:bg-sky-500/10 transition-all"
                 >
                   嘗試擴大掃描全縣市
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>

      {showInstructions && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-slate-800 border border-sky-500/50 rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(14,165,233,0.3)] animate-in zoom-in duration-300">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><div className="bg-sky-500/20 p-2 rounded-xl"><Info className="text-sky-400" size={24} /></div><h2 className="text-xl font-black text-white">雷達操作手冊</h2></div>
                <button onClick={() => setShowInstructions(false)} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
                <div className="flex gap-4 p-3 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <div className="text-2xl">📱</div>
                  <div><p className="font-bold text-sky-400 mb-1">最佳運作環境</p><p className="text-xs leading-relaxed">建議使用手機連線 4G/5G 網路，並允許存取位置。系統會先定位城市顯示全區資料，再啟動 5KM 雷達偵測。</p></div>
                </div>
                <div className="flex gap-4 p-3 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <div className="text-2xl">🐧</div>
                  <div><p className="font-bold text-sky-400 mb-1">智慧語音助教</p><p>點擊停車場小企鵝會為您播報距離與費率。按下導航時也會有語音確認。</p></div>
                </div>
                <div className="flex gap-4 p-3 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <div className="text-2xl">📍</div>
                  <div><p className="font-bold text-red-500 mb-1">紅色定位按鈕</p><p>若視野偏移，點擊右上方紅色實心按鈕可重新鎖定座標。地圖紅點代表您的即時位置。</p></div>
                </div>
              </div>
              <button onClick={() => { setShowInstructions(false); penguinSpeak("小企鵝雷達掃描啟動中，請允許位置存取。"); }} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-[0_10px_20px_rgba(56,189,248,0.3)]">啟動掃描</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}