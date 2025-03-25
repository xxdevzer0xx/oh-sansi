import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Registration } from './pages/Registration';
import { PaymentConfirmation } from './pages/PaymentConfirmation';
import { Admin } from './pages/Admin';
import { CompForm } from './pages/CompForm';
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/confirmacion" element={<PaymentConfirmation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/compForm" element={<CompForm />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App