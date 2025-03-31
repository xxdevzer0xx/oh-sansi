import { jsPDF } from "jspdf";
import type { RegistrationSummary } from '../types';

export const generatePDF = async (summary :RegistrationSummary) => {

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [180, 120],
  });
  pdf.setFont('Courier');

  const content = [
    '+++++++++++++++++++++++++++++++' ,
    `Tutor: ${summary.student.guardian.name}`,
    `Postulante: ${summary.student.name}`,
    `Areas a inscribir:`, 
    ...summary.areas.map( area => `     ${area.name}`),
    `Total : ${summary.totalCost}    Bs. `,
    '+++++++++++++++++++++++++++++++'
  ];

  content.forEach((element, i) => {
    pdf.text(element, 10, 10*(i+1));
  });

  const date = new Date();
  const dateParsed = date.getDate() + "-"+ date.getMonth()+ "-" +date.getFullYear(); 
  pdf.save(`Boleta de inscripcion ${dateParsed}.pdf`);
};


