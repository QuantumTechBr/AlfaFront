import PropTypes from 'prop-types';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
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
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
//
import ProfissionalQuickEditForm from './profissional-quick-edit-form';
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';


// ----------------------------------------------------------------------

export default function ProfissionalTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onSaveRow }) {
  const { checkPermissaoModulo } = useAuthContext();
  const { id, profissional, email, funcao, escola, zona , turma, status } = row;
  // console.log(row)
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });

  }, [buscaFuncoes, buscaEscolas, buscaZonas]);

  const confirm = useBoolean();

  const newDeleteRow = () => {
    onDeleteRow();
    confirm.onFalse();
  }

  const quickEdit = useBoolean();

  const popover = usePopover();

  const saveAndClose = (retorno=null) => {
    onSaveRow({...row, ...retorno});
    quickEdit.onFalse();
  }

  const turmaRender = (turma ?? []).length > 0 ? turma?.reduce((acc, item) => acc + " Turma " + item.nome) : '';

  const renderFuncao = () => {
    for (let index = 0; index < funcoes.length; index++) {
      if (funcoes[index]?.id == funcao) {
        return funcoes[index].nome
      }
    }
    return ''
  }

  const renderZona = () => {
    for (let index = 0; index < zonas.length; index++) {
      if (zonas[index]?.id == zona) {
        return zonas[index].nome
      }
    }
    return ''
  }

  const renderEscola = () => {
    const list_retorno = []
    for (let index = 0; index < escolas?.length; index++) {
      for (let i = 0; i < escola?.length; i++) {
        if (escolas[index]?.id == escola[i]) {
          list_retorno.push(`- ${escolas[index].nome} `)
        }
      }
    }
    return(
    <div>
           {list_retorno.map((li, index) => (
            <Typography key={index}>{li}<br></br></Typography>
          ))}
    </div>
  )
  }


  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{profissional}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{renderFuncao()}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderEscola()}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderZona()}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.turma ? 'SIM' : 'NÃO'}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
          {checkPermissaoModulo('profissionais', 'editar') && 
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>}
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {checkPermissaoModulo('profissionais', 'editar') && 
        <ProfissionalQuickEditForm id={row.id} open={quickEdit.value} onClose={quickEdit.onFalse} onSave={saveAndClose} />
      }

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {checkPermissaoModulo('profissionais', 'deletar') && 
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Deletar
        </MenuItem> }

        {checkPermissaoModulo('profissionais', 'editar') && 
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Profissional"
        content="Tem certeza que deseja excluir este profissional?"
        action={
          <Button variant="contained" color="error" onClick={newDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}

ProfissionalTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onSaveRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
