import { createContext, useState } from 'react';
import zonaMethods from '../zona-repository';
import { preDefinedZonaOrder } from 'src/_mock';

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

          const _sorted = response.data.sort((a, b) => {
            const na = preDefinedZonaOrder[a.nome] ?? 0;
            const nb = preDefinedZonaOrder[b.nome] ?? 0;
            return na - nb;
          });

          setZonas(_sorted);
          returnData = _sorted;
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
