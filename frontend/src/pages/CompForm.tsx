import React, { useState, useEffect } from 'react';

const grados = ['3roPrimaria', '4toPrimaria', '5toPrimaria', '6toPrimaria', '1roSecundaria', '2doSecundaria', '3roSecundaria', '4toSecundaria', '5toSecundaria', '6toSecundaria'];

const Modal = ({ isOpen, onClose, materiasDisponibles, selectedMaterias, handleMateriaChange }: {


  isOpen: boolean;
  onClose: () => void;
  materiasDisponibles: string[];
  selectedMaterias: string[];
  handleMateriaChange: (materia: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              <span>{materia}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button 
            className={`px-4 py-2 rounded ${selectedMaterias.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            onClick={onClose}
            disabled={selectedMaterias.length === 0}
          >Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export function CompForm() {
  const [ci, setCi] = useState('');
  const [grado, setGrado] = useState(grados[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<string[]>([]);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/obtener-materias?grado=${grado}`);
        const data = await response.json();
        setMateriasDisponibles(data.materias);
        setSelectedMaterias([]);
      } catch (error) {
        console.error("Error obteniendo materias:", error);
      }
    };
    fetchMaterias();
  }, [grado]);

  const handleMateriaChange = (materia: string) => {
    if (selectedMaterias.includes(materia)) {
      setSelectedMaterias(selectedMaterias.filter(m => m !== materia));
    } else {
      if (selectedMaterias.length < 2) {
        setSelectedMaterias([...selectedMaterias, materia]);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Formulario de Inscripción</h2>
      <label className="block text-sm font-medium">Cédula de Identidad</label>
      <input
        type="text"
        value={ci}
        onChange={(e) => setCi(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
      />
      
      <label className="block text-sm font-medium">Grado</label>
      <select value={grado} onChange={(e) => setGrado(e.target.value)} className="w-full p-2 border rounded-lg mb-4">
        {grados.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      
      <h3 className="text-lg font-semibold mb-2">Areas a Competir</h3>
      {selectedMaterias.length > 0 ? (
        <ul className="mb-4">
          {selectedMaterias.map((materia) => (
            <li key={materia} className="text-gray-700">{materia}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-4">Aún no has seleccionado ninguna materia.</p>
      )}
      
      <button onClick={() => setModalOpen(true)} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
        Elegir Áreas de Competencia
      </button>
      
      <Modal isOpen={modalOpen}
      onClose={() => setModalOpen(false)} 
      materiasDisponibles={materiasDisponibles}
      selectedMaterias={selectedMaterias} 
      handleMateriaChange={handleMateriaChange} />
    </div>
  );
}
