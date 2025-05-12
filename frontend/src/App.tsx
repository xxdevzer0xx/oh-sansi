import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import AdminPanel from './pages/AdminPanel';
import CamposObligatorios from './pages/CamposObligatorios';
import RegistroExcel from './pages/RegistroExcel'

import CrearAreas from './pages/CrearAreas';
import EstadoInscripcion from './pages/EstadoInscripcion';
import AmpliarFecha from './pages/AmpliarFecha';
import AgregarDocumento from './pages/AgregarDocumento';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<Registration />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/crearAreas" element={<CrearAreas />} />
          <Route path="/estadoInscripcion" element={<EstadoInscripcion />} />
          <Route path="/camposobligatorios" element={<CamposObligatorios />} />
          <Route path="/registroexcel" element={<RegistroExcel />} />
          <Route path="/ampliarFecha" element={<AmpliarFecha />} />
          <Route path="/agregarDoc" element={<AgregarDocumento />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;