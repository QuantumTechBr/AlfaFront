'use client';
// sections

import { AvaliacaoDiagnosticoCreateView } from "src/sections/avaliacao/view";
import { useEffect, useState, useContext } from 'react';
import { Box } from "@mui/material";
import turmaMethods from "src/sections/turma/turma-repository";


// ----------------------------------------------------------------------

export default function AvaliacaoDiagnosticoCreatePage() {   
    const turmaId = sessionStorage.getItem('dadosDiagnosticoTurma');
    const periodo = sessionStorage.getItem('dadosDiagnosticoPeriodo');
    const [turmaBuscada, setTurmaBuscada] = useState({});
    const [renderizarTabela, setRenderizarTabela] = useState(false);

    const buscaTurma = async (id) => {
        const retornoBusca = await turmaMethods.getTurmaById(id)
        setTurmaBuscada(retornoBusca.data)  ;  
        setRenderizarTabela(true);
    }

    useEffect(() => {
        buscaTurma(turmaId)
      }, [turmaId]);

    return (
        <Box>
            {(renderizarTabela) && (<AvaliacaoDiagnosticoCreateView turma={turmaBuscada} periodo={periodo} />)}      
        </Box>
        
    )
}
