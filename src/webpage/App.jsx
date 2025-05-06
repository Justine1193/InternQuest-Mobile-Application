import './App.css';
import React from 'react';
import Login from '../components/LoginComponents/login.jsx';
import Dashboard from '../components/DashboardComponents/dashboard.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {

    return (
        <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    );

}

export default App
