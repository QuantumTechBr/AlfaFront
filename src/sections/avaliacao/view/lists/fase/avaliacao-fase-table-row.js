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

import Iconify from 'src/components/iconify';

import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function AvaliacaoFaseTableRow({ row, onEditRow, onDeleteRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  const {
    id,
    ano_letivo,
    ano_escolar,
    nome,
    turno,
    alunos,
    bimestre,
    escola,
    atualizado_por,
    created_at,
    updated_at,
    deleted_at,
  } = row;
  const permissaoDeletar = checkPermissaoModulo("registro_aprendizagem", "deletar");
  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_letivo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}°</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turno}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{alunos}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{bimestre.ordinal}&ordm;</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{atualizado_por ? atualizado_por : ''}</TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color="inherit" onClick={onEditRow}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          {permissaoDeletar &&
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          }
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Deletar
        </MenuItem>

      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Acompanhamento"
        content="Tem certeza que deseja excluir o Acompanhamento?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

AvaliacaoFaseTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
