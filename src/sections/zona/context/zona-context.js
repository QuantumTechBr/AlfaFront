import { createContext, useState } from 'react';
import zonaMethods from '../zona-repository';

export const ZonasContext = createContext();

export const ZonasProvider = ({ children }) => {
  const [zonas, setZonas] = useState([]);

  const buscaZonas = async ({ force = false } = {}) => {
    if (force || zonas.length == 0) {
      await zonaMethods.getAllZonas().then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        setZonas(response.data);
      });
    }
  };

  return (
    <ZonasContext.Provider value={{ zonas, buscaZonas }}>{children}</ZonasContext.Provider>
  );
};
