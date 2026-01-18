import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        emailOrUsername: formData.identifier,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);
      alert("Login Successful!");
      navigate("/home");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-slate-50 font-sans p-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.8 } }}
    >
      {/* Background Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-green-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-60" />

      <motion.div
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-200/50 p-10 md:p-12 border border-white relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.2 } }}
      >
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200">
            <FaLeaf size={28} />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium mt-2 tracking-tight text-lg">Enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Input */}
          <div className="relative group">
            <FiUser className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="text"
              id="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Email or Username"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium text-slate-800"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <FiLock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium text-slate-800"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Login Button */}
          <motion.button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-green-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In <FiArrowRight />
          </motion.button>
        </form>

        {/* Navigation Link */}
        <p className="text-slate-500 font-medium mt-8 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-600 font-black hover:text-green-700 tracking-tight transition-colors"
          >
            Create One
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;