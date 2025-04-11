import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { CompForm } from './pages/CompForm';
import { Registration } from './pages/Registration';
import { PaymentConfirmation } from './pages/PaymentConfirmation';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import Layout from './components/Layout';
import Home from './pages/Home';

import AdminPanel from './pages/AdminPanel';
import Convocatoria from './pages/Convocatoria';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion/:convocatoriaId" element={<CompForm />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/Convocatoria" element={<Convocatoria/>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;