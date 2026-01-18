import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiUser, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";

const Registration = () => {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        phonenum: "",
        address: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            alert("Registration Successful!");
            setFormData({ email: "", name: "", password: "", phonenum: "", address: "" });
        } catch (err) {
            setErrors({ general: err.response?.data?.message || "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col lg:flex-row bg-white font-sans selection:bg-green-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8 } }}
        >
            {/* Left Side - Impact Branding */}
            <div className="lg:w-[45%] bg-slate-900 flex flex-col justify-center p-8 lg:p-20 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-green-500/20 rounded-full blur-[100px]" />
                
                <motion.div 
                    className="relative z-10"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
                >
                    <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
                        Start Your <span className="text-green-500">Impact</span> Journey.
                    </h1>
                    <p className="text-slate-400 text-lg mb-10 max-w-md">
                        Join thousands of donors and volunteers reducing waste and feeding communities in real-time.
                    </p>

                    <div className="space-y-6">
                        {[
                            "Share surplus food effortlessly",
                            "Real-time local connection",
                            "Verified volunteer logistics",
                            "Track your community impact"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                                <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="mt-16 pt-10 border-t border-slate-800 relative z-10">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Global Food Redistribution Project</p>
                </div>
            </div>

            {/* Right Side - Refined Form */}
            <div className="lg:w-[55%] flex flex-col justify-center items-center bg-slate-50 p-6 lg:p-12">
                <motion.div
                    className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-8 lg:p-12 border border-slate-100"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
                >
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 font-medium mt-1">Please enter your details to register.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="relative group md:col-span-2">
                                <FiUser className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                <input
                                    type="text" id="name" value={formData.name} onChange={handleChange}
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Email */}
                            <div className="relative group md:col-span-2">
                                <FiMail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                <input
                                    type="email" id="email" value={formData.email} onChange={handleChange}
                                    placeholder="Email Address"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Phone */}
                            <div className="relative group">
                                <FiPhone className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                <input
                                    type="text" id="phonenum" value={formData.phonenum} onChange={handleChange}
                                    placeholder="Phone Number"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium"
                                />
                                <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="relative group">
                            <FiMapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                            <textarea
                                id="address" value={formData.address} onChange={handleChange}
                                placeholder="Home/Business Address"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium h-24 resize-none"
                            />
                        </div>

                        {errors.general && (
                            <p className="text-sm text-red-500 font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">
                                {errors.general}
                            </p>
                        )}

                        <motion.button
                            type="submit" disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-green-600 transition-all active:scale-95 disabled:bg-slate-300"
                            whileHover={{ y: -2 }}
                        >
                            {loading ? "Creating Account..." : "Join Movement"}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">
                            Already a member?{" "}
                            <Link to="/login" className="text-green-600 hover:text-green-700 font-black tracking-tight">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Registration;