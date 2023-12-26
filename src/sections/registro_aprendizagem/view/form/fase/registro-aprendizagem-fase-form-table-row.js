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

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ row, bimestres }) {
  
  const { registroAprendizagemFase, buscaRegistroAprendizagemFaseByTurmaIdBimestreId } = useContext(RegistroAprendizagemContext);
  const { user } = useContext(AuthContext);
  const [bimestreAnterior, setBimestreAnterior] = useState(undefined)
  const desabilita = useBoolean(false);
  const { id: aluno_turma_id, aluno } = row;
  const { control, getValues, setValue } = useFormContext();
  let resultado = getValues('registros[' + aluno_turma_id + '].resultado');
  let turmaId = getValues('turma.id')
  let bimestreId = getValues('bimestre.id')
  let registroAprendizagemFaseBimestreAnterior = registroAprendizagemFase

  const disableCheckbox = () => {
    if (getValues('registros[' + aluno_turma_id + '].resultado') == '' || getValues('registros[' + aluno_turma_id + '].resultado') == 'Não Avaliado') {
      return false
    }
    if (user?.permissao_usuario[0]?.nome === "PROFESSOR" || user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false;
    }
  }

  useEffect(() => {
    const bimestreAtual = bimestres.find((bimestre) => (bimestre.id == getValues('bimestre.id')))
    let ba = bimestres.find((bimestre) => (bimestre.ordinal + 1 == bimestreAtual.ordinal))
    setBimestreAnterior(ba)
    if (disableCheckbox()) {
      desabilita.onTrue()
    }
    if (ba != undefined) {
      buscaRegistroAprendizagemFaseByTurmaIdBimestreId({
        turmaId: turmaId,
        bimestreId: ba.id,
      });
    }
  }, []);

  const mapDesabilitarCheckbox = {
    'Não Avaliado' : 6,
    'Pré Alfabética': 2,
    'Alfabética Parcial': 3,
    'Alfabética Completa': 4,
    'Alfabética Consolidada': 5,
  };
  // const disableCheckbox = (tipoFaseValue) => {
  //   if (user?.permissao_usuario[0]?.nome === "PROFESSOR") {
  //     return mapDesabilitarCheckbox[tipoFaseValue] < mapDesabilitarCheckbox[resultadoPrevio] ? true : false;
  //   } else {
  //     return false;
  //   }
  // }

  const desabilitaBimestre = tipoFaseValue => {
    if (user?.permissao_usuario[0]?.nome === "PROFESSOR" & bimestreAnterior != undefined) {
      let registro = registroAprendizagemFase.find((registro) => registro?.aluno_turma?.aluno?.id == row.aluno.id);
      let resultadoPrevio = ""
      if (registro){
        resultadoPrevio = registro?.resultado
      }
      // console.log(registroAprendizagemFase)
      // console.log(mapDesabilitarCheckbox[tipoFaseValue] < mapDesabilitarCheckbox[resultadoPrevio])
      return mapDesabilitarCheckbox[tipoFaseValue] < mapDesabilitarCheckbox[resultadoPrevio] ? true : false;
    }
    if (user?.permissao_usuario[0]?.nome === "DIRETOR") {
      return true
    } else {
      return false
    }
  }


  return (
    <>
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
    </>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  row: PropTypes.object,
  bimestres: PropTypes.array,
};
