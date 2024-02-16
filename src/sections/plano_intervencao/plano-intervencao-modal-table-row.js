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

// ----------------------------------------------------------------------

export default function PlanoIntervencaoModalTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  let { id, nome, acao, responsavel, inicio_previsto, aplicacao, status, termino_previsto, ano_escolar } = row;

  let date_inicio = parse(inicio_previsto, 'yyyy-MM-dd', new Date())

  let date_termino = parse(termino_previsto, 'yyyy-MM-dd', new Date())

  const hoje = new Date()

  const router = useRouter();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  let mostra_aplicacao = ''

  if (aplicacao?.alunos?.length > 0) {
    mostra_aplicacao = 'Alunos';
  } else if (aplicacao?.turmas?.length > 0) {
    mostra_aplicacao = 'Turmas';
  } else if (aplicacao?.escolas?.length > 0) {
    mostra_aplicacao = 'Escolas';
  } else if (aplicacao?.zonas?.length > 0) {
    mostra_aplicacao = 'Zonas';
  }

  const newDeleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
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
    } else if (hoje < date_inicio) {
      return 'Criado';
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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{acao}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{responsavel?.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date_inicio.toLocaleDateString('pt-br')}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date_termino.toLocaleDateString('pt-br')}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{mostra_aplicacao}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{retornoStatus()}</TableCell>

        <TableCell>
          <Label
            variant="filled"
            color={
              (retornoStatus() === 'Concluído' && 'success') ||
              (retornoStatus() === 'Em Andamento Dentro do Prazo' && 'warning') ||
              (retornoStatus() === 'Em Andamento Fora do Prazo' && 'error') ||
              (retornoStatus() === 'Criado' && 'info') ||
              'default'
            }
          >
          </Label>
        </TableCell>
      </TableRow>

      
    </>
  );
}

PlanoIntervencaoModalTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
