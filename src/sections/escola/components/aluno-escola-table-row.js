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
  selectedAnoLetivoId,
}) {
  
  const { id, nome, data_nascimento, matricula, created_at, updated_at, deleted_at } = row;
  console.log(row)
  const date = parse(data_nascimento, 'yyyy-MM-dd', new Date());

  const confirmAdicionar = useBoolean();
  const confirmRemover = useBoolean();
  const podeAdicionar = row?.alunoEscolas?.length == 0 || row?.alunoEscolas?.find((ae) => ae.ano?.id == selectedAnoLetivoId) == undefined;
  const podeRemover = row?.alunoEscolas.find((ae) => ae.escola.id == currentEscola.id && ae.ano.id == selectedAnoLetivoId) != undefined;
  const escolaAtual = row?.alunoEscolas?.find((ae) => ae.ano.id == selectedAnoLetivoId)?.escola ?? undefined;

  const adicionarAluno = () => {
    onAdicionarAluno();
    confirmAdicionar.onFalse();
  };

  const removerAluno = () => {
    onRemoverAluno();
    confirmRemover.onFalse();
  };

  return (
  <>
    <TableRow hover selected={selected}>


         

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {escolaAtual?.nome ? (
            <Tooltip title={`Aluno na escola ${escolaAtual?.nome}`} placement="top" arrow>
              {nome}
            </Tooltip>
          ) : (
            nome
          )}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{matricula}</TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title="Adicionar aluno a escola" placement="top" arrow>
              <IconButton onClick={() => {
              confirmAdicionar.onTrue();
            }}
            disabled={!podeAdicionar}
            >
                <Iconify icon="material-symbols:person-add" color={podeAdicionar ? "green" : "grey"} />
              </IconButton>
          </Tooltip>
        </TableCell>
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Remover aluno da escola" placement="top" arrow>
              <IconButton onClick={() => {
              confirmRemover.onTrue();
            }}
            disabled={!podeRemover}
            >
                <Iconify icon="material-symbols:person-cancel" color={podeRemover ? "red" : "grey"} />
              </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>


        <ConfirmDialog
        open={confirmAdicionar.value}
        onClose={confirmAdicionar.onFalse}
        title="Adicionar Estudante"
        content={`Tem certeza que deseja adicionar ${nome} a ${currentEscola?.nome} no ano letivo selecionado?`}
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
        content={`Tem certeza que deseja excluir ${nome} da ${currentEscola?.nome} no ano letivo selecionado?`}
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
