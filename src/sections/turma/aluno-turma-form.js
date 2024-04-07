import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// import sortBy from 'lodash/sortby';

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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
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
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useDebounce } from 'src/hooks/use-debounce';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import Scrollbar from 'src/components/scrollbar';
import AlunoTurmaTableRow from './components/aluno-turma-table-row';
import LoadingBox from 'src/components/helpers/loading-box';
import escolaMethods from '../escola/escola-repository';
import turmaMethods from './turma-repository';
import Typography from '@mui/material/Typography';



// ----------------------------------------------------------------------

export default function AlunoTurmaForm({ turma, open, onClose }) {
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

  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable();

  const [currentAlunosEscola, setCurrentAlunosEscola] = useState(null);
  const [searchAlunosInput, setSearchAlunosInput] = useState('');

  const debouncedSearchFilter = useDebounce(searchAlunosInput, 600);
  
  // NÃO USAR HOOK CALLBACK
  const getAlunosEscola = (id) => {
    escolaMethods
      .getAlunosByEscolaId(id)
      .then((escola) => {
        const alunosEscola = escola.data;
        // alunosEscola = sortBy(alunosEscola, (ae) => {
        //   return ae.aluno.nome;
        // });

        setCurrentAlunosEscola(alunosEscola);

        const selectedList = turma.turmas_alunos.map((ta) => ta.aluno.id);
        const alunosIdEscola = alunosEscola.map((ae) => ae.aluno.id);
        const preSelectedList = selectedList.filter((alunoId) => alunosIdEscola.includes(alunoId));
        table.setSelected(preSelectedList);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      });
  }

  const methods = useForm({});

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      setCurrentAlunosEscola(null);
      getAlunosEscola(turma.escola.id);
    }
  }, [open]);

  const onSearchAlunos = useCallback((event) => {
    setSearchAlunosInput(event.target.value);
  }, []);

  const TABLE_HEAD = [
    { id: '', width: 5 },
    { id: 'nome', label: 'Estudante', width: 2 },
    { id: 'matricula', label: 'Matrícula', width: 3 },
    { id: 'data_nascimento', label: 'Data de Nascimento', width: 2 },
  ];

  const dataFiltered = applyFilter({
    inputData: currentAlunosEscola ?? [],
    query: debouncedSearchFilter,
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await turmaMethods
        .updateTurmaById(turma.id, {
          turmas_alunos: table.selected.map((id) => {
            return {
              aluno_id: id,
            };
          }),
        })
        .catch((error) => {
          throw error;
        });
      // reset();
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
      console.info('DATA', data);
    } catch (error) {
      setErrorMsg('Tentativa de atualização da turma falhou');
      console.error(error);
    }
  });

  const isLoading = currentAlunosEscola === undefined || currentAlunosEscola === null;

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
        {isLoading ? (
          <Box sx={{ pt: 2 }}>
              <LoadingBox />
            </Box>
        ) : (
          <>
            <DialogTitle>
              Definir Estudantes: {turma.escola.nome} {turma.ano_escolar}º {turma.nome}
            </DialogTitle>
            <DialogContent>
              {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              <TextField
                value={searchAlunosInput}
                onChange={onSearchAlunos}
                placeholder="Procure pelo nome ou matrícula..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1, width: { xs: 1, sm: '100%' } }}
              />

              <Scrollbar sx={{ width: '100%', height: 'calc(100vh - 320px)' }}>
                <Table size="small" sx={{ width: '100%' }}>
                  <TableHeadCustom
                    order="asc"
                    orderBy="nome"
                    headLabel={TABLE_HEAD}
                    rowCount={currentAlunosEscola?.length ?? 0}
                    numSelected={table.selected.length}
                  />
                  <TableBody>
                    {dataFiltered.map((row) => {
                      // console.log(table.selected.includes(row.aluno.id));
                      return(
                      <AlunoTurmaTableRow
                        key={`AlunoTurmaTableRow${row.aluno.id}`}
                        row={row}
                        currentTurma={turma}
                        selected={table.selected.includes(row.aluno.id)}
                        onSelectRow={() => table.onSelectRow(row.aluno.id)}
                      />
                    )})}

                    

                    <TableNoData notFound={false} />
                  </TableBody>
                </Table>
              </Scrollbar>
              <Box  sx={{ mt: 2}}>
                <Typography variant="subtitle2">{table.selected.length} selecionados</Typography>
              </Box>
            </DialogContent>
          </>
        )}

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton
            disabled={isLoading}
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Definir
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

AlunoTurmaForm.propTypes = {
  turma: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};