import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import every from 'lodash/every';

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
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import TableBody from '@mui/material/TableBody';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import Scrollbar from 'src/components/scrollbar';
import AlunoTurmaTableRow from './components/aluno-turma-table-row';
import LoadingBox from 'src/components/helpers/loading-box';
import escolaMethods from '../escola/escola-repository';
import turmaMethods from './turma-repository';

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

  const [currentEscola, setCurrentEscola] = useState({});
  const [searchAlunosInput, setSearchAlunosInput] = useState('');

  const getAlunosEscola = (id) => {
    escolaMethods
      .getEscolaById(id)
      .then((escola) => {
        setCurrentEscola(escola.data);
        
        let selectedList = turma.turmas_alunos.map((aluno) => aluno.id);
        let preSelectedList = selectedList.every((a) => escola.data.alunoEscolas.map((v) => v.aluno.id).includes(a.id));
        table.setSelected(preSelectedList);

      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      });
  };

  const methods = useForm({});

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      setCurrentEscola({});
      getAlunosEscola(turma.escola.id);
    }
  }, [open]);

  const onSearchAlunos = useCallback((event) => {
    setSearchAlunosInput(event.target.value);
  }, []);

  const TABLE_HEAD = [
    { id: '', width: 5 },
    { id: 'nome', label: 'Aluno', width: 2 },
    { id: 'matricula', label: 'Matrícula', width: 3 },
    { id: 'data_nascimento', label: 'Data de Nascimento', width: 2 },
  ];

  const dataFiltered = applyFilter({
    inputData: currentEscola.alunoEscolas ?? [],
    query: searchAlunosInput,
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

  const isLoading = currentEscola.alunoEscolas === undefined;

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
          <>
            <Box sx={{ pt: 2 }}>
              <LoadingBox />
            </Box>
          </>
        ) : (
          <>
            <DialogTitle>
              Definir Alunos: {turma.escola.nome} {turma.ano_escolar}º {turma.nome}
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
                    rowCount={currentEscola.alunoEscolas}
                    numSelected={table.selected.length}
                  />
                  <TableBody>
                    {dataFiltered.map((row) => (
                      <AlunoTurmaTableRow
                        key={row.aluno.id}
                        row={row.aluno}
                        selected={table.selected.includes(row.aluno.id)}
                        onSelectRow={() => table.onSelectRow(row.aluno.id)}
                      />
                    ))}

                    <TableEmptyRows height={52} emptyRows={dataFiltered.length == 0} />

                    <TableNoData notFound={false} />
                  </TableBody>
                </Table>
              </Scrollbar>
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
