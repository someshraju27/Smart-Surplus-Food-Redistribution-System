import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaLeaf, FaHandsHelping, FaRocket, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    address: "", email: "", name: "", phonenum: "", role: "", id: ""
  });
  
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios.get(`${process.env.REACT_APP_API_URL}/home`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      setUserData({
        address: response.data.user.address,
        email: response.data.user.email,
        name: response.data.user.name,
        phonenum: response.data.user.phonenum,
        role: response.data.user.role,
        id: response.data.user._id
      });
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
  }, [navigate, token]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const donorCreate = async () => {
    if (!userData || !userData.id) {
      alert("User ID is missing! Please log in again.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/donor/${userData.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message === "User is now a donor!") {
        alert("You are now a donor!");
        navigate("/donor");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  const volunteerCreate = async () => {
    if (!userData || !userData.id) {
      alert("User ID is missing! Please log in again.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/volunteer/${userData.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message === "User is now a volunteer!" || response.data.message === "User is already a volunteer!") {
        alert(response.data.message);
        navigate("/volunteer");
      } else {
        alert(response.data.message);
      }
    } catch(error) {
      alert(error.response?.data?.message || "Something went wrong!");
    } 
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100 selection:text-green-900">
      
      {/* Navbar - Enhanced with Backdrop Blur */}
      <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/home")}>
            <div className="bg-green-600 p-2 rounded-lg text-white group-hover:rotate-12 transition-transform">
                <FaLeaf size={20}/>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">FoodConnect</h1>
          </div>

          <div className="flex items-center space-x-8">
            <ul className="hidden md:flex space-x-8 text-slate-600 font-bold text-sm uppercase tracking-widest">
              <li><Link to="/home" className="hover:text-green-600 transition-colors">Home</Link></li>
              <li><button onClick={donorCreate} className="hover:text-green-600 transition-colors uppercase">Donor</button></li>
              <li><button onClick={volunteerCreate} className="hover:text-green-600 transition-colors uppercase">Volunteer</button></li>
              <li><button onClick={() => scrollToSection("about")} className="hover:text-green-600 transition-colors uppercase">About</button></li>
              <li><button onClick={() => scrollToSection("footer")} className="hover:text-green-600 transition-colors uppercase tracking-widest">Contact</button></li>
            </ul>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)} 
                className="flex items-center gap-2 p-1 pl-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all border border-slate-200"
              >
                <span className="text-sm font-bold text-slate-700 hidden sm:block">{userData.name.split(' ')[0]}</span>
                <FaUserCircle className="text-3xl text-slate-400" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl py-3 border border-slate-100 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Logged in as</p>
                    <p className="text-sm font-black text-slate-800 truncate">{userData.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-[90%] mx-auto flex items-center justify-center gap-2 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Minimalist & High Contrast */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
            Revolutionizing Food Donation
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight max-w-4xl">
            Giving Surplus <span className="text-green-600">New Purpose</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
            We bridge the gap between waste and want by connecting surplus food from providers directly to local communities in need.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={donorCreate} 
              className="px-10 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Start Donating <FaRocket size={14}/>
            </button>
            <button 
              onClick={volunteerCreate} 
              className="px-10 py-4 bg-white text-slate-800 border-2 border-slate-200 font-black rounded-2xl hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Become a Hero <FaHandsHelping size={18}/>
            </button>
          </div>
        </div>
      </header>

      {/* Features Section - Clean Cards */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Direct Impact. <br/>Zero Friction.</h2>
                <p className="text-slate-500 mt-4 font-medium">Three simple steps to making your community a better place.</p>
            </div>
            <div className="h-px bg-slate-200 flex-grow mx-8 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <FaLeaf className="text-green-600" />, title: "Surplus Collection", desc: "Easily list excess food from events or restaurants in under 60 seconds." },
              { icon: <FaRocket className="text-blue-600" />, title: "Smart Matching", desc: "Our algorithm finds the nearest verified NGO or community shelter instantly." },
              { icon: <FaHandsHelping className="text-orange-600" />, title: "Fast Logistics", desc: "Verified local heroes pick up and deliver food while it's fresh." }
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-slate-50 rounded-[32px] hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border border-transparent hover:border-slate-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform text-2xl">
                    {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us - High Impact Section */}
      <section id="about" className="py-24 bg-slate-900 text-white px-6 rounded-[40px] mx-4 mb-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/20 blur-[120px] rounded-full"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Our Mission</h2>
          <p className="text-xl text-slate-300 font-medium leading-relaxed italic">
            "FoodConnect isn't just an app; it's a logistics revolution for human kindness. We believe that no plate should go to waste while a neighbor goes to bed hungry."
          </p>
          <div className="mt-12 flex justify-center gap-12 text-green-400">
              <div className="text-center">
                  <p className="text-4xl font-black text-white">10k+</p>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1">Meals Shared</p>
              </div>
              <div className="text-center">
                  <p className="text-4xl font-black text-white">500+</p>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1">Volunteers</p>
              </div>
          </div>
        </div>
      </section>

      {/* Footer - Modern & Detailed */}
      <footer id="footer" className="bg-slate-50 border-t border-slate-200 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-green-600 p-1.5 rounded text-white"><FaLeaf size={16}/></div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">FoodConnect</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Leading the fight against urban food waste. Join the movement and feed your city.
            </p>
          </div>
          
          <div>
            <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Explore</h3>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><Link to="/home" className="hover:text-green-600 transition-colors">Dashboard</Link></li>
              <li><button onClick={donorCreate} className="hover:text-green-600 transition-colors uppercase">Give Food</button></li>
              <li><button onClick={volunteerCreate} className="hover:text-green-600 transition-colors uppercase">Volunteer</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Organization</h3>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><button onClick={() => scrollToSection("about")} className="hover:text-green-600 transition-colors uppercase">Our Story</button></li>
              <li><Link to="#" className="hover:text-green-600 transition-colors uppercase">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">Get in Touch</h3>
            <ul className="space-y-4 text-slate-500 text-sm font-medium">
              <li className="flex items-center gap-3"><FaEnvelope className="text-green-600"/> support@foodconnect.com</li>
              <li className="flex items-center gap-3"><FaPhone className="text-green-600"/> +91 8919653968</li>
              <li className="flex items-center gap-3"><FaMapMarkerAlt className="text-green-600"/> Tirupati, India</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">&copy; 2026 FoodConnect Project. Made with Heart for the Needy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;