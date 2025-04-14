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
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
//
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';


// ----------------------------------------------------------------------

export default function ProfissionalTableRow({ row, onEditRow, onDeleteRow, quickEdit }) {
  const { checkPermissaoModulo } = useAuthContext();
  const { id, profissional, email, funcao, escola, zona , turma, status } = row;
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

  const popover = usePopover();

  const turmaRender = (turma ?? []).length > 0 ? turma?.reduce((acc, item) => acc + " Turma " + item.nome) : '';

  let funcaoNome = '';
  for (const funcao_usuario of row.funcao_usuario) {
    if (funcao_usuario.nome_exibicao && !funcaoNome.includes(funcao_usuario.nome_exibicao)) {
      funcaoNome = funcaoNome + ', ' + funcao_usuario.nome_exibicao;
    } else if (funcao_usuario.funcao?.nome && !funcaoNome.includes(funcao_usuario.funcao.nome)) {
      funcaoNome = funcaoNome + ', ' + funcao_usuario.funcao.nome;
    }
    
  }

  funcaoNome = funcaoNome.replace(/^, /, '');
  funcaoNome = funcaoNome.replace(/, $/, '');

  const renderZona = () => {
    const list_retorno = []
    for (const funcao_usuario of row.funcao_usuario) {
      if (funcao_usuario.zona?.nome && !list_retorno.includes(funcao_usuario.zona.nome)) {
        list_retorno.push(`- ${funcao_usuario.zona.nome}`)
      }
    }
    return (
      <div>
           {list_retorno.map((li, index) => (
            <Typography key={index}>{li}<br></br></Typography>
          ))}
    </div>
    )
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
      <TableRow hover>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{profissional}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title={funcaoNome}>
            {funcaoNome.length > 20 ? funcaoNome.substring(0, 30) + '...' :  funcaoNome}
          </Tooltip>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderEscola()}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderZona()}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.turma ? 'SIM' : 'NÃO'}</TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edição Rápida" placement="top" arrow>
          {checkPermissaoModulo('profissionais', 'editar') && 
            <IconButton onClick={quickEdit}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>}
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>


      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
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
  quickEdit: PropTypes.func,
  row: PropTypes.object,
};
