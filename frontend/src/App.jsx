import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FindSpacePage from './pages/FindSpacePage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage';
import CreateListingPage from './pages/CreateListingPage';
import PricingPage from './pages/PricingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/find-space" element={<FindSpacePage />} />
          <Route path="/pricing" element={<PricingPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </main>
      <Chatbot />
    </>
  );
}

export default App;
