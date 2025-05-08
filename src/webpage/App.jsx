import './App.css';
import React from 'react';
import Login from '../components/LoginComponents/login.jsx';
import Dashboard from '../components/DashboardComponents/dashboard.jsx'
import StudentDashboard from '../components/StudentComponents/StudentDashboard.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/StudentDashboard" element={<StudentDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;