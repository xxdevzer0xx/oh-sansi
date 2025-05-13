import React, { useState, useEffect } from 'react';
import '../styles/CamposObligatorios.css';
import { RequisitoConvocatoria } from '../types/RequisitoConvocatoria'; 
import { fetchConvocatorias, fetchRequisitosConvocatoria, saveRequisitosConvocatoria } from '../api/requisitoConvocatoria';
import { getAreasPorConvocatoria } from '../api/adminConvocatoriaApi';


import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, MenuItem, Select, Typography
} from '@mui/material';

interface Convocatoria {
  id_convocatoria: number;
  nombre: string;
}


interface Area {
  id_area: number;
  area: {
    nombre_area: string;
  };
}
interface Props {
  // Puedes pasar un ID de convocatoria inicial si es necesario
  initialConvocatoriaId?: number;
}

const AreasAnexos: React.FC<Props> = ({ initialConvocatoriaId }) => {
  const [convocatorias, setConvocatorias] = useState<{ id_convocatoria: number; nombre: string }[]>([]);
 // const [areas, setAreas] = useState<Record<string, any>[]>([]);
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | undefined>(initialConvocatoriaId);
  const [loadingConvocatorias, setLoadingConvocatorias] = useState(true);
  const [loadingRequisitos, setLoadingRequisitos] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const [areas, setAreas] = useState<Area[]>([]);
    const [modalAbierto, setModalAbierto] = useState<number | null>(null);
    const [archivo, setArchivo] = useState<File | null>(null);
  
  useEffect(() => {
    const loadConvocatorias = async () => {
      try {
        const data = await fetchConvocatorias();
        setConvocatorias(data);
        setLoadingConvocatorias(false);
        if (initialConvocatoriaId) {
          setSelectedConvocatoriaId(initialConvocatoriaId);
        }
      } catch (error: any) {
        setError('Error al cargar las convocatorias: ' + error.message);
        setLoadingConvocatorias(false);
      }
    };

    loadConvocatorias();
  }, [initialConvocatoriaId]);

  useEffect(() => {
    const loadRequisitos = async () => {
      if (selectedConvocatoriaId) {
        setLoadingRequisitos(true);
        try {

          const data = await getAreasPorConvocatoria(selectedConvocatoriaId);
           console.log(data);
           setAreas(data);
          //   const initialRequisitosGuardados: Record<string, boolean> = {};
        //   data.forEach((requisito) => {
        //     initialRequisitosGuardados[`${requisito.entidad}.${requisito.campo}`] = true;
        //   });
        //   setRequisitosGuardados(initialRequisitosGuardados);
        //   setLoadingRequisitos(false);
        } catch (error: any) {
          setError('Error al cargar los requisitos: ' + error.message);
         
        }
      } else {
        
      }
    };

    loadRequisitos();
  }, [selectedConvocatoriaId]);


  const handleSubirArchivo = async (id_area: number) => {
    console.log('Preparado para subir archivo para el área:', id_area);
    console.log('Archivo seleccionado:', archivo);
    // TODO: implementar subida al backend

    setModalAbierto(null);
    setArchivo(null);
  };

  const handleConvocatoriaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(event.target.value, 10);
    setSelectedConvocatoriaId(isNaN(id) ? undefined : id);
  };


    const [file, setFile] = useState<File | null>(null);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    };


  if (loadingConvocatorias) {
    return <div>Cargando convocatorias...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="registro-requisitos">
      <h2>Configuracion de Campos Obligatorios</h2>

      <div className="select-container">
        <label htmlFor="convocatoria">Seleccionar Convocatoria:</label>
        <select
          id="convocatoria"
          value={selectedConvocatoriaId || ''}
          onChange={handleConvocatoriaChange}
        >
          <option value="">-- Seleccionar --</option>
          {convocatorias.map((convocatoria) => (
            <option key={convocatoria.id_convocatoria} value={convocatoria.id_convocatoria}>
              {convocatoria.nombre}
            </option>
          ))}
        </select>
      </div>


      <div style={{ marginTop: '2rem' }}>
        {areas.map((area) => (
          <div
            key={area.id_area}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <Typography>{area.area?.nombre_area}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setModalAbierto(area.id_area)}
            >
              Agregar Documento
            </Button>

            <Dialog open={modalAbierto === area.id_area} onClose={() => setModalAbierto(null)}>
              <DialogTitle>Subir Documento para {area.nombre_area}</DialogTitle>
              <DialogContent>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file?.type !== 'application/pdf') {
                      alert('Solo se permiten archivos PDF');
                      return;
                    }
                    setArchivo(file);
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setModalAbierto(null)}>Cancelar</Button>
                <Button
                  variant="contained"
                  onClick={() => handleSubirArchivo(area.id_area)}
                  disabled={!archivo}
                >
                  Agregar (pendiente)
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        ))}
      </div>

{/* 
      {selectedConvocatoriaId && ( 
          areas.map( area  => (
            <div className='border p-15 '>
                <div>

                <div id={area.id_convocatoria_area}  className='text-sm font-medium text-gray-900'>
                    {area.nombre_area}
                </div>
                    <p>
                        Subir Anexo para convocatoria   
                    </p>
                    <input id={'file'+area.id_convocatoria_area} type="file" onChange={handleFileChange} />
                </div>

            </div>)
        )
      )} */}
    </div>
  );
};

export default AreasAnexos;