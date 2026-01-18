import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUserCircle, FaMapMarkerAlt, FaRoute, FaWalking, 
  FaCar, FaCamera, FaCheck, FaHandsHelping, FaTrash, FaMotorcycle, FaBars 
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { updateVolunteerLocation } from "./api";

// --- Leaflet Icon Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const volunteerIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/4474/4474288.png", iconSize: [35, 35], iconAnchor: [17, 35] });
const requestIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [30, 30], iconAnchor: [15, 30] });
const shelterIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/484/484167.png", iconSize: [25, 25], iconAnchor: [12, 25] });

// --- Auto-fit Map Component (Ensures Route Graph is fully visible) ---
const MapBounder = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(L.polyline(points).getBounds(), { padding: [50, 50] });
      }, 200);
    }
  }, [points, map]);
  return null;
};

const MapRedirect = ({ coords }) => {
  const map = useMap();
  useEffect(() => { 
    if (coords.lat !== 0) {
        map.invalidateSize();
        map.setView([coords.lat, coords.lng], 13); 
    }
  }, [coords, map]);
  return null;
};

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  
  // Stats
  const [ordersCompleted, setOrdersCompleted] = useState(5);
  const [points, setPoints] = useState(50);
  
  // Data
  const [foodRequests, setFoodRequests] = useState([]);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hotspots, setHotspots] = useState([]);
  
  // Map/UI State
  const [volunteerCoords, setVolunteerCoords] = useState({ lat: 0, lng: 0 });
  const [locationDetected, setLocationDetected] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  // Routing State
  const [showRoute, setShowRoute] = useState(false);
  const [routeDestination, setRouteDestination] = useState(null);
  const [travelMode, setTravelMode] = useState('bike');
  const [routePath, setRoutePath] = useState([]); 
  const [routeMetrics, setRouteMetrics] = useState({ distance: 0, time: 0 });

  // Upload/Profile State
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState(null);

  // 1. Auth & Data fetching
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    axios.get(`${process.env.REACT_APP_API_URL}/api/volunteer`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUserId(res.data.user._id);
        setUserName(res.data.user.name);
        setUserRole(res.data.user.role);
      }).catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/volunteer/assignedRequests/${userId}`)
        .then(res => setFoodRequests(res.data || []));
    }
  }, [userId]);

  // 2. Direct OSRM Routing Fetch with Logic-Based Time Correction
  useEffect(() => {
    const getRoute = async () => {
      if (!showRoute || !routeDestination || !volunteerCoords.lat) return;
      const profileMap = { 'walking': 'foot', 'bike': 'bicycle', 'car': 'car' };
      const speeds = { 'walking': 5, 'bike': 18, 'car': 40 }; // km/h constants

      try {
        const url = `https://router.project-osrm.org/route/v1/${profileMap[travelMode]}/${volunteerCoords.lng},${volunteerCoords.lat};${routeDestination.lng},${routeDestination.lat}?overview=full&geometries=geojson`;
        const res = await axios.get(url);
        if (res.data.routes && res.data.routes.length > 0) {
          const route = res.data.routes[0];
          const distKm = route.distance / 1000;
          setRoutePath(route.geometry.coordinates.map(pair => [pair[1], pair[0]]));
          setRouteMetrics({ 
            distance: route.distance, 
            time: (distKm / speeds[travelMode]) * 3600 // Calculated time based on speed
          });
        }
      } catch (err) { console.error("Routing Error:", err); }
    };
    getRoute();
  }, [showRoute, routeDestination, travelMode, volunteerCoords]);

  // 3. Status Handlers
  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setVolunteerCoords(coords);
      setLocationDetected(true);
      await updateVolunteerLocation(userId, coords.lat, coords.lng);
    }, () => setError("Enable GPS for mission routing"));
  };

  const fetchNearbyHotspots = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hotspots`, { params: { latitude: volunteerCoords.lat, longitude: volunteerCoords.lng, radius: searchRadius } });
      setHotspots(res.data.hotspots || []);
      setShowHotspots(true);
    } catch (err) { setError("Hotspot scan failed"); } finally { setLoading(false); }
  };

  const handleAcceptOrder = (id) => {
    axios.patch(`${process.env.REACT_APP_API_URL}/api/volunteer/accept/${userId}/${id}`)
      .then(() => setFoodRequests(prev => prev.map(d => d._id === id ? { ...d, status: "accepted" } : d)));
  };

  const handleRejectOrder = (id) => {
    axios.put(`${process.env.REACT_APP_API_URL}/api/volunteer/reject/${userId}/${id}`)
      .then(() => {
        setFoodRequests(prev => prev.filter(d => d._id !== id));
        if (routeDestination?._id === id) setShowRoute(false);
      });
  };

  const handleCompletedOrder = async (id) => {
    if (!image) return alert("Photo proof required");
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('helpingImage', image);
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/volunteer/completed/${userId}/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotoUploaded(true); setOrdersCompleted(c => c + 1); setPoints(p => p + 50);
      setTimeout(() => { 
        setFoodRequests(reqs => reqs.filter(r => r._id !== id)); 
        setRoutePath([]); setShowRoute(false); setUploadingPhoto(false); setPhotoUploaded(false); setImage(null); setImagePreview(null);
      }, 1500);
    } catch (err) { setUploadingPhoto(false); }
  };

  const handleLogout = () => {
    axios.patch(`${process.env.REACT_APP_API_URL}/api/volunteerLogout/${userId}`).then(() => {
      localStorage.removeItem("token");
      navigate("/home");
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      {/* NAVBAR */}
      <header className="h-16 flex-shrink-0 bg-white border-b flex justify-between items-center px-4 md:px-8 shadow-sm z-[1100]">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <FaBars />
          </button>
          <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-lg"><FaHandsHelping /></div>
          <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tighter uppercase hidden xs:block">Mission Control</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 relative">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs md:text-sm font-bold">{userName}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase">{userRole || 'Volunteer'}</p>
          </div>
          <button onClick={() => setShowProfile(!showProfile)} className="transition-transform active:scale-90">
            <FaUserCircle className="text-2xl md:text-3xl text-slate-300 hover:text-emerald-600" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 bg-white shadow-2xl rounded-2xl p-4 w-48 border border-slate-100 z-[2000] animate-in fade-in slide-in-from-top-2">
               <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-500 hover:text-white transition-all">Sign Out</button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative flex-col lg:flex-row">
        
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          absolute lg:relative z-[1001] lg:z-[999] 
          w-full sm:w-[350px] lg:w-[400px] 
          h-full bg-white border-r transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col`}>
          
          <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50 border-b">
             <div className="bg-white p-3 rounded-2xl shadow-sm text-center border border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Missions</p>
               <p className="text-lg font-black text-slate-800">{ordersCompleted}</p>
             </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm text-center border border-emerald-100">
               <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1 tracking-widest">Karma</p>
               <p className="text-lg font-black text-emerald-700">{points}</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Assigned Tasks
             </h2>
             {foodRequests.map(req => (
                <div key={req._id} className={`p-4 rounded-[2.5rem] border transition-all ${req.status === 'accepted' ? 'border-emerald-500 shadow-xl ring-4 ring-emerald-50' : 'border-slate-100 shadow-sm'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100">#{req._id.slice(-5)}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${req.status === 'accepted' ? 'text-emerald-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>{req.status}</span>
                  </div>
                  <h3 className="font-black text-slate-800 text-sm leading-tight mb-1">{req.foodName}</h3>
                  <p className="text-[11px] text-slate-500 mb-4 leading-snug"><FaMapMarkerAlt className="text-red-400 inline" /> {req.address}</p>

                  {req.status !== "accepted" ? (
                    <div className="flex gap-2">
                       <button onClick={() => handleAcceptOrder(req._id)} className="flex-1 bg-slate-900 text-white py-2.5 rounded-2xl text-xs font-black hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg"><FaRoute /> Accept</button>
                       <button onClick={() => handleRejectOrder(req._id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-500 transition-all"><FaTrash size={14}/></button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <button onClick={() => { setRouteDestination({ _id: req._id, lat: req.latitude, lng: req.longitude }); setShowRoute(!showRoute); }} className={`w-full py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${showRoute && routeDestination?._id === req._id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}>
                        <FaRoute /> {showRoute && routeDestination?._id === req._id ? 'Hide Route' : 'Show Route'}
                      </button>
                      
                      <div className="flex gap-1.5 p-1 bg-slate-50 rounded-2xl border">
                        {[{mode:'bike', icon:<FaMotorcycle/>, color:'bg-amber-500'}, {mode:'car', icon:<FaCar/>, color:'bg-blue-600'}, {mode:'walking', icon:<FaWalking/>, color:'bg-slate-800'}].map((item) => (
                          <button key={item.mode} onClick={() => setTravelMode(item.mode)} className={`flex-1 py-1.5 rounded-xl text-[8px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${travelMode === item.mode ? `${item.color} text-white shadow-md` : 'text-slate-400'}`}>
                            {item.icon} {item.mode}
                          </button>
                        ))}
                      </div>

                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl py-4 cursor-pointer hover:bg-slate-50 transition relative overflow-hidden group">
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if(f) { setImage(f); setImagePreview(URL.createObjectURL(f)); } }} />
                         {imagePreview ? (
                            <div className="relative w-full px-2">
                               <img src={imagePreview} className={`w-full h-24 object-cover rounded-2xl ${photoUploaded ? 'border-4 border-emerald-500' : ''}`} alt="preview" />
                               {photoUploaded && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-2xl"><FaCheck className="text-white text-3xl" /></div>}
                            </div>
                         ) : (
                            <div className="text-center p-2"><FaCamera className="text-slate-300 text-2xl mb-1 mx-auto group-hover:text-emerald-500 transition-colors" /><p className="text-[10px] font-bold text-slate-400 uppercase">Upload Proof</p></div>
                         )}
                      </label>

                      <button onClick={() => handleCompletedOrder(req._id)} disabled={uploadingPhoto || !image} className={`w-full py-4 rounded-[2rem] font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2 ${uploadingPhoto ? 'opacity-50' : ''}`}>
                        {uploadingPhoto ? "Syncing..." : "Finish Mission"}
                      </button>
                    </div>
                  )}
                </div>
             ))}
          </div>
        </aside>

        {/* MAP AREA */}
        <main className="flex-1 relative bg-slate-200 z-0">
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            <button onClick={fetchNearbyHotspots} disabled={!locationDetected || loading} className="bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 text-xs font-black text-slate-800 hover:bg-slate-50 transition-all active:scale-95">
              <FaMapMarkerAlt className="text-blue-500" /> {loading ? "Scanning..." : "Nearby Service Spots"}
            </button>
            {showHotspots && (
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Radius</span>
                <select value={searchRadius} onChange={(e) => setSearchRadius(Number(e.target.value))} className="text-[10px] font-black outline-none bg-transparent">
                  <option value={1000}>1 KM</option>
                  <option value={3000}>3 KM</option>
                  <option value={5000}>5 KM</option>
                </select>
              </div>
            )}
          </div>

          <MapContainer center={[20.59, 78.96]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <MapRedirect coords={volunteerCoords} />
            <MapBounder points={routePath} />

            {locationDetected && <Marker position={[volunteerCoords.lat, volunteerCoords.lng]} icon={volunteerIcon}><Popup className="font-bold">You are here</Popup></Marker>}
            {foodRequests.map(req => req.latitude && <Marker key={req._id} position={[req.latitude, req.longitude]} icon={requestIcon}><Popup><b>DONOR:</b> {req.foodName}</Popup></Marker>)}
            {showHotspots && hotspots.map((spot, i) => <Marker key={i} position={[spot.latitude || spot.lat, spot.longitude || spot.lng]} icon={shelterIcon}><Popup><b>HOTSPOT:</b> {spot.name || "Target Spot"}</Popup></Marker>)}
            
            {showRoute && <Polyline positions={routePath} color={travelMode === 'bike' ? '#f59e0b' : travelMode === 'walking' ? '#3b82f6' : '#10b981'} weight={6} opacity={0.8} />}
            {locationDetected && <Circle center={[volunteerCoords.lat, volunteerCoords.lng]} radius={searchRadius} pathOptions={{ color: '#10b981', fillOpacity: 0.02, weight: 1 }} />}
          </MapContainer>

          {/* METRICS OVERLAY */}
          {showRoute && routeMetrics.time > 0 && (
            <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-[92%] md:w-auto z-[1000] bg-slate-900/90 backdrop-blur-2xl text-white px-6 md:px-10 py-4 rounded-[32px] md:rounded-[40px] shadow-2xl flex items-center justify-between md:justify-center gap-4 md:gap-10 border border-white/10 animate-in slide-in-from-bottom-5">
               <div className="text-center">
                 <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dist</p>
                 <p className="text-md md:text-2xl font-black tracking-tight">{(routeMetrics.distance / 1000).toFixed(1)} km</p>
               </div>
               <div className="w-[1px] h-8 md:h-12 bg-white/20" />
               <div className="text-center">
                 <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA ({travelMode})</p>
                 <p className="text-md md:text-2xl font-black text-emerald-400 tracking-tight">{Math.ceil(routeMetrics.time / 60)} min</p>
               </div>
               <div className={`p-2.5 md:p-4 rounded-2xl md:rounded-3xl ${travelMode === 'walking' ? 'bg-slate-700' : travelMode === 'bike' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'} shadow-xl flex items-center justify-center`}>
                  {travelMode === 'walking' ? <FaWalking size={20} /> : travelMode === 'bike' ? <FaMotorcycle size={20} /> : <FaCar size={20} />}
               </div>
            </div>
          )}
        </main>
      </div>

      {/* SYNC GPS OVERLAY */}
      {!locationDetected && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[3000] p-6 text-center">
          <div className="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl max-w-sm border border-slate-100">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce shadow-inner shadow-emerald-200"><FaMapMarkerAlt size={32} /></div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tighter">Sync Hero GPS</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed px-2">Enable location to track mission paths and food hotspots in real-time.</p>
            <button onClick={detectLocation} className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 uppercase tracking-widest text-xs active:scale-95">Activate GPS</button>
            {error && <p className="text-red-500 text-[10px] mt-5 font-bold uppercase tracking-tight bg-red-50 py-2 rounded-lg">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;