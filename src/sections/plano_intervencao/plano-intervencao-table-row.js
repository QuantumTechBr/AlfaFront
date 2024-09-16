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
import VisualizaPlanoIntervencao from './plano-intervencao-modal-visualiza-plano';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PlanoIntervencaoTableRow({ row, selected, onEditRow, onNewFrom, onSelectRow, onDeleteRow }){
  const { id, nome, acao, responsavel, inicio_previsto, aplicacao, status, termino_previsto, ano_escolar } = row;

  const date_inicio = parse(inicio_previsto, 'yyyy-MM-dd', new Date())

  const date_termino = parse(termino_previsto, 'yyyy-MM-dd', new Date())
  
  const hoje = new Date()

  const { checkPermissaoModulo } = useAuthContext();

  const permissaoCadastrar = checkPermissaoModulo("plano_intervencao","cadastrar");

  const router = useRouter();

  const confirm = useBoolean();

  const conclui = useBoolean();

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
    } else if (hoje < date_inicio) {
      return 'Criado';
    } else {
      return 'Em Andamento Fora do Prazo';

    }
  }

  const visualizaPlano = useBoolean();

  const closeVisualizaPlano = (retorno = null) => {
    visualizaPlano.onFalse();
  };

  const handleClickRow = () => {
    visualizaPlano.onTrue();
  }
  

  return (
    <>
      <TableRow hover selected={selected} >
        {permissaoCadastrar &&
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        } 

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>Índice de Alfabetização</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{acao}</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{responsavel.nome}</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{date_inicio.toLocaleDateString('pt-br')}</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{date_termino.toLocaleDateString('pt-br')}</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{ano_escolar}</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{mostra_aplicacao}</TableCell>

        <TableCell onClick={handleClickRow} sx={{ whiteSpace: 'nowrap' }}>{retornoStatus()}</TableCell>

        <TableCell onClick={handleClickRow}>
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



        {permissaoCadastrar &&
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
        }
      </TableRow>

      <VisualizaPlanoIntervencao open={visualizaPlano.value} onClose={closeVisualizaPlano} currentPlano={id}/>

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
          disabled={status == 'Concluído' ? true : false}
          onClick={() => {
            conclui.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="material-symbols:check" />
          {status == 'Concluído' ? 'Concluído' : 'Marcar como Concluído'}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Plano"
        content="Tem certeza que deseja excluir o plano?"
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
