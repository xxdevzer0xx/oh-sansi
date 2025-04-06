import React, { useState, useEffect } from 'react';

const grados = ['3roPrimaria', '4toPrimaria', '5toPrimaria', '6toPrimaria', '1roSecundaria', '2doSecundaria', '3roSecundaria', '4toSecundaria', '5toSecundaria', '6toSecundaria'];
const departamentos = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'];

const validarTexto = (texto: string, min: number, max: number) => /^[a-zA-Z\s]{2,50}$/.test(texto) && texto.length >= min && texto.length <= max;
const validarCI = (ci: string) => /^\d{7,9}$/.test(ci);
const validarCorreo = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarCelular = (cel: string) => /^[67]\d{7}$/.test(cel);
const validarProvinciaUnidad = (texto:string) => /^[a-zA-Z\s]{3,40}$/.test(texto);

const Modal = ({ isOpen, onClose, materiasDisponibles, selectedMaterias, handleMateriaChange }: {
  isOpen: boolean;
  onClose: () => void;
  materiasDisponibles: string[];
  selectedMaterias: string[];
  handleMateriaChange: (materia: string) => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Selecciona tus Materias</h2>
        <p className="mb-2">Puedes seleccionar hasta 2 materias.</p>
        <div className="grid grid-cols-2 gap-2">
          {materiasDisponibles.map((materia) => (
            <label key={materia} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMaterias.includes(materia)}
                onChange={() => handleMateriaChange(materia)}
              />
              <span>{materia}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedMaterias.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            onClick={onClose}
            disabled={selectedMaterias.length === 0}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export function CompForm() {
  const [modalOpen, setModalOpen] = useState(false);
  const [grado, setGrado] = useState(grados[0]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<string[]>([]);
  const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sector 1 - Estudiante
  const [datosEstudiante, setDatosEstudiante] = useState({
    apellidos: '',
    nombres: '',
    ci: '',
    nacimiento: '',
    correo: '',
    celular: '',
    departamento: departamentos[0],
    provincia: '',
    unidad: ''
  });

  // Sector 2 - Tutores Académicos
  const [tutores, setTutores] = useState<{ [key: string]: any }>({});

  // Sector 3 - Tutor Legal
  const [tutorLegal, setTutorLegal] = useState({
    apellidos: '',
    nombres: '',
    ci: '',
    correo: '',
    celular: ''
  });

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/obtener-materias?grado=${grado}`);
        const data = await response.json();
        setMateriasDisponibles(data.materias);
        setSelectedMaterias([]);
        setTutores({});
      } catch (error) {
        console.error("Error obteniendo áreas:", error);
      }
    };
    fetchMaterias();
  }, [grado]);

  const handleMateriaChange = (materia: string) => {
    if (selectedMaterias.includes(materia)) {
      const newMaterias = selectedMaterias.filter(m => m !== materia);
      setSelectedMaterias(newMaterias);
      const newTutores = { ...tutores };
      delete newTutores[materia];
      setTutores(newTutores);
    } else {
      if (selectedMaterias.length < 2) {
        setSelectedMaterias([...selectedMaterias, materia]);
        setTutores({ ...tutores, [materia]: { apellidos: '', nombres: '', ci: '', correo: '', celular: '' } });
      }
    }
  };

  const actualizarTutor = (materia: string, campo: string, valor: string) => {
    setTutores({
      ...tutores,
      [materia]: {
        ...tutores[materia],
        [campo]: valor
      }
    });
  };

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};

    // Sector 1 validations
    if (!validarTexto(datosEstudiante.apellidos, 2, 50)) newErrors.apellidos = "Apellidos inválidos.";
    if (!validarTexto(datosEstudiante.nombres, 2, 50)) newErrors.nombres = "Nombres inválidos.";
    if (!validarCI(datosEstudiante.ci)) newErrors.ci = "CI inválido.";
    if (!datosEstudiante.nacimiento) newErrors.nacimiento = "Fecha de nacimiento requerida.";
    if (datosEstudiante.correo && !validarCorreo(datosEstudiante.correo)) {
      newErrors.correo = "Correo inválido.";  }
    if (datosEstudiante.celular && !validarCelular(datosEstudiante.celular)) {
        newErrors.celular = "Celular inválido."; }
    if (!validarProvinciaUnidad(datosEstudiante.provincia)) newErrors.provincia = "Provincia inválida.";
    if (!validarProvinciaUnidad(datosEstudiante.unidad)) newErrors.unidad = "Unidad Educativa inválida.";

    // Sector 2 validations
    if (selectedMaterias.length === 0) newErrors.materias = "Seleccione al menos 1 materia.";
    selectedMaterias.forEach(materia => {
      if (tutores[materia].apellidos && !validarTexto(tutores[materia].apellidos, 2, 50)) newErrors[`${materia}_apellidos`] = "Apellidos inválidos.";
      if (tutores[materia].nombres && !validarTexto(tutores[materia].nombres, 2, 50)) newErrors[`${materia}_nombres`] = "Nombres inválidos.";
      if (tutores[materia].ci && !validarCI(tutores[materia].ci)) newErrors[`${materia}_ci`] = "CI inválido.";
      if (tutores[materia].correo && !validarCorreo(tutores[materia].correo)) newErrors[`${materia}_correo`] = "Correo inválido.";
      if (tutores[materia].celular && !validarCelular(tutores[materia].celular)) newErrors[`${materia}_celular`] = "Celular inválido.";
    });

    // Sector 3 validations
    if (!validarTexto(tutorLegal.apellidos, 2, 50)) newErrors.tutorLegal_apellidos = "Apellidos inválidos.";
    if (!validarTexto(tutorLegal.nombres, 2, 50)) newErrors.tutorLegal_nombres = "Nombres inválidos.";
    if (!validarCI(tutorLegal.ci)) newErrors.tutorLegal_ci = "CI inválido.";
    if (!validarCorreo(tutorLegal.correo)) newErrors.tutorLegal_correo = "Correo inválido.";
    if (!validarCelular(tutorLegal.celular)) newErrors.tutorLegal_celular = "Celular inválido.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const confirmarAccion = (mensaje: string) => {
    if (validateForm()) {
      if (window.confirm(mensaje)) {
        alert("Datos enviados correctamente.");
      }
    } else {
      alert("Por favor, corrija los errores en el formulario.");
    }
  };

  return (
    <form className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-semibold">Datos del Estudiante</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Apellidos', campo: 'apellidos', tipo: 'text' },
          { label: 'Nombres', campo: 'nombres', tipo: 'text' },
          { label: 'CI', campo: 'ci', tipo: 'text' },
          { label: 'Fecha de Nacimiento', campo: 'nacimiento', tipo: 'date' },
          { label: 'Correo Electrónico', campo: 'correo', tipo: 'email' },
          { label: 'Celular', campo: 'celular', tipo: 'text' },
          { label: 'Provincia', campo: 'provincia', tipo: 'text' },
          { label: 'Unidad Educativa', campo: 'unidad', tipo: 'text' }
        ].map(({ label, campo, tipo }) => (
          <div key={campo}>
            <label className="block text-sm font-medium">{label} </label>
            <input
              type={tipo}
              value={datosEstudiante[campo as keyof typeof datosEstudiante]}
              onChange={e => setDatosEstudiante({ ...datosEstudiante, [campo]: e.target.value })}
              required
              className={`w-full p-2 border rounded-lg ${errors[campo] ? 'border-red-500' : ''}`}
            />
            {errors[campo] && <p className="text-red-500 text-xs">{errors[campo]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium">Departamento</label>
          <select
            value={datosEstudiante.departamento}
            onChange={(e) => setDatosEstudiante({ ...datosEstudiante, departamento: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            {departamentos.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Grado</label>
          <select value={grado} onChange={(e) => setGrado(e.target.value)} className="w-full p-2 border rounded-lg">
            {grados.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-8">Áreas de Competencia y Tutores Académicos</h2>
        <p className="text-sm text-gray-600 mb-2">Debe seleccionar al menos 1 área.</p>
        <button onClick={(e) => { e.preventDefault(); setModalOpen(true); }} className="bg-blue-500 text-white p-2 rounded-lg mb-4">Elegir Áreas</button>
        {errors.materias && <p className="text-red-500 text-xs">{errors.materias}</p>}

        {selectedMaterias.map(materia => (
          <div key={materia} className="border p-4 mb-4 rounded-md shadow-sm">
            <h4 className="font-semibold mb-2">Datos del Tutor Académico para {materia}</h4>
            {['apellidos', 'nombres', 'ci', 'correo', 'celular'].map(campo => (
              <div key={campo}>
                <input
                  type="text"
                  placeholder={`${campo.charAt(0).toUpperCase() + campo.slice(1)} del tutor`}
                  value={tutores[materia][campo]}
                  onChange={e => actualizarTutor(materia, campo, e.target.value)}
                  className={`w-full p-2 border rounded-lg mb-2 ${errors[`${materia}_${campo}`] ? 'border-red-500' : ''}`}
                />
                {errors[`${materia}_${campo}`] && <p className="text-red-500 text-xs">{errors[`${materia}_${campo}`]}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-8">Datos del Tutor Legal</h2>
        {['apellidos', 'nombres', 'ci', 'correo', 'celular'].map(campo => (
          <div key={campo} className="mb-2">
            <label className="block text-sm font-medium">{campo.charAt(0).toUpperCase() + campo.slice(1)} *</label>
            <input
              type="text"
              value={tutorLegal[campo as keyof typeof tutorLegal]}
              onChange={e => setTutorLegal({ ...tutorLegal, [campo]: e.target.value })}
              required
              className={`w-full p-2 border rounded-lg ${errors[`tutorLegal_${campo}`] ? 'border-red-500' : ''}`}
            />
            {errors[`tutorLegal_${campo}`] && <p className="text-red-500 text-xs">{errors[`tutorLegal_${campo}`]}</p>}
          </div>
        ))}
      </div>

      <div className="flex gap-4 justify-end mt-6">
        <button
          type="button"
          onClick={() => confirmarAccion("¿Está seguro que los datos proporcionados son correctos? Una vez presione aceptar no podrá realizar cambios.")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Terminar Inscripción
        </button>
        <button
          type="button"
          onClick={() => confirmarAccion("¿Desea inscribir otro estudiante? Los datos actuales no podrán ser modificados.")}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
        >
          Inscribir Otro Estudiante
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        materiasDisponibles={materiasDisponibles}
        selectedMaterias={selectedMaterias}
        handleMateriaChange={handleMateriaChange}
      />
    </form>
  );
}