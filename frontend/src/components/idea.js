import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLeaf, FaHandsHelping, FaGlobeAmericas, FaArrowRight, FaRoute, FaChevronDown } from "react-icons/fa";

const Idea = () => {
  const heroTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- Section 1: Hero View (100vh) --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 bg-[#fafafa]">
        {/* Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[500px] h-[500px] bg-lime-100/40 rounded-full blur-[120px]" />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...heroTransition, delay: 0.1 }}
          className="relative z-10 inline-flex items-center gap-2 bg-white border border-emerald-100 text-emerald-700 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] py-2 px-5 rounded-full mb-8 shadow-sm"
        >
          <FaLeaf className="animate-pulse" /> Solving Hunger, Reducing Waste
        </motion.div>

        {/* Refined Main Caption */}
        <div className="relative z-10 max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroTransition, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8"
          >
            Smart Surplus Food <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-500">
              Redistribution.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-base md:text-xl text-slate-500 mb-10 max-w-xl mx-auto font-medium leading-relaxed"
          >
            An intelligent logistics ecosystem connecting excess food from providers to local communities in real-time.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...heroTransition, delay: 0.3 }}
          className="relative z-10 flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ y: -3, backgroundColor: "#059669" }}
              whileTap={{ scale: 0.97 }}
              className="group bg-slate-900 text-white py-4 px-10 rounded-2xl font-bold text-base shadow-xl transition-all flex items-center gap-3 active:scale-95"
            >
              Join Movement <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ y: -3, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.97 }}
              className="bg-white border border-slate-200 text-slate-900 py-4 px-10 rounded-2xl font-bold text-base shadow-sm transition-all"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 flex flex-col items-center text-slate-400 gap-2 cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Explore Features</p>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <FaChevronDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* --- Section 2: Bento Grid --- */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {/* Card 1 */}
          <div className="group bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FaGlobeAmericas />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Eco-Impact</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Reducing landfill methane by repurposing surplus meals into resources.</p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="w-12 h-12 bg-lime-50 text-lime-600 rounded-xl flex items-center justify-center mb-6 text-xl group-hover:bg-lime-600 group-hover:text-white transition-colors">
              <FaRoute />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Logic</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Real-time GPS routing to ensure food reaches the needy while fresh.</p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FaHandsHelping />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Community</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Empowering volunteers and donors to build a zero-hunger society.</p>
          </div>
        </motion.div>
        <div className="h-16" />
      </section>

    </div>
  );
};

export default Idea;