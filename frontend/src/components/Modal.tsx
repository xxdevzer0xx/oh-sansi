import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-blue">

          <p className="warning-icon">!</p>
          <p className="modal-title">¡ESPERE!</p>
          <p className="modal-title">USTED TODAVIA NO ESTA INSCRITO AUN!!!
             debe pasar por caja facultativa con la boleta de pago!</p>
          <div className="h100 w100"></div>
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition w-full" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;