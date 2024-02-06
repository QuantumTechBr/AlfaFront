'use client';

import { RegistroAprendizagemDiagnosticoCreateView } from "src/sections/registro_aprendizagem/view";
import { useEffect, useState, useContext } from 'react';
import { Box } from "@mui/material";
import turmaMethods from "src/sections/turma/turma-repository";


export default function RegistroAprendizagemDiagnosticoCreatePage() {   
    const turmaId = sessionStorage.getItem('dadosDiagnosticoTurma');
    const periodo = sessionStorage.getItem('dadosDiagnosticoPeriodo');
    const [turmaBuscada, setTurmaBuscada] = useState({});
    const [renderizarTabela, setRenderizarTabela] = useState(false);

    const buscaTurma = async (doturmaId) => {
        const retornoBusca = await turmaMethods.getTurmaById(doturmaId)
        setTurmaBuscada(retornoBusca.data)  ;  
        setRenderizarTabela(true);
    }

    useEffect(() => {
        buscaTurma(turmaId)
      }, [turmaId]);

    return (
        <Box>
            {(renderizarTabela) && (<RegistroAprendizagemDiagnosticoCreateView turma={turmaBuscada} periodo={periodo} />)}      
        </Box>
        
    )
}
