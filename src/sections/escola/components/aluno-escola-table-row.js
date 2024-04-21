import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Iconify from 'src/components/iconify';

import parse from 'date-fns/parse';
import { disableCache } from '@iconify/react';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export default function AlunoEscolaTableRow({
  row,
  allAlunos,
  selected,
  currentEscola,
  onSelectRow,
  onAdicionarAluno,
  onRemoverAluno,
}) {
  const { id, nome, data_nascimento, matricula, created_at, updated_at, deleted_at } = row;

  const date = parse(data_nascimento, 'yyyy-MM-dd', new Date());

  const confirmAdicionar = useBoolean();
  const confirmRemover = useBoolean();

  const adicionarAluno = () => {
    onAdicionarAluno();
    confirmAdicionar.onFalse();
  };

  const removerAluno = () => {
    onRemoverAluno();
    confirmRemover.onFalse();
  };

  // let _aluno = allAlunos.filter((aluno) => aluno.id == id);
  // _aluno = _aluno.length > 0 ? _aluno[0] : null;
  // const outrasEscolas =
  //   _aluno == null ? [] : _aluno.alunoEscolas.filter((ae) => ae.escola != currentEscola.id);

  // const emOutraEscola = outrasEscolas.length > 0;
  // selected = emOutraEscola ? false : selected;

  return (
  <>
    <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox
            {...(emOutraEscola ? { disabled: 'disabled' } : null)}
            checked={selected}
            onClick={onSelectRow}
          />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nome}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{matricula}</TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title="Adicionar aluno a escola" placement="top" arrow>
              <IconButton onClick={() => {
              confirmAdicionar.onTrue();
            }}>
                <Iconify icon="material-symbols:person-add" color="green" />
              </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Remover aluno a escola" placement="top" arrow>
              <IconButton onClick={() => {
              confirmRemover.onTrue();
            }}>
                <Iconify icon="material-symbols:person-cancel" color="red" />
              </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      
        <ConfirmDialog
        open={confirmAdicionar.value}
        onClose={confirmAdicionar.onFalse}
        title="Adicionar Estudante"
        content={`Tem certeza que deseja adicionar ${nome} a ${currentEscola?.nome} ?`}
        action={
          <Button variant="contained" color="success" onClick={adicionarAluno}>
            Adicionar
          </Button>
        }
        />
         <ConfirmDialog
        open={confirmRemover.value}
        onClose={confirmRemover.onFalse}
        title="Remover Estudante"
        content={`Tem certeza que deseja excluir ${nome} da ${currentEscola?.nome} ?`}
        action={
          <Button variant="contained" color="error" onClick={removerAluno}>
            Remover
          </Button>
        }
        />
  </>
  );
}

AlunoEscolaTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  allAlunos: PropTypes.array,
  currentEscola: PropTypes.object,
  onSelectRow: PropTypes.func,
};
