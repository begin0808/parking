import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Navigation, RotateCw, Car, MapPin, List, Database, ChevronDown, Coins, LocateFixed, Zap, Search, Utensils, Fuel, XCircle } from 'lucide-react';

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

const leafletStyle = `
  .custom-marker { background: transparent; border: none; }
  .marker-pin {
    width: 40px; height: 40px; border-radius: 50% 50% 50% 0;
    position: absolute; transform: rotate(-45deg);
    left: 50%; top: 50%; margin: -20px 0 0 -20px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid #ffffff;
  }
  .marker-pin:hover { transform: rotate(-45deg) scale(1.15); z-index: 100; }
  .marker-text {
    position: absolute; z-index: 10; font-weight: 800; font-size: 14px;
    transform: rotate(45deg); color: #333;
  }
  
  .leaflet-popup-content-wrapper {
    background: #ffffff; color: #1e293b; border-radius: 12px; border: none;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  }
  .leaflet-popup-tip { background: #ffffff; }
  .leaflet-container a.leaflet-popup-close-button { color: #64748b; }
  
  .custom-user-marker { background: transparent; border: none; }
  .user-pulse {
    background: #3b82f6; width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
`;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// -----------------------------------------------------------------------------
// [API 網址設定 - 關鍵步驟]
// 為了避免預覽錯誤，我們先將 import.meta 註解起來。
//
// ★ 在上傳到 GitHub 前，請您做一個選擇：
// 
// 選項 A (推薦 - 使用 Vercel 環境變數):
// 請手動「取消註解」下面第一行 (移除 //)，並將第二行註解起來。
//
// 選項 B (簡單 - 直接寫死網址):
// 直接將您的 GAS 網址 (https://script.google.com/macros/s/xxxx/exec) 貼入第二行的引號中。
// -----------------------------------------------------------------------------

 const API_BASE = import.meta.env.VITE_API_URL || ''; 


export default function ParkingApp() {
  const [currentCity, setCurrentCity] = useState(TAIWAN_CITIES[14]); 
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [dataSource, setDataSource] = useState('初始化...');
  const [userLocation, setUserLocation] = useState(null);
  
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultMode, setSearchResultMode] = useState(false); 

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // 1. Load Leaflet
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

  // 2. 智慧啟動
  useEffect(() => {
    if (!navigator.geolocation) return;
    
    // (A) 單次定位
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        
        let minDistance = Infinity;
        let nearestCity = TAIWAN_CITIES[14];
        TAIWAN_CITIES.forEach(city => {
          const dist = calculateDistance(latitude, longitude, city.lat, city.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestCity = city;
          }
        });
        
        if (nearestCity.code !== currentCity.code) {
          console.log(`[自動定位] 切換至: ${nearestCity.name}`);
          setCurrentCity(nearestCity);
        }
      },
      (error) => {
        console.warn("[初始定位失敗]", error.message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );

    // (B) 持續追蹤
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => console.warn("[追蹤定位訊號微弱]", error.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
    watchIdRef.current = id;
    
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  // 3. Initialize Map
  useEffect(() => {
    if (isLeafletLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      if (!window.L || !window.L.map) return;
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([currentCity.lat, currentCity.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM', maxZoom: 19 }).addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      fetchParkingData(currentCity.code);
    }
  }, [isLeafletLoaded]);

  const updateUserMarker = (map, loc) => {
    const L = window.L;
    if (!map || !L) return;
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    const userIcon = L.divIcon({ className: 'custom-user-marker', html: `<div class="user-pulse"></div>`, iconSize: [16, 16] });
    userMarkerRef.current = L.marker([loc.lat, loc.lng], { icon: userIcon, zIndexOffset: 1000 }).bindPopup("您的位置").addTo(map);
  };

  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current) return;
    updateUserMarker(mapInstanceRef.current, userLocation);
    if (parkingData.length > 0) {
      setParkingData(prev => prev.map(lot => ({
        ...lot,
        distance: calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng)
      })).sort((a, b) => a.distance - b.distance));
    }
  }, [userLocation]);

  useEffect(() => {
    if (mapInstanceRef.current && window.L && !searchResultMode) {
      mapInstanceRef.current.setView([currentCity.lat, currentCity.lng], 13);
      fetchParkingData(currentCity.code);
    }
  }, [currentCity]);

  const fetchParkingData = async (cityCode) => {
    setLoading(true);
    setDataSource('連線中...');
    setSearchResultMode(false);
    setSearchText('');
    
    try {
      if (!API_BASE) throw new Error('API_NOT_CONFIGURED');

      const url = new URL(API_BASE);
      url.searchParams.append('route', 'parking');
      url.searchParams.append('city', cityCode);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Backend error');
      const result = await response.json();
      
      if (result.success) {
        setDataSource(`TDX (${result.city})`);
        let processedData = result.data.map(d => ({ ...d, type: 'parking' }));
        if (userLocation) {
          processedData = processedData.map(lot => ({
            ...lot,
            distance: calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng)
          })).sort((a, b) => a.distance - b.distance);
        } else {
          processedData = processedData.sort((a, b) => b.available - a.available);
        }
        setParkingData(processedData);
      }
    } catch (error) {
      console.warn("後端連線失敗或未設定，切換至模擬資料模式", error);
      setDataSource('離線模擬 (請設定API)');
      
      const mockData = Array.from({ length: 15 }).map((_, i) => ({
        id: `mock-${i}`, name: `${currentCity.name}模擬場站 ${i+1}`,
        address: `${currentCity.name}市中心路段`, fare: '30元/小時 (模擬)',
        lat: currentCity.lat + (Math.random() - 0.5) * 0.05,
        lng: currentCity.lng + (Math.random() - 0.5) * 0.05,
        total: 100, available: Math.floor(Math.random() * 80),
      }));
      
      if (userLocation) {
         setParkingData(mockData.map(lot => ({
           ...lot, distance: calculateDistance(userLocation.lat, userLocation.lng, lot.lat, lot.lng)
         })).sort((a, b) => a.distance - b.distance));
      } else {
         setParkingData(mockData.sort((a, b) => b.available - a.available));
      }
    } finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    setLoading(true);
    setIsSearching(true);
    setDataSource('搜尋中...');
    
    try {
      if (!API_BASE) throw new Error('API_NOT_CONFIGURED');

      const query = `${searchText} ${currentCity.name}`;
      const url = new URL(API_BASE);
      url.searchParams.append('route', 'search');
      url.searchParams.append('q', query);

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setSearchResultMode(true);
        setDataSource(`搜尋: ${searchText}`);
        let places = result.data.map(p => ({
            id: p.id, name: p.name, lat: p.lat, lng: p.lng, address: p.address,
            type: 'place', category: p.category, available: -1, total: 0
        }));
        
        if (userLocation) {
          places = places.map(p => ({
            ...p, distance: calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
          })).sort((a, b) => a.distance - b.distance);
        }
        setParkingData(places);
        
        if (mapInstanceRef.current && places.length > 0) {
          mapInstanceRef.current.setView([places[0].lat, places[0].lng], 14);
        }
      } else {
        alert("找不到相關地點");
        setDataSource('無搜尋結果');
      }
    } catch (error) {
      console.error(error);
      if (error.message === 'API_NOT_CONFIGURED') alert("請先設定後端 API 網址才能使用搜尋功能");
      else alert("搜尋失敗");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResultMode(false);
    fetchParkingData(currentCity.code); 
  };

  const handleNavigate = (lat, lng, name) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`正在為您導航至 ${name}`);
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

  const handleLocateMe = () => {
    if (!navigator.geolocation) { alert("不支援定位"); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) mapInstanceRef.current.setView([latitude, longitude], 15);
        updateUserMarker(mapInstanceRef.current, { lat: latitude, lng: longitude });
        setLoading(false);
      },
      (error) => { console.error(error); alert("無法獲取位置"); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !window.L) return;
    const L = window.L;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    parkingData.forEach(lot => {
      let color;
      if (lot.type === 'place') {
        color = '#8b5cf6'; 
      } else {
        const isUnknown = lot.available === -1;
        const percentage = lot.total > 0 ? lot.available / lot.total : 0;
        color = '#9ca3af'; 
        if (!isUnknown) {
          if (lot.total === 0) color = '#ef4444';
          else if (percentage < 0.1 || lot.available === 0) color = '#ef4444'; 
          else if (percentage < 0.3) color = '#eab308'; 
          else color = '#22c55e'; 
        }
      }

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color: ${color};"><span class="marker-text">${lot.type === 'place' ? '' : (lot.available === -1 ? '?' : lot.available)}</span></div>`,
        iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40]
      });

      const subText = lot.type === 'place' ? (lot.category || '地點') : (lot.fare || '費率詳洽現場');
      const distanceText = lot.distance ? `<span style="color:#2563eb; font-weight:bold;">${lot.distance.toFixed(1)} km</span>` : '';
      
      L.marker([lot.lat, lot.lng], { icon })
        .bindPopup(`
          <div style="min-width: 220px; text-align: left;">
            <b style="font-size:16px; color:#1e293b;">${lot.name}</b><br/>
            ${distanceText ? `<div style="font-size:12px; margin-bottom:6px;">${distanceText}</div>` : ''}
            <div style="margin: 8px 0; font-size:13px; color: #475569; background: #f1f5f9; padding: 8px; border-radius: 6px;">
               ${subText}
            </div>
            <div style="font-size:12px; color: #64748b; margin-bottom:12px;">📍 ${lot.address || '地址未知'}</div>
            ${lot.type === 'parking' ? `
            <div style="display:flex; justify-content:space-between; align-items:end; border-top: 1px solid #e2e8f0; padding-top:10px;">
               <div>
                 <div style="font-size:12px; color:#64748b;">剩餘車位</div>
                 <div style="font-size:24px; font-weight:800; color:${color}; line-height:1;">${lot.available}</div>
               </div>
            ` : '<div style="display:flex; justify-content:end; border-top: 1px solid #e2e8f0; padding-top:10px;">'}
               <button onclick="window.handleNavigateGlobal(${lot.lat}, ${lot.lng}, '${lot.name}')" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:white; border:none; padding:8px 16px; border-radius:99px; cursor:pointer; font-weight: bold;">
                 導航 GO
               </button>
            </div>
          </div>
        `)
        .on('click', () => mapInstanceRef.current.setView([lot.lat, lot.lng], 16, { animate: true }))
        .addTo(markersGroup);
    });
  }, [parkingData]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-slate-800 relative overflow-hidden">
      <style>{leafletStyle}</style>
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl space-y-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Car size={20} className="text-white" />
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="搜尋 牛肉湯, 加油站..." className="w-full pl-9 pr-8 py-2 bg-gray-100 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            <Search size={16} className="absolute left-3 text-gray-400" />
            {searchText && <button type="button" onClick={clearSearch} className="absolute right-2 text-gray-400 hover:text-gray-600"><XCircle size={16} /></button>}
          </form>
          <div className="flex gap-2 shrink-0">
             <button onClick={handleLocateMe} className={`p-2 rounded-xl transition-all ${userLocation ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'}`}><LocateFixed size={20} /></button>
          </div>
        </div>
        <div className="flex gap-3 h-10">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400"><MapPin size={16} /></div>
            <select value={currentCity.code} onChange={(e) => setCurrentCity(TAIWAN_CITIES.find(c => c.code === e.target.value))} className="w-full h-full pl-9 pr-8 bg-gray-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-gray-200 transition-colors">
              {TAIWAN_CITIES.map(city => (<option key={city.code} value={city.code}>{city.name}</option>))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400"><ChevronDown size={14} /></div>
          </div>
          <div className="bg-gray-100 p-1 rounded-xl flex border border-slate-200">
            <button onClick={() => setViewMode('map')} className={`px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}><MapIcon size={14} /> 地圖</button>
            <button onClick={() => setViewMode('list')} className={`px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}><List size={14} /> 推薦</button>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          {searchResultMode ? (
            <div className="flex items-center gap-2 text-xs font-medium text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-500"></span>搜尋結果</div>
          ) : (
            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>充裕</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#eab308]"></span>普通</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>滿位</span>
            </div>
          )}
          <span className="text-[10px] text-slate-500 flex items-center gap-1"><Database size={10} /> {dataSource} • {parkingData.length} 筆</span>
        </div>
      </div>
      <div className="flex-1 relative bg-gray-50">
        <div className={`absolute inset-0 ${viewMode === 'map' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'} transition-opacity duration-300`}>
           <div ref={mapContainerRef} className="w-full h-full bg-slate-200" />
           {!isLeafletLoaded && <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">載入中...</div>}
        </div>
        <div className={`absolute inset-0 bg-gray-50 overflow-y-auto px-4 pt-44 pb-10 transition-transform duration-300 ${viewMode === 'list' ? 'translate-y-0 z-20' : 'translate-y-full z-20'}`}>
           <div className="space-y-3">
             {parkingData.map(lot => (
               <div key={lot.id} onClick={() => handleListItemClick(lot)} className={`bg-white p-4 rounded-2xl border shadow-sm active:scale-[0.98] transition-all cursor-pointer group hover:shadow-md ${lot.type === 'place' ? 'border-purple-200 hover:border-purple-300' : 'border-slate-200 hover:border-blue-300'}`}>
                 <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 leading-tight">{lot.name}</h3>
                      {lot.distance && <span className="inline-flex items-center mt-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{lot.distance.toFixed(1)} km</span>}
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">{lot.address || '地址未知'}</p>
                      {lot.type === 'place' ? (<div className="mt-2 inline-flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs"><Utensils size={12} /> {lot.category || '地點'}</div>) : (<div className="mt-2 inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs"><Coins size={12} />{lot.fare ? lot.fare.substring(0, 18) + (lot.fare.length > 18 ? '...' : '') : '詳情請見導航'}</div>)}
                    </div>
                    {lot.type !== 'place' && (<div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 ${lot.available < 10 ? 'bg-red-50 border-red-200 text-red-600' : (lot.total > 0 && lot.available/lot.total < 0.3) ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-green-50 border-green-200 text-green-600'}`}><span className="text-2xl font-black leading-none">{lot.available === -1 ? '?' : lot.available}</span><span className="text-[10px] font-bold opacity-80 mt-1">剩餘</span></div>)}
                 </div>
                 <button onClick={(e) => { e.stopPropagation(); handleNavigate(lot.lat, lot.lng, lot.name); }} className="w-full mt-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all border border-indigo-200"><Navigation size={16} /> 前往導航</button>
               </div>
             ))}
             <div className="h-10"></div>
           </div>
        </div>
      </div>
    </div>
  );
}