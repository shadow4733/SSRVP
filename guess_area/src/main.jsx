import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import GameSetupPage from './pages/GameSetupPage';
import GamePageWithSession from './pages/GamePageWithSession';
import GameResultsPage from './pages/GameResultsPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/game-setup" 
            element={
              <PrivateRoute>
                <GameSetupPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/game/:sessionId" 
            element={
              <PrivateRoute>
                <GamePageWithSession />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/game-results/:sessionId" 
            element={
              <PrivateRoute>
                <GameResultsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/game" 
            element={
              <PrivateRoute>
                <GamePage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);