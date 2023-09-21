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
import { RegistroAprendizagemFases } from 'src/_mock';

//
import { FormControl, TextField } from '@mui/material';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ row, index }) {
  const { id, aluno } = row;

  const { control } = useFormContext();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
          <Tooltip key={id} title={'Registro único da avaliação: ' + id}>
            <span>{aluno.nome}</span>
          </Tooltip>
          <RHFTextField sx={{ display: 'none' }} name={'registros[' + index + '].avaliacao_id'} />
          <RHFTextField sx={{ display: 'none' }} name={'registros[' + index + '].id_aluno_turma'} />
        </TableCell>
        {Object.values(RegistroAprendizagemFases).map((tipoFaseValue) => {
          return (
            <TableCell
              key={id + '_resultado'}
              sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}
            >
              <Controller
                name={'registros[' + index + '].resultado'}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Checkbox
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
          <RHFTextField name={`registros[` + index + `].observacao`} label="" />
        </TableCell>
      </TableRow>
    </>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  id_avaliacao: PropTypes.number,
  row: PropTypes.object,
};
