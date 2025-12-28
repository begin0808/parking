import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation, RotateCw, Car, MapPin, List, Database, ChevronDown, Coins, LocateFixed, Zap } from 'lucide-react';

// ---------------------------------------------------------
// 縣市設定
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

// ---------------------------------------------------------
// 科技感樣式 CSS
// ---------------------------------------------------------
const leafletStyle = `
  .custom-marker { background: transparent; border: none; }
  
  .marker-pin {
    width: 42px; height: 42px; border-radius: 50% 50% 50% 0;
    position: absolute; transform: rotate(-45deg);
    left: 50%; top: 50%; margin: -21px 0 0 -21px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
    cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 3px solid #ffffff;
  }
  .marker-pin:hover { transform: rotate(-45deg) scale(1.2); z-index: 100; box-shadow: 0 0 20px rgba(0, 210, 255, 0.8); }
  
  .marker-text {
    position: absolute; z-index: 10; font-weight: 900; font-size: 14px;
    transform: rotate(45deg); color: #0f172a; text-shadow: 0 0 2px white;
  }

  .marker-pin.small {
    width: 26px; height: 26px; margin: -13px 0 0 -13px;
    border: 2px solid #ffffff;
  }
  .marker-pin.small .marker-text { font-size: 11px; font-weight: 600; }
  
  .marker-pin::after {
    content: ''; width: 26px; height: 26px; margin: 8px 0 0 8px;
    background: #ffffff; position: absolute; border-radius: 50%;
  }
  .marker-pin.small::after { width: 16px; height: 16px; margin: 5px 0 0 5px; }
  
  .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
    color: #1e293b; border-radius: 16px; border: 1px solid rgba(0, 210, 255, 0.2);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  .leaflet-popup-tip { background: white; }
  
  .custom-user-marker { background: transparent; border: none; }
  .user-pulse {
    background: #00d2ff; width: 18px; height: 18px; border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 15px rgba(0, 210, 255, 0.8);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(0, 210, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 210, 255, 0); }
  }
  .leaflet-bottom.leaflet-right { bottom: 30px; right: 20px; z-index: 500; }
`;

// ---------------------------------------------------------
// 真實感企鵝圖標組件
// ---------------------------------------------------------
const PenguinLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]">
    <defs>
      <linearGradient id="penguinBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#334155' }} />
        <stop offset="100%" style={{ stopColor: '#0f172a' }} />
      </linearGradient>
      <linearGradient id="penguinBelly" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffffff' }} />
        <stop offset="100%" style={{ stopColor: '#e2e8f0' }} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="15 10" className="animate-[spin_8s_linear_infinite] opacity-60" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="5 5" className="animate-[spin_12s_linear_infinite_reverse] opacity-40" />
    <path d="M30 50 Q20 55 25 70 T35 60" fill="#1e293b" />
    <path d="M70 50 Q80 55 75 70 T65 60" fill="#1e293b" />
    <path d="M50 15 C35 15 28 30 28 55 C28 75 38 88 50 88 C62 88 72 75 72 55 C72 30 65 15 50 15 Z" fill="url(#penguinBody)" />
    <path d="M50 32 C40 32 35 42 35 58 C35 73 42 82 50 82 C58 82 65 73 65 58 C65 42 60 32 50 32 Z" fill="url(#penguinBelly)" />
    <circle cx="43" cy="40" r="2.5" fill="#0f172a" />
    <circle cx="57" cy="40" r="2.5" fill="#0f172a" />
    <circle cx="43.5" cy="39" r="0.8" fill="white" />
    <circle cx="57.5" cy="39" r="0.8" fill="white" />
    <path d="M46 48 L54 48 L50 56 Z" fill="#f59e0b" />
    <path d="M38 85 Q35 90 42 90 T46 86" fill="#f59e0b" />
    <path d="M62 85 Q65 90 58 90 T54 86" fill="#f59e0b" />
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

// -----------------------------------------------------------------------------
// [重要] API 網址設定 (部署前請擇一設定)
// -----------------------------------------------------------------------------
const API_BASE = 'https://script.google.com/macros/s/AKfycbzB4JwfxZlnkysWOSDQ9Fpp-PaPvo4bOk95Wi9Gh8TV-bH35gukiFG0xfHlEQqOX8hQ/exec'; // <-- 直接貼上您的 GAS 網址

const SEARCH_RADIUS_KM = 3; 
const AUTO_REFRESH_INTERVAL = 60000; 

export default function App() {
  const [currentCity, setCurrentCity] = useState(TAIWAN_CITIES[14]); 
  const [allParkingData, setAllParkingData] = useState([]);
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [dataSource, setDataSource] = useState('雷達掃描中...');
  const [userLocation, setUserLocation] = useState(null);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef(new Map()); 
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // 1. 載入引擎
  useEffect(() => {
    if (window.L && window.L.map) { setIsLeafletLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setIsLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 2. 自動定位追蹤
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        let minDistance = Infinity;
        let nearestCity = TAIWAN_CITIES[14];
        TAIWAN_CITIES.forEach(city => {
          const dist = calculateDistance(latitude, longitude, city.lat, city.lng);
          if (dist < minDistance) { minDistance = dist; nearestCity = city; }
        });
        if (nearestCity.code !== currentCity.code) setCurrentCity(nearestCity);
      },
      null,
      { enableHighAccuracy: true, timeout: 10000 }
    );
    const id = navigator.geolocation.watchPosition(
      (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // 3. 初始化地圖
  useEffect(() => {
    if (isLeafletLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      if (!window.L || !window.L.map) return;
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([currentCity.lat, currentCity.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
      fetchParkingData(currentCity.code);
    }
  }, [isLeafletLoaded]);

  // 4. 定時自動更新邏輯
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentCity) fetchParkingData(currentCity.code, true);
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [currentCity]);

  // 5. 使用者藍點
  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({ className: 'custom-user-marker', html: `<div class="user-pulse"></div>`, iconSize: [18, 18] });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).bindPopup("企鵝雷達中心點").addTo(mapInstanceRef.current);
    }
  }, [userLocation]);

  // 6. 核心篩選與排序
  useEffect(() => {
    if (allParkingData.length === 0) return;
    if (userLocation) {
      const filtered = allParkingData
        .map(lot => ({ ...lot, distance: calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng) }))
        .filter(lot => lot.distance <= SEARCH_RADIUS_KM)
        .sort((a, b) => a.distance - b.distance);
      setParkingData(filtered);
    } else {
      setParkingData([...allParkingData].sort((a, b) => b.available - a.available));
    }
  }, [userLocation, allParkingData]);

  // 7. 切換城市動作
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      if (userLocation) mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
      else mapInstanceRef.current.setView([currentCity.lat, currentCity.lng], 13);
      fetchParkingData(currentCity.code);
    }
  }, [currentCity]);

  // 8. 數據抓取 (靜默更新支援)
  const fetchParkingData = async (cityCode, isBackground = false) => {
    if (isBackground) setIsAutoRefreshing(true);
    else { setLoading(true); setDataSource('雷達波發射中...'); }
    
    try {
      if (!API_BASE) throw new Error('API_MISSING');
      const url = new URL(API_BASE);
      url.searchParams.append('route', 'parking');
      url.searchParams.append('city', cityCode);
      const res = await fetch(url.toString());
      const result = await res.json();
      if (result.success) {
        setDataSource(`小企鵝連線中 (${result.city})`);
        setAllParkingData(result.data.map(d => ({ ...d, type: 'parking' })));
      }
    } catch (e) {
      if (!isBackground) {
        setDataSource('模擬測試模式');
        const mock = Array.from({ length: 40 }).map((_, i) => ({
          id: `p-${i}`, name: `企鵝冰山停放區 ${i+1}`,
          address: `南極洲 ${currentCity.name} 分區`, fare: '魚 3 條 / 小時',
          lat: currentCity.lat + (Math.random() - 0.5) * 0.08, 
          lng: currentCity.lng + (Math.random() - 0.5) * 0.08,
          total: 100, available: Math.floor(Math.random() * 80),
        }));
        setAllParkingData(mock);
      }
    } finally { setLoading(false); setIsAutoRefreshing(false); }
  };

  const handleNavigate = (lat, lng, name) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`小企鵝正在為您導航至 ${name}`);
      utterance.lang = 'zh-TW';
      window.speechSynthesis.speak(utterance);
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  useEffect(() => {
    window.handleNavigateGlobal = handleNavigate;
    return () => { delete window.handleNavigateGlobal; };
  }, []);

  const handleListItemClick = (lot) => {
    setViewMode('map');
    if (mapInstanceRef.current) mapInstanceRef.current.setView([lot.lat, lot.lng], 16, { animate: true });
  };

  // 10. 標記同步邏輯 (維持 Popup)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const currentMarkers = markersRef.current;

    const activeIds = new Set(parkingData.map(l => l.id.toString()));
    currentMarkers.forEach((marker, id) => {
      if (!activeIds.has(id.toString())) { map.removeLayer(marker); currentMarkers.delete(id); }
    });

    parkingData.forEach(lot => {
      const isUnknown = lot.available === -1;
      const percentage = lot.total > 0 ? lot.available / lot.total : 0;
      let color = '#94a3b8'; 
      let isSmall = isUnknown;

      if (!isUnknown) {
        if (lot.total === 0 || percentage < 0.1 || lot.available === 0) color = '#f43f5e';
        else if (percentage < 0.3) color = '#f59e0b';
        else color = '#10b981';
      }

      const iconSettings = {
        className: 'custom-marker',
        html: `<div class="marker-pin ${isSmall ? 'small' : ''}" style="background-color: ${color};"><span class="marker-text">${isSmall ? '?' : lot.available}</span></div>`,
        iconSize: isSmall ? [26, 26] : [42, 42],
        iconAnchor: isSmall ? [13, 13] : [21, 42],
        popupAnchor: isSmall ? [0, -13] : [0, -42]
      };

      const popupHtml = `
        <div style="min-width: 210px; text-align: left; padding: 5px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <div style="background:#0ea5e9; padding:4px; border-radius:8px;">🐧</div>
            <b style="font-size:16px; color:#0f172a;">${lot.name}</b>
          </div>
          <div style="color:#0ea5e9; font-weight:bold; font-size:12px; margin-bottom:5px;">距離您: ${lot.distance?.toFixed(1) || '0.0'} km</div>
          <div style="margin: 8px 0; font-size:12px; color: #475569; background: #f0f9ff; padding: 10px; border-radius: 10px; border-left: 4px solid #0ea5e9;">
             <b>費率:</b> ${lot.fare || '現場公告為準'}
          </div>
          <div style="font-size:12px; color: #64748b; margin-bottom:12px;">📍 ${lot.address || '地址掃描中...'}</div>
          <div style="display:flex; justify-content:space-between; align-items:end; border-top: 1px dashed #cbd5e1; padding-top:12px;">
             <div>
               <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Seats</div>
               <div style="font-size:24px; font-weight:900; color:${color}; line-height:1;">${lot.available === -1 ? '?' : lot.available}</div>
             </div>
             <button onclick="window.handleNavigateGlobal(${lot.lat}, ${lot.lng}, '${lot.name}')" 
               style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color:white; border:none; padding:8px 16px; border-radius:12px; cursor:pointer; font-weight:bold;">導航 GO</button>
          </div>
        </div>
      `;

      if (currentMarkers.has(lot.id.toString())) {
        const marker = currentMarkers.get(lot.id.toString());
        marker.setIcon(L.divIcon(iconSettings));
        marker.getPopup().setContent(popupHtml);
      } else {
        const marker = L.marker([lot.lat, lot.lng], { icon: L.divIcon(iconSettings) }).bindPopup(popupHtml).addTo(map);
        currentMarkers.set(lot.id.toString(), marker);
      }
    });
  }, [parkingData]);

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
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-2 h-2 rounded-full ${isAutoRefreshing ? 'bg-sky-400 animate-ping' : 'bg-sky-500'}`}></div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{isAutoRefreshing ? 'Scanning...' : 'Active'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => fetchParkingData(currentCity.code)} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 transition-all"><RotateCw size={20} className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </div>
        
        <div className="flex gap-3 h-11">
          <div className="flex-1 relative">
            <select value={currentCity.code} onChange={(e) => setCurrentCity(TAIWAN_CITIES.find(c => c.code === e.target.value))} className="w-full h-full pl-4 pr-8 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-slate-200 focus:outline-none appearance-none cursor-pointer">
              {TAIWAN_CITIES.map(city => (<option key={city.code} value={city.code} className="bg-slate-800">{city.name}</option>))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          <div className="bg-slate-800/50 p-1 rounded-2xl flex border border-slate-700">
            <button onClick={() => setViewMode('map')} className={`px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}><MapIcon size={14} /> 雷達</button>
            <button onClick={() => setViewMode('list')} className={`px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}><List size={14} /> 列表</button>
          </div>
        </div>
      </div>
      
      {/* 內容區域 */}
      <div className="flex-1 relative bg-slate-900">
        <div className={`absolute inset-0 ${viewMode === 'map' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'}`}>
           <div ref={mapContainerRef} className="w-full h-full" />
           {!isLeafletLoaded && <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50 text-sky-400 font-mono animate-pulse">RADAR INIT...</div>}
        </div>

        <div className={`absolute inset-0 bg-slate-900 overflow-y-auto px-4 pt-52 pb-10 transition-transform duration-500 ${viewMode === 'list' ? 'translate-y-0 z-20' : 'translate-y-full z-20'}`}>
           <div className="space-y-4">
             {parkingData.map(lot => (
               <div key={lot.id} onClick={() => handleListItemClick(lot)} className="bg-slate-800/60 backdrop-blur-md p-5 rounded-3xl border border-slate-700 hover:border-sky-500/50 transition-all active:scale-95 group">
                 <div className="flex justify-between items-start">
                    <div className="flex-1 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">#{lot.id.toString().slice(-4)}</span>
                        {lot.distance && <span className="text-xs font-black text-indigo-400">📡 {lot.distance.toFixed(1)} KM</span>}
                      </div>
                      <h3 className="font-black text-slate-100 text-lg group-hover:text-sky-400 transition-colors">{lot.name}</h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1 flex items-center gap-1"><MapPin size={10} /> {lot.address || '位置未知'}</p>
                    </div>
                    <div className={`flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-2xl border-2 ${lot.available < 10 ? 'border-rose-500 text-rose-500' : 'border-emerald-500 text-emerald-500'}`}>
                      <span className="text-2xl font-black">{lot.available === -1 ? '?' : lot.available}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Seats</span>
                    </div>
                 </div>
                 <button onClick={(e) => { e.stopPropagation(); handleNavigate(lot.lat, lot.lng, lot.name); }} className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-slate-900 py-3 rounded-2xl text-sm font-black flex justify-center items-center gap-2 transition-all"><Navigation size={18} fill="currentColor" /> 即刻導航</button>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}