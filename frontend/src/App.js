import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Idea from "./components/idea";
import VolunteerDashboard from "./components/volunteer_dashboard";
import DonorDashboard from "./components/donor_dashboard";
import Home from "./components/home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Idea/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/home" element={<Home />} />

      </Routes>
    </Router>
  );
}

export default App;
