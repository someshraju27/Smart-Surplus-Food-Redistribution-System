import React, { useState, useEffect, useCallback } from "react";
import { FaUserCircle, FaCheckCircle, FaClock, FaImage, FaMapMarkerAlt, FaHandsHelping } from "react-icons/fa";
import { createDonation } from "./api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DonorDashboard = () => {
  const navigate = useNavigate();
  
  // State Management
  const [donationsDone, setDonationsDone] = useState(0);
  const [points, setPoints] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [foodRequests, setFoodRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foodItem, setFoodItem] = useState({
    name: "", type: "", expiry: "", quantity: "", address: "", latitude: null, longitude: null
  });
  
  const [locationDetected, setLocationDetected] = useState(false);
  const [userData, setUserData] = useState({ id: "", name: "User", role: "Donor" });
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. Authentication & User Fetching
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/api/donor`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const user = res.data.user;
      setUserData({ id: user._id, name: user.name, role: user.role });
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    });
  }, [navigate]);

  // 2. Fetch Donations (Memoized to prevent unnecessary re-renders)
  const fetchMyDonations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userData.id) return;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/donation/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      setFoodRequests(data);
      
      const completedCount = data.filter(d => d.status === "completed").length;
      setDonationsDone(completedCount);
      setPoints(completedCount * 50); // 50 points per delivery
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  }, [userData.id]);

  useEffect(() => {
    if (userData.id) fetchMyDonations();
  }, [userData.id, fetchMyDonations]);

  // 3. Logic Handlers
  const handleLogout = async () => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/donarLogout/${userData.id}`);
      localStorage.removeItem("token");
      navigate("/home");
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/home");
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFoodItem(prev => ({ 
            ...prev, 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          }));
          setLocationDetected(true);
        },
        () => alert("Location access denied. Please enable GPS.")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, type, expiry, quantity, address, latitude } = foodItem;
    
    if (!name || !type || !expiry || !quantity || !address || !latitude) {
      alert("Please complete the form and detect your location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const donationData = {
        foodName: name, foodType: type, quantity, expiryIn: expiry,
        address, latitude: foodItem.latitude, longitude: foodItem.longitude
      };

      const response = await createDonation(userData.id, donationData);
      
      // Auto-assign to nearest volunteer via backend
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/volunteer/assign`, {
        donationId: response.donation._id,
      });

      alert("Success! Your food donation is now active.");
      
      // Reset Form
      setFoodItem({ name: "", type: "", expiry: "", quantity: "", address: "", latitude: null, longitude: null });
      setLocationDetected(false);
      fetchMyDonations(); 
    } catch (error) {
      alert("Error submitting donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col gap-6 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-8 rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaHandsHelping className="text-green-600 text-3xl" />
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">FoodShare <span className="text-green-600">Donor</span></h1>
        </div>
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{userData.name}</p>
              <p className="text-xs text-gray-500 uppercase">{userData.role}</p>
            </div>
            <FaUserCircle className="text-4xl text-green-600" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-3 bg-white shadow-2xl rounded-xl p-4 w-56 z-50 border border-gray-100">
              <button onClick={handleLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg transition">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Stats & Form */}
        <div className="lg:w-2/3 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-full text-green-600 text-2xl"><FaCheckCircle /></div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Lives Impacted</p>
                <h2 className="text-3xl font-black text-gray-800">{donationsDone}</h2>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-yellow-100 rounded-full text-yellow-600 text-2xl"><FaImage /></div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Karma Points</p>
                <h2 className="text-3xl font-black text-gray-800">{points}</h2>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-600" /> New Donation Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="What are you donating?" value={foodItem.name} onChange={(e) => setFoodItem({...foodItem, name: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                <select value={foodItem.type} onChange={(e) => setFoodItem({...foodItem, type: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Food Type</option>
                  <option value="Veg">Pure Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Packed">Packed Items</option>
                </select>
                <input type="number" placeholder="Expiry (Hours)" value={foodItem.expiry} onChange={(e) => setFoodItem({...foodItem, expiry: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                <input type="number" placeholder="Quantity (People)" value={foodItem.quantity} onChange={(e) => setFoodItem({...foodItem, quantity: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <textarea placeholder="Exact Pickup Address..." value={foodItem.address} onChange={(e) => setFoodItem({...foodItem, address: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none h-24" />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={detectLocation} className={`flex-1 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${locationDetected ? "bg-green-100 text-green-700" : "bg-gray-800 text-white hover:bg-gray-900"}`}>
                  <FaMapMarkerAlt /> {locationDetected ? "Location Pinned ✓" : "Pin My Location"}
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-bold shadow-lg transition shadow-green-200">
                  {isSubmitting ? "Processing..." : "Confirm Donation"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Feed/History */}
        <aside className="lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full max-h-[85vh] overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Live Status</h2>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {foodRequests.length > 0 ? (
                foodRequests.slice().reverse().map((req) => (
                  <div key={req._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 transition hover:bg-white hover:shadow-md group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition">{req.foodName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        req.status === "completed" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">{req.address}</p>
                    
                    {/* Delivery Proof Viewer */}
                    {req.status === "completed" && req.imageUrl ? (
                      <div className="relative group/img cursor-pointer" onClick={() => setSelectedImage(req.imageUrl)}>
                        <img 
                          src={req.imageUrl} 
                          alt="Proof kjhgfg" 
                          className="w-full h-32 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/img:bg-opacity-20 transition rounded-xl flex items-center justify-center">
                          <FaImage className="text-white opacity-0 group-hover/img:opacity-100 text-2xl" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                        <FaClock /> Awaiting volunteer update...
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400">No donation history yet.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Fullscreen Image Portal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-[100] flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full animate-in zoom-in duration-300">
            <img src={selectedImage} alt="Delivery Proof" className="w-full rounded-2xl shadow-2xl border-4 border-white" />
            <button className="absolute -top-12 right-0 text-white text-xl font-bold">Close ×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;