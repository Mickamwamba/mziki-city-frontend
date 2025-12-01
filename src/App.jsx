import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyMusic from './pages/MyMusic';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import Albums from './pages/Albums';
import AlbumDetails from './pages/AlbumDetails';
import SongDetails from './pages/SongDetails';
import Wallet from './pages/Wallet';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import NewRelease from './pages/NewRelease';
import Marketplace from './pages/Marketplace';
import ReleaseRequests from './pages/ReleaseRequests';
import ReleaseRequestDetails from './pages/ReleaseRequestDetails';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>;

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/my-music" element={
        <PrivateRoute>
          <MyMusic />
        </PrivateRoute>
      } />

      <Route path="/albums" element={
        <PrivateRoute>
          <Albums />
        </PrivateRoute>
      } />

      <Route path="/albums/:id" element={
        <PrivateRoute>
          <AlbumDetails />
        </PrivateRoute>
      } />

      <Route path="/songs/:id" element={
        <PrivateRoute>
          <SongDetails />
        </PrivateRoute>
      } />

      <Route path="/wallet" element={
        <PrivateRoute>
          <Wallet />
        </PrivateRoute>
      } />

      <Route path="/upload" element={
        <PrivateRoute>
          <Upload />
        </PrivateRoute>
      } />

      <Route path="/marketplace" element={
        <PrivateRoute>
          <Marketplace />
        </PrivateRoute>
      } />

      <Route path="/new-release" element={
        <PrivateRoute>
          <NewRelease />
        </PrivateRoute>
      } />

      <Route path="/release-requests" element={
        <PrivateRoute>
          <ReleaseRequests />
        </PrivateRoute>
      } />

      <Route path="/release-requests/:id" element={
        <PrivateRoute>
          <ReleaseRequestDetails />
        </PrivateRoute>
      } />

      <Route path="/analytics" element={
        <PrivateRoute>
          <Analytics />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default App;
