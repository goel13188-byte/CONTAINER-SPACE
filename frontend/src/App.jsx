import React, { useEffect } from 'react';
import api from './services/api';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FindSpacePage from './pages/FindSpacePage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import SellerProfilePage from './pages/SellerProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage';
import CreateListingPage from './pages/CreateListingPage';
import PricingPage from './pages/PricingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Chatbot from './components/Chatbot';

function App() {
  // Wake the Render free-tier API while the user browses the site, rather than
  // making the login request pay the entire cold-start delay.
  useEffect(() => {
    api.get('/health', { timeout: 90000 }).catch(() => {
      // A failed warm-up should never prevent the frontend from rendering.
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/find-space" element={<FindSpacePage />} />
          <Route path="/listing/:id" element={<ListingDetailsPage />} />
          <Route path="/company/:id" element={<SellerProfilePage />} />
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
