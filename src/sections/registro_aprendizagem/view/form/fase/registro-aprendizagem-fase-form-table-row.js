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
import { useContext } from 'react';
import { AuthContext } from 'src/auth/context/alfa';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ row, index }) {
  
  const { user } = useContext(AuthContext);
  const desabilita = useBoolean(true);

  const { id: aluno_turma_id, aluno } = row;
  const { control, getValues } = useFormContext();
  let resultado = getValues('registros[' + aluno_turma_id + '].resultado');


  const mapDesabilitarCheckbox = {
    'Não Avaliado' : 1,
    'Pré Alfabética': 2,
    'Alfabética Parcial': 3,
    'Alfabética Completa': 4,
    'Alfabética Consolidada': 5,
  };

  const disableCheckbox = (tipoFaseValue) => {
    if (user.permissao_usuario[0].nome === "PROFESSOR") {
      return mapDesabilitarCheckbox[tipoFaseValue] < mapDesabilitarCheckbox[resultado] ? true : false;
    } else {
      return false;
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
                    disabled={disableCheckbox(tipoFaseValue)}
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
          <RHFTextField name={`registros[` + aluno_turma_id + `].observacao`} label="" />
        </TableCell>
      </TableRow>
    </>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  id_avaliacao: PropTypes.number,
  row: PropTypes.object,
};
