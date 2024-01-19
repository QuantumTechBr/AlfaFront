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
// import UserQuickEditForm from './user-quick-edit-form';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import parse from 'date-fns/parse';
import planoIntervencaoMethods from './plano-intervencao-repository';


// ----------------------------------------------------------------------

export default function PlanoIntervencaoTableRow({ row, selected, onEditRow, onNewFrom, onSelectRow, onDeleteRow }) {
  let { id, nome, responsavel, inicio_previsto, status, termino_previsto, ano_escolar } = row;
  console.log(row)

  let date_inicio = parse(inicio_previsto, 'yyyy-MM-dd', new Date())

  let date_termino = parse(termino_previsto, 'yyyy-MM-dd', new Date())

  const hoje = new Date()

  const router = useRouter();

  const confirm = useBoolean();

  const conclui = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const newDeleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  }

  const concluiPlano = async () => {
    await planoIntervencaoMethods.updatePlanoIntervencaoById(row.id, {status: 'Concluído'}).catch((error) => {
      console.log(error);
    });
    conclui.onFalse();
    window.location.reload()
  }

  const closeQuickEdit = (retorno=null) => {
    quickEdit.onFalse();
  }

  const retornoStatus = () => {
    if (status == 'Concluído') {
      return status
    }
    if (hoje > date_inicio && hoje < date_termino) {
      return 'Em Andamento Dentro do Prazo';
    } else {
      return 'Em Andamento Fora do Prazo';
    }
  }

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>Índice de Alfabetização</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{responsavel.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date_inicio.toLocaleDateString('pt-br')}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date_termino.toLocaleDateString('pt-br')}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{retornoStatus()}</TableCell>

        <TableCell>
          <Label
            variant="filled"
            color={
              (retornoStatus() === 'Concluído' && 'success') ||
              (retornoStatus() === 'Em Andamento Dentro do Prazo' && 'warning') ||
              (retornoStatus() === 'Em Andamento Fora do Prazo' && 'error') ||
              'default'
            }
          >
          </Label>
        </TableCell>



        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* <Tooltip title="Edição Rápida" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip> */}

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 240 }}
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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>

        <MenuItem
           onClick={() => {
             onNewFrom();
             popover.onClose();
           }}
        >
          <Iconify icon="mingcute:add-line" />
          Novo Plano a Partir deste...
        </MenuItem>

        <MenuItem
          onClick={() => {
            conclui.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="material-symbols:check" />
          Marcar como Concluído
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Usuário"
        content="Tem certeza que deseja excluir o usuário?"
        action={
          <Button variant="contained" color="error" onClick={newDeleteRow}>
            Deletar
          </Button>
        }
      />
      <ConfirmDialog
        open={conclui.value}
        onClose={conclui.onFalse}
        title="Plano Concluído"
        content="Tem certeza que deseja marcar esse plano como Concluído?"
        action={
          <Button variant="contained" color="success" onClick={concluiPlano}>
            Concluído
          </Button>
        }
      />
    </>
  );
}

PlanoIntervencaoTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onNewFrom: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
