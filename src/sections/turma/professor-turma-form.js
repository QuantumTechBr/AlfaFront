import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import TableBody from '@mui/material/TableBody';
// components
import Iconify from 'src/components/iconify';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import profissionalMethods from '../profissional/profissional-repository';
import Scrollbar from 'src/components/scrollbar';
import LoadingBox from 'src/components/helpers/loading-box';
import ProfessorTurmaTableRow from './components/professor-turma-table-row';
import Typography from '@mui/material/Typography';
import turmaMethods from './turma-repository';
// ----------------------------------------------------------------------


const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'checkbox', width: 5 },
  { id: 'nome', label: 'Nome', width: 200 },
  { id: 'email', label: 'E-Mail', width: 300 },
  { id: 'funcao', label: 'Função', width: 200 },
  { id: 'status', label: 'Status', width: 200 },
];

export default function ProfessorTurmaForm({ turma, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  
  const table = useTable();
  const [errorMsg, setErrorMsg] = useState('');
  const [currentProfessoresEscola, setCurrentProfessoresEscola] = useState(null);

  const getProfessoresEscola = useCallback((id) => {
    profissionalMethods
      .getProfessoresByEscolaId({ escolaId: id })
      .then((professores) => {
        const professoresEscola = professores.data;
        const professorTurma = professoresEscola.filter((professor) => professor?.turma[0]?.id === turma.id)
        if (professorTurma.length > 0) {
          table.setSelected(professorTurma[0].id);
        }
        setCurrentProfessoresEscola(professoresEscola);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de profissionais');
      });
  }, [table, turma.id]);

  const methods = useForm({});

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      setCurrentProfessoresEscola(null);
      getProfessoresEscola(turma.escola.id);
    }
  }, [open]);

  const dataFiltered = applyFilter({
    inputData: currentProfessoresEscola ?? [],
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(table.selected)
      if (table.selected.length < 1) {
        await turmaMethods
        .updateTurmaById(turma.id, {
          professor_turma: []
        }).catch((error) => {
          throw error;
        });
      } else {
        await turmaMethods
        .updateTurmaById(turma.id, {
          professor_turma: [{usuario_id: table.selected, responsavel: true}]
        }).catch((error) => {
          throw error;
        });
      }
      reset();
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
    } catch (error) {
      setErrorMsg('Tentativa de atualização da turma falhou');
      console.error(error);
    }
  });

  const onSelectRowCustom = useCallback(
    (inputValue) => {
      if (table.selected.includes(inputValue)) {
        table.setSelected([])
      } else {
        table.setSelected(inputValue);
      }
    },
    [table]
  );

  const isLoading = currentProfessoresEscola === undefined || currentProfessoresEscola === null;

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 800 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
      <DialogTitle>Definir Professor: {turma?.escola?.nome} {turma?.ano_escolar}º {turma?.nome}</DialogTitle>
      {isLoading ? (
          <Box sx={{ pt: 2 }}>
              <LoadingBox />
            </Box>
        ) : (
          <DialogContent>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          <br></br>
          <Scrollbar sx={{ width: '100%', height: 'calc(100vh - 320px)' }}>
                <Table size="small" sx={{ width: '100%' }}>
                  <TableHeadCustom
                    order="asc"
                    orderBy="nome"
                    headLabel={TABLE_HEAD}
                    rowCount={currentProfessoresEscola?.length ?? 0}
                    numSelected={table.selected.length}
                  />
                  <TableBody>
                    {dataFiltered.map((row) => {
                      return(
                      <ProfessorTurmaTableRow
                        key={`ProfessorTurmaTableRow_${row.id}`}
                        row={row}
                        currentTurma={turma}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => onSelectRowCustom(row.id)}
                      />
                    )})}

                    

                    <TableNoData notFound={false} />
                  </TableBody>
                </Table>
              </Scrollbar>
              <Box  sx={{ mt: 2}}>
                <Typography variant="subtitle2">{table.selected.length > 0 ? 1 : 0} selecionado</Typography>
              </Box>
        </DialogContent>
        )}

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
           Definir
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ProfessorTurmaForm.propTypes = {
  Turma: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};

const applyFilter = ({ inputData, query }) => {
  if (query) {
    inputData = inputData.filter(
      (item) =>
        item.aluno.nome.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.aluno.matricula.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
};
