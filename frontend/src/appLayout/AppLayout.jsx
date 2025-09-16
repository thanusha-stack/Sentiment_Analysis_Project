import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import WelcomePage from '../pages/Welcome';
import Register from '@/pages/Register';
import LoginPage from '@/pages/Login';
import UploadPage from '@/pages/Upload';
import Layout from '@/Layout';
import AnalysisPage from '@/pages/Analysis';
import WordCloudPage from '@/pages/WordCloud';


function AppLayout() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Analysis" element={<AnalysisPage />} />
          <Route path="/WordCloud" element={<WordCloudPage />} />
          <Route path="/Upload" element={<UploadPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppLayout;
