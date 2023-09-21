'use client';
// sections


import { RegistroAprendizagemDiagnosticoCreateView } from "src/sections/registro_aprendizagem/view";
import { useEffect, useState, useContext } from 'react';
import { TurmasContext } from "src/sections/turma/context/turma-context";
import { Box } from "@mui/material";



// ----------------------------------------------------------------------

export const metadata = {
  title: 'Nova Avaliação de Diagnóstico',
};

export default function RegistroAprendizagemDiagnosticoCreatePage() {   
    const {buscaTurmaPorId} = useContext(TurmasContext);
    const turmaId = sessionStorage.getItem('dadosDiagnosticoTurma');
    const periodo = sessionStorage.getItem('dadosDiagnosticoPeriodo');
    const [turmaBuscada, setTurmaBuscada] = useState({});
    const [renderizarTabela, setRenderizarTabela] = useState(false);

    const buscaTurma = async (turmaId) => {
        const retornoBusca = await buscaTurmaPorId({ id: turmaId });
        setTurmaBuscada(retornoBusca)  ;  
        setRenderizarTabela(true);
    }

    useEffect(() => {
        buscaTurma(turmaId)
      }, []);

    return (
        <Box>
            {(renderizarTabela) && (<RegistroAprendizagemDiagnosticoCreateView turma={turmaBuscada} periodo={periodo} />)}      
        </Box>
        
    )
}
