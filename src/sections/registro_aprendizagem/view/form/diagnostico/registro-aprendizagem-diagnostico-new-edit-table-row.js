import PropTypes from 'prop-types';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
//
import { useRouter } from 'src/routes/hook';
import { _habilidades, habilidades_options, promo_options } from 'src/_mock';
import { RHFSelect } from 'src/components/hook-form';
import TextField from '@mui/material/TextField';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl } from '@mui/material';
// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditTableRow({ row, selected, habilidades, onEditRow, onSelectRow, onDeleteRow }) {
  let { id, nome, aluno, mapHabilidades, promo_ano_anterior, status, funcao, funcao_usuario, permissao_usuario, created_at, updated_at, deleted_at } = row;

  const router = useRouter();

  const confirm = useBoolean();
  
  const quickEdit = useBoolean();

  const popover = usePopover();

  const { control } = useFormContext();  

  return (
    <>
      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.aluno.nome}  
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', display: 'none'}} >
          <Controller
            name={`registros[${id}].id_aluno_turma`}
            control={control}
            defaultValue = {id}
            render={({ field, fieldState: { error } }) => (
            <FormControl>
                <TextField
                  color='primary'
                  value={id}
                />  
            </FormControl>
            )}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <RHFSelect key={id+'promo'} name={'registros[' + id + '].promo_ano_anterior'} > 
              {promo_options.map((promo) => (
                <MenuItem key={id + '_promo_' + promo} value={promo} sx={{ height: '34px' }}>
                  {promo}
                </MenuItem>
              ))}
            </RHFSelect>
        </TableCell>

        {habilidades.map((habilidade) => {
          
          return (
            <TableCell key={id+'habcell'+habilidade.id}sx={{ whiteSpace: 'nowrap' }}>
              <RHFSelect name={'registros['+id+'].habilidades_registro_aprendizagem['+habilidade.id+']'}  label="">
                {habilidades_options.map((hab) => (
                  <MenuItem key={id + '_hab_' + hab} value={hab} sx={{ height: '34px' }}>
                    <Label
                      variant="soft"
                      color={(hab === 'D' && 'success') ||
                        (hab === 'PD' && 'warning') ||
                        (hab === 'ND' && 'error') ||
                        'default'}
                    >
                      {hab}
                    </Label>
                  </MenuItem>
                ))}
              </RHFSelect>
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
}

RegistroAprendizagemDiagnosticoNewEditTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};