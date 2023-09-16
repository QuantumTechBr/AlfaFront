import { createContext, useState } from 'react';
import documentoMethods from '../documento-repository';

export const DocumentoContext = createContext();

export const DocumentoProvider = ({ children }) => {
    const [documentos, setDocumentos] = useState([]);

    const buscaDocumentos = async ({ force = false } = {}) => {
        if (force || documentos.length == 0) {
            await documentoMethods.getAllEscolas().then((response) => {
                if (response.data == '' || response.data === undefined) response.data = [];
                setDocumentos(response.data);
            });
        }
    };

    return (
        <DocumentosContext.Provider value={{ documentos, buscaDocumentos }}>{children}</DocumentosContext.Provider>
    );
};
