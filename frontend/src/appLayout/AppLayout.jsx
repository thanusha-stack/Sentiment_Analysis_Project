import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import WelcomePage from '../pages/Welcome';
import Register from '@/pages/Register';
import LoginPage from '@/pages/Login';
import UploadPage from '@/pages/Upload';


function AppLayout() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/Upload" element={<UploadPage />} />
        </Routes>
        
    </Router>
  );
}

export default AppLayout;