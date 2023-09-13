import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
//import UserQuickEditForm from './user-quick-edit-form';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { _habilidades, habilidades_options, promo_options } from 'src/_mock';
import FormProvider, { RHFMultiSelect, RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoNewEditTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  let { id, nome, aluno, mapHabilidades, promo_ano_anterior, status, funcao, funcao_usuario, permissao_usuario, created_at, updated_at, deleted_at } = row;

  const router = useRouter();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.aluno.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
            <RHFSelect name={aluno.id} label=""> 
              {promo_options.map((promo) => (
                <MenuItem key={promo} value={promo}>
                  {promo}
                </MenuItem>
              ))}
            </RHFSelect>
        </TableCell>     

        {mapHabilidades.map((habilidade) => (
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <RHFSelect name={habilidade.nome} label=""> 
                    {habilidades_options.map((habilidade) => (
                <MenuItem key={habilidade} value={habilidade}>
                    <Label
                        variant="soft"
                        color={
                            (habilidade === 'D' && 'success') ||
                            (habilidade === 'PD' && 'warning') ||
                            (habilidade === 'ND' && 'error') ||
                            'default'
                        }
                        >
                        {habilidade}
                    </Label>
                </MenuItem>
                ))}
                </RHFSelect>
            </TableCell>
        ))}
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
