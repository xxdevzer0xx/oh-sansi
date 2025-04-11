import React, { useState, useEffect } from 'react';

const validarTexto = (texto: string, min: number, max: number) => /^[a-zA-Z\s]{2,50}$/.test(texto) && texto.length >= min && texto.length <= max;
const validarCI = (ci: string) => /^\d{7,9}$/.test(ci);
const validarCorreo = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarCelular = (cel: string) => /^[67]\d{7}$/.test(cel);
const validarProvinciaUnidad = (texto:string) => /^[a-zA-Z\s]{3,40}$/.test(texto);

const Modal = ({ isOpen, onClose, materiasDisponibles, selectedMaterias, setSelectedMaterias, handleMateriaChange }: {
  isOpen: boolean;
  onClose: () => void;
  materiasDisponibles: { [area: string]: string[] | null };
  selectedMaterias: { [area: string]: string | null };
  setSelectedMaterias: (materias: { [area: string]: string | null }) => void;
  handleMateriaChange: (materia: string, niveles: string[] | null) => void;
}) => {
  if (!isOpen) return null;
  const toggleArea = (area: string) => {
    const updated = { ...selectedMaterias };
    if (selectedMaterias[area]) {
      delete updated[area];
    } else {
      updated[area] = materiasDisponibles[area] && materiasDisponibles[area]!.length > 0
        ? materiasDisponibles[area]![0] // default primer nivel
        : null;
    }
    setSelectedMaterias(updated);
  };

  const updateNivel = (area: string, nivel: string) => {
    setSelectedMaterias({ ...selectedMaterias, [area]: nivel });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[450px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Selecciona tus Materias</h2>
        <p className="mb-2 text-sm text-gray-600">Puedes seleccionar hasta 2 materias.</p>
        <div className="space-y-4">
          {Object.entries(materiasDisponibles).map(([area, niveles]) => {
            const selected = area in selectedMaterias;
            return (
              <div key={area} className="border rounded p-3">
                <label className="flex items-center justify-between">
                  <span className="font-semibold">{area}</span>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleMateriaChange(area, niveles)}
                    disabled={!selected && Object.keys(selectedMaterias).length >= 2}
                  />
                </label>
                {selected && niveles && (
                  <select
                    value={selectedMaterias[area] || ''}
                    onChange={(e) => updateNivel(area, e.target.value)}
                    className="mt-2 w-full p-2 border rounded"
                  >
                    {niveles.map(nivel => (
                      <option key={nivel} value={nivel}>{nivel}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={onClose}>Cancelar</button>
          <button
            className={`px-4 py-2 rounded ${Object.keys(selectedMaterias).length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            onClick={onClose}
            disabled={Object.keys(selectedMaterias).length === 0}
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
  const [provincias, setProvincias] = useState<string[]>([]);
  const [colegios, setColegios] = useState<string[]>([]);
  const [nuevaUnidad, setNuevaUnidad] = useState<string>('');
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [grados, setGrados] = useState<string[]>([]);
  const [grado, setGrado] = useState('');
  const [materiasDisponibles, setMateriasDisponibles] = useState<{ [area: string]: string[] | null }>({});
  const [selectedMaterias, setSelectedMaterias] = useState<{ [area: string]: string | null }>({});

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
    celular: '',
    parentesco: ''
  });

  useEffect(() => {
    const cargarDepartamentos = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/obtener-departamentos");
            const data = await response.json();
            setDepartamentos(data.departamentos);
        } catch (error) {
            console.error("Error obteniendo departamentos:", error);
        }
    };
    const cargarGrados = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/obtener-grados");
            const data = await response.json();
            setGrados(data.grados);
            setGrado(data.grados[0])
        } catch (error) {
            console.error("Error obteniendo grados:", error);
        }
    };
    cargarDepartamentos();
    cargarGrados()
}, []);

useEffect(() => {
    const cargarProvincias = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/obtener-provincias?departamento=${datosEstudiante.departamento}`);
            const data = await response.json();
            setProvincias(data.provincias);
        } catch (error) {
            console.error("Error obteniendo provincias:", error);
        }
    };
    cargarProvincias();
}, [datosEstudiante.departamento]);

useEffect(() => {
    const cargarColegios = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/obtener-colegios?provincia=${datosEstudiante.provincia}`);
            const data = await response.json();
            setColegios(data.colegios);
        } catch (error) {
            console.error("Error obteniendo colegios:", error);
        }
    };
    cargarColegios();
}, [datosEstudiante.provincia]);

const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setDatosEstudiante({ ...datosEstudiante, departamento: e.target.value });
};

const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setDatosEstudiante({ ...datosEstudiante, provincia: e.target.value });
};

const handleNuevaUnidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setNuevaUnidad(e.target.value);
};

const agregarNuevoColegio = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/agregar-colegio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevaUnidad,
        departamento: datosEstudiante.departamento,
        provincia: datosEstudiante.provincia
      }),
    });
      if (response.ok) {
          setColegios([...colegios, nuevaUnidad]);
          setDatosEstudiante({ ...datosEstudiante, unidad: nuevaUnidad });
          setNuevaUnidad('');
      } else {
          console.error("Error al agregar colegio.");
      }
  } catch (error) {
      console.error("Error al agregar colegio:", error);
  }
};

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/obtener-materias?grado=${grado}`);
        const data = await response.json();
        setMateriasDisponibles(data.materias);
        setSelectedMaterias({});
        setTutores({});
      } catch (error) {
        console.error("Error obteniendo áreas:", error);
      }
    };
    fetchMaterias();
  }, [grado]);

  const handleMateriaChange = (materia: string, niveles: string[] | null) => {
    const yaSeleccionada = materia in selectedMaterias;
  
    if (yaSeleccionada) {
      // Quitar materia seleccionada
      const nuevasMaterias = { ...selectedMaterias };
      delete nuevasMaterias[materia];
      setSelectedMaterias(nuevasMaterias);
  
      const nuevosTutores = { ...tutores };
      delete nuevosTutores[materia];
      setTutores(nuevosTutores);
    } else {
      // Limitar máximo 2
      if (Object.keys(selectedMaterias).length < 2) {
        const nuevoNivel = niveles && niveles.length > 0 ? niveles[0] : null;
        setSelectedMaterias({ ...selectedMaterias, [materia]: nuevoNivel });
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
    const selectedAreas = Object.keys(selectedMaterias);

    if (selectedAreas.length === 0) {
      newErrors.materias = "Seleccione al menos 1 materia.";
    }
    selectedAreas.forEach(area => {
      const niveles = materiasDisponibles[area];
      const nivelSeleccionado = selectedMaterias[area];
    
      if (niveles && niveles.length > 0 && (!nivelSeleccionado || nivelSeleccionado === '')) {
        newErrors[`${area}_nivel`] = `Debe seleccionar un nivel para el área ${area}.`;
      }
    });

    selectedAreas.forEach(area => {
    const tutor = tutores[area];
    if (tutor?.apellidos && !validarTexto(tutor.apellidos, 2, 50)) newErrors[`${area}_apellidos`] = "Apellidos inválidos.";
    if (tutor?.nombres && !validarTexto(tutor.nombres, 2, 50)) newErrors[`${area}_nombres`] = "Nombres inválidos.";
    if (tutor?.ci && !validarCI(tutor.ci)) newErrors[`${area}_ci`] = "CI inválido.";
    if (tutor?.correo && !validarCorreo(tutor.correo)) newErrors[`${area}_correo`] = "Correo inválido.";
    if (tutor?.celular && !validarCelular(tutor.celular)) newErrors[`${area}_celular`] = "Celular inválido.";
    });


    // Sector 3 validations
    if (!validarTexto(tutorLegal.apellidos, 2, 50)) newErrors.tutorLegal_apellidos = "Apellidos inválidos.";
    if (!validarTexto(tutorLegal.nombres, 2, 50)) newErrors.tutorLegal_nombres = "Nombres inválidos.";
    if (!validarCI(tutorLegal.ci)) newErrors.tutorLegal_ci = "CI inválido.";
    if (!validarCorreo(tutorLegal.correo)) newErrors.tutorLegal_correo = "Correo inválido.";
    if (!validarCelular(tutorLegal.celular)) newErrors.tutorLegal_celular = "Celular inválido.";
    if (!['Padre', 'Madre', 'Tutor legal'].includes(tutorLegal.parentesco)) {
      newErrors.tutorLegal_parentesco = "Debe seleccionar el parentesco.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const enviarDatosAlBackend = async () => {
    const payload = {
      estudiante: datosEstudiante,
      grado,
      materias: selectedMaterias,
      tutoresAcademicos: tutores,
      tutorLegal
    };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/guardar-inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        alert("Inscripción enviada correctamente.");
      } else {
        alert("Error al enviar los datos.");
        console.error(await response.text());
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };  

  const confirmarAccion = async (mensaje: string, limpiar: boolean) => {
    if (validateForm()) {
      if (window.confirm(mensaje)) {
        await enviarDatosAlBackend();
        if (limpiar) {
          limpiarFormulario();
        }
      }
    } else {
      alert("Por favor, corrija los errores en el formulario.");
    }
  };

  const limpiarFormulario = () => {
    setDatosEstudiante({
      apellidos: '',
      nombres: '',
      ci: '',
      nacimiento: '',
      correo: '',
      celular: '',
      departamento: departamentos[0] || '',
      provincia: '',
      unidad: ''
    });
    setSelectedMaterias({});
    setTutores({});
    setTutorLegal({
      apellidos: '',
      nombres: '',
      ci: '',
      correo: '',
      celular: '',
      parentesco: ''
    });
    setGrado(grados[0] || '');
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
                <select value={datosEstudiante.departamento} onChange={handleDepartamentoChange} className="w-full p-2 border rounded-lg">
                    {departamentos.map(d => <option key={d}>{d}</option>)}
                </select>
        </div>
        <div>
                <label className="block text-sm font-medium">Provincia</label>
                <select value={datosEstudiante.provincia} onChange={handleProvinciaChange} className="w-full p-2 border rounded-lg">
                    {provincias.map(p => <option key={p}>{p}</option>)}
                </select>
        </div>
        <div>
                <label className="block text-sm font-medium">Unidad Educativa</label>
                <select value={datosEstudiante.unidad} onChange={(e) => setDatosEstudiante({ ...datosEstudiante, unidad: e.target.value })} className="w-full p-2 border rounded-lg">
                    {colegios.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="text" value={nuevaUnidad} onChange={handleNuevaUnidadChange} placeholder="Otro colegio" className="w-full p-2 border rounded-lg mt-2" />
                <button type="button" onClick={agregarNuevoColegio} className="bg-blue-500 text-white p-2 rounded-lg mt-2">Agregar Colegio</button>
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
        <button onClick={(e) => { e.preventDefault(); setModalOpen(true); }} className="bg-blue-500 text-white p-2 rounded-lg mb-4">
          Elegir Áreas
        </button>
        {errors.materias && <p className="text-red-500 text-xs">{errors.materias}</p>}

        {Object.keys(selectedMaterias).map(area => (
          <div key={area} className="border p-4 mb-4 rounded-md shadow-sm">
            <h4 className="font-semibold mb-2">Datos del Tutor Académico para {area} ({selectedMaterias[area] || 'Nivel único'})</h4>
            {['apellidos', 'nombres', 'ci', 'correo', 'celular'].map(campo => (
          <div key={campo}>
          <input
            type="text"
            placeholder={`${campo.charAt(0).toUpperCase() + campo.slice(1)} del tutor`}
            value={tutores[area]?.[campo] || ''}
            onChange={e => actualizarTutor(area, campo, e.target.value)}
            className={`w-full p-2 border rounded-lg mb-2 ${errors[`${area}_${campo}`] ? 'border-red-500' : ''}`}
          />
          {errors[`${area}_${campo}`] && <p className="text-red-500 text-xs">{errors[`${area}_${campo}`]}</p>}
          </div>
        ))}
  </div>
))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-8">Datos del Tutor Legal</h2>
        {['apellidos', 'nombres', 'ci', 'correo', 'celular' ].map(campo => (
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

      <div className="mb-2">
        <label className="block text-sm font-medium">Parentesco *</label>
          <select
            value={tutorLegal.parentesco}
            onChange={e => setTutorLegal({ ...tutorLegal, parentesco: e.target.value })}
            className={`w-full p-2 border rounded-lg ${errors.tutorLegal_parentesco ? 'border-red-500' : ''}`}
          >
         <option value="">Seleccione...</option>
         <option value="Padre">Padre</option>
         <option value="Madre">Madre</option>
         <option value="Tutor legal">Tutor legal</option>
          </select>
        {errors.tutorLegal_parentesco && (
        <p className="text-red-500 text-xs">{errors.tutorLegal_parentesco}</p>
       )}
      </div>

      </div>

      <div className="flex gap-4 justify-end mt-6">
      <button
        type="button"
        onClick={() =>
          confirmarAccion(
          "¿Está seguro que los datos proporcionados son correctos? Una vez presione aceptar no podrá realizar cambios.",
          false
          )
        }
        className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
        Terminar Inscripción
      </button>
      <button
        type="button"
        onClick={() =>
          confirmarAccion(
            "¿Desea inscribir otro estudiante? Los datos actuales no podrán ser modificados.",
            true
            )
        }
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
        setSelectedMaterias={setSelectedMaterias}
        handleMateriaChange={handleMateriaChange}
      />
    </form>
  );
}