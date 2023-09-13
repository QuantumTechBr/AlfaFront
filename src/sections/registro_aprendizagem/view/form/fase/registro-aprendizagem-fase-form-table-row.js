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
import { getAllEnumEntries } from 'enum-for';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ row }) {
  const { id, aluno } = row;

  const { control } = useFormContext();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
          <Tooltip key={aluno.id} title={'Registro único da avaliação: ' + id}>
            <span>{aluno.nome}</span>
          </Tooltip>
          <RHFTextField sx={{ display: 'none' }} name={'registros[' + aluno.id + '].avaliacao_id'} />
        </TableCell>
        {getAllEnumEntries(RegistroAprendizagemFases)
          .map((itemList) => {
            return itemList[1];
          })
          .map((itemList) => {
            return (
              <TableCell
                key={aluno.id + '_resultado_' + itemList}
                sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}
              >
                <Controller
                  name={'registros[' + aluno.id + '].resultado'}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl>
                      <Checkbox
                        checked={field.value === itemList}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                        }}
                        value={itemList}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                      />
                    </FormControl>
                  )}
                />
              </TableCell>
            );
          })}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <RHFTextField name={`registros[` + aluno.id + `].observacao`} label="" />
        </TableCell>
      </TableRow>
    </>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  id_avaliacao: PropTypes.number,
  row: PropTypes.object,
};
