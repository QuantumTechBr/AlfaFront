import { createContext, useState } from 'react';
import zonaMethods from '../zona-repository';

export const ZonasContext = createContext();

export const ZonasProvider = ({ children }) => {
  const [zonas, setZonas] = useState([]);
  let _consultaAtual;

  const buscaZonas = async ({ force = false } = {}) => {
    let returnData = zonas;
    if (force || zonas.length == 0) {
      if (!_consultaAtual || force) {
        _consultaAtual = zonaMethods.getAllZonas().then((response) => {
          if (response.data == '' || response.data === undefined) response.data = [];
          setZonas(response.data);
          returnData = response.data;
          return returnData;
        });
      }

      await _consultaAtual.then((value) => {
        returnData = value;
      });
    }
    
    return returnData;
  };

  return <ZonasContext.Provider value={{ zonas, buscaZonas }}>{children}</ZonasContext.Provider>;
};
