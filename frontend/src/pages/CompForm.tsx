import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const competencies = [
  'Matemáticas', 'Ciencias', 'Historia', 'Arte', 'Deportes', 'Tecnología', 'Idiomas'
];

export function CompForm() {
  const navigate = useNavigate();
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleCompetencyChange = (competency: string) => {
    if (selectedCompetencies.includes(competency)) {
      setSelectedCompetencies(selectedCompetencies.filter(c => c !== competency));
    } else {
      if (selectedCompetencies.length < 2) {
        setSelectedCompetencies([...selectedCompetencies, competency]);
      } else {
        setError('Solo puedes seleccionar un máximo de 2 áreas de competencia.');
        return;
      }
    }
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompetencies.length === 0) {
      setError('Debes seleccionar al menos una área de competencia.');
      return;
    }
    navigate('/confirmacion', { state: { competencies: selectedCompetencies } });
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Selecciona tus Áreas de Competencia</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {competencies.map((competency) => (
                <label key={competency} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCompetencies.includes(competency)}
                    onChange={() => handleCompetencyChange(competency)}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>{competency}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Enviar Selección
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}