import * as React from 'react';
import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';

// components
import { RHFTextField } from 'src/components/hook-form';
import { useFormContext, Controller } from 'react-hook-form';

// _mock
import { RegistroAprendizagemFasesCRUD, RegistroAprendizagemFasesEscrita } from 'src/_mock';
import { RegistroAprendizagemFasesLeitura } from 'src/_mock';
//
import { FormControl, TextField } from '@mui/material';
import { slugify } from 'src/utils/functions';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/auth/context/alfa';
import { useBoolean } from 'src/hooks/use-boolean';
import { RegistroAprendizagemContext } from 'src/sections/registro_aprendizagem/context/registro-aprendizagem-context';
import { useCallback } from 'react';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ row, bimestres }) {
  
  const { registroAprendizagemFase, buscaRegistroAprendizagemFaseByTurmaIdBimestreId, melhorResultadoAlunoTurma } = useContext(RegistroAprendizagemContext);
  const { user } = useContext(AuthContext);
  const desabilita = useBoolean(false);
  const { id: aluno_turma_id, aluno } = row;
  const { control, getValues, setValue } = useFormContext();
  const resultado = getValues('registros[' + aluno_turma_id + '].resultado');
  const turmaId = getValues('turma.id')
  const bimestreId = getValues('bimestre.id')
  const bimestreAtual = bimestres.find((bimestre) => (bimestre.id == getValues('bimestre.id')))
  const bimestreAnterior = bimestres.find((bimestre) => (bimestre.ordinal + 1 == bimestreAtual.ordinal))
  const [resultadoPrevio, setResultadoPrevio] = useState("")

  const disableCheckbox = useCallback(() => {
    if (getValues('registros[' + aluno_turma_id + '].resultado') == '' || getValues('registros[' + aluno_turma_id + '].resultado') == 'Não Avaliado') {
      return false
    }
    if (user?.permissao_usuario[0]?.nome === "PROFESSOR" || user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false;
    }
  }, [getValues, user, aluno_turma_id]);

  const preparacaoInicial = useCallback(async () => {
    if (disableCheckbox()) {
      desabilita.onTrue()
    }
    if (bimestreAnterior != undefined) {
      await buscaRegistroAprendizagemFaseByTurmaIdBimestreId({
        turmaId: turmaId,
        bimestreId: bimestreAnterior.id,
      });
    }
  }, [disableCheckbox, desabilita, bimestreAnterior, buscaRegistroAprendizagemFaseByTurmaIdBimestreId, turmaId]);

  const ResultadoPrevio = useCallback(async ({ alunoTurmaId }) => {
    const rp = await melhorResultadoAlunoTurma({
      alunoTurmaId: alunoTurmaId,
    });
    setResultadoPrevio(rp)
  }, [melhorResultadoAlunoTurma, setResultadoPrevio]);

  useEffect(() => {
    preparacaoInicial() 
  }, [preparacaoInicial]);

  useEffect(() => {
    if (registroAprendizagemFase.length > 0) {
      if (user?.permissao_usuario[0]?.nome == "PROFESSOR" & bimestreAnterior != undefined) {
        const registro = registroAprendizagemFase.find((registro) => registro?.aluno_turma?.aluno?.id == row.aluno.id);
        if (registro){
          if (registro?.resultado == "Não Avaliado" || registro?.resultado == "") {
            ResultadoPrevio({alunoTurmaId: aluno_turma_id});
          } else {
            setResultadoPrevio(registro?.resultado)
          }      
        } else {
          ResultadoPrevio({alunoTurmaId: aluno_turma_id});
        }
      }    
      
    }
  }, [ResultadoPrevio, aluno_turma_id, bimestreAnterior, registroAprendizagemFase, row.aluno.id, user?.permissao_usuario]);
  
  const mapDesabilitarCheckbox = {
    'Não Avaliado' : 6,
    'Pré Alfabética': 2,
    'Alfabética Parcial': 3,
    'Alfabética Completa': 4,
    'Alfabética Consolidada': 5,
  };

  const desabilitaBimestre = (tipoFaseValue) => {
    if (user?.permissao_usuario[0]?.nome == "PROFESSOR") {
      if (resultadoPrevio == 'Não Avaliado') {
        return false
      } else {
        return mapDesabilitarCheckbox[tipoFaseValue] < mapDesabilitarCheckbox[resultadoPrevio] ? true : false;
      }
    }
    if (user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false
    }
  }

  return (
    <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
          <Tooltip key={`tooltip_${aluno_turma_id}`} title={'Registro único da avaliação: ' + aluno_turma_id}>
            <span>{row.aluno.nome}</span>
          </Tooltip>
          <RHFTextField sx={{ display: 'none' }} name={'registros[' + aluno_turma_id + '].aluno_nome'} />
          <RHFTextField sx={{ display: 'none' }} name={'registros[' + aluno_turma_id + '].id'} />
          <RHFTextField sx={{ display: 'none' }} name={'registros[' + aluno_turma_id + '].alunosTurmas_id'} />
        </TableCell>
        {Object.values(RegistroAprendizagemFasesCRUD).map((tipoFaseValue) => {
          return (
            <TableCell
              key={`resultado_${slugify(tipoFaseValue)}_{${aluno_turma_id}`}
              sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}
            >
              <Controller
                name={'registros[' + aluno_turma_id + '].resultado'}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Checkbox
                    disabled={desabilita.value || desabilitaBimestre(tipoFaseValue)}
                    checked={field.value === tipoFaseValue}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    value={tipoFaseValue}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                )}
              />
            </TableCell>
          );
        })}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <RHFTextField 
          name={'registros[' + aluno_turma_id + '].leitura'} 
          disabled={true} 
          label="" 
          value={RegistroAprendizagemFasesLeitura[resultado]}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <RHFTextField 
          name={'registros[' + aluno_turma_id + '].escrita'}
          label="" 
          disabled={true} 
          value={RegistroAprendizagemFasesEscrita[resultado]}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <RHFTextField disabled={desabilita.value} name={`registros[` + aluno_turma_id + `].observacao`} label="" />
        </TableCell>
      </TableRow>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  row: PropTypes.object,
  bimestres: PropTypes.array,
};
