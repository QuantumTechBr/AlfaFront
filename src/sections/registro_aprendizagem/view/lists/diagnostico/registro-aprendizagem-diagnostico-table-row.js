import PropTypes from 'prop-types';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
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
import { useAuthContext } from 'src/auth/hooks';
// import RegistroAprendizagemQuickEditForm from './registro-aprendizagem-quick-edit-form';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoTableRow({
  row,
  onDeleteRow,
  onEditRow,
}) {
  const {
    id,
    ano_letivo,
    ano_escolar,
    ano,
    nome,
    turno,
    periodo,
    escola_nome,
    atualizado_por,
    created_at,
    updated_at,
    deleted_at,
  } = row;
  const { checkPermissaoModulo } = useAuthContext();
  const permissaoDeletar = checkPermissaoModulo("registro_aprendizagem", "deletar");
  const router = useRouter();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const editarRegistros = () => {
    const dadosDiagnostico = {
      turma: id,
      periodo: periodo,
    };
    sessionStorage.setItem('dadosDiagnosticoTurma', dadosDiagnostico.turma);
    sessionStorage.setItem('dadosDiagnosticoPeriodo', dadosDiagnostico.periodo);
    router.push(paths.dashboard.registro_aprendizagem.new_diagnostico);
  };

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_letivo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}°</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{turno}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{periodo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{escola_nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{atualizado_por}</TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={editarRegistros}>
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

RegistroAprendizagemDiagnosticoTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
