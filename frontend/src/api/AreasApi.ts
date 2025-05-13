import axiosInstance from './axiosInstance';

export const getAreasPorConvocatoria = async () => {
  const response = await axiosInstance.get('/areas-por-convocatoria');
  return response.data;
};

