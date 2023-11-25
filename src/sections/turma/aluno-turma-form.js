import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState } from 'react';
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
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable();

  const defaultValues = useMemo(() => ({}), []);

  const methods = useForm({
    defaultValues,
  });

  const denseHeight = table.dense ? 52 : 72;

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      setCurrentEscola({});
      table.setSelected(turma.turmas_alunos.map((aluno) => aluno.id));
      getEscola(turma.escola.id);
    }
  }, [open]);

  const [currentEscola, setCurrentEscola] = useState({});

  const getEscola = (id) => {
    escolaMethods
      .getEscolaById(id)
      .then((escola) => {
        setCurrentEscola(escola.data);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      });
  };

  const TABLE_HEAD = [
    { id: '', width: 88 },
    { id: 'nome', label: 'Aluno', width: 320 },
    { id: 'matricula', label: 'Matrícula', width: 200 },
    { id: 'data_nascimento', label: 'Data de Nascimento', width: 200 },
  ];

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
      reset();
      onClose();
      enqueueSnackbar('Atualizado com sucesso!');
      window.location.reload();
      console.info('DATA', data);
    } catch (error) {
      setErrorMsg('Tentativa de atualização da turma falhou');
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Definir Alunos da Turma</DialogTitle>
        <DialogContent>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          <br></br>
          <Scrollbar>
            {currentEscola.alunoEscolas === undefined ? (
              <LoadingBox />
            ) : (
              <Table size="small" sx={{ width: '100%' }}>
                <TableHeadCustom
                  order="asc"
                  orderBy="nome"
                  headLabel={TABLE_HEAD}
                  rowCount={currentEscola.alunoEscolas}
                  numSelected={table.selected.length}
                />

                <TableBody>
                  {currentEscola.alunoEscolas.map((row) => (
                    <AlunoTurmaTableRow
                      key={row.aluno.id}
                      row={row.aluno}
                      selected={table.selected.includes(row.aluno.id)}
                      onSelectRow={() => table.onSelectRow(row.aluno.id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={currentEscola.alunoEscolas.length == 0}
                  />

                  <TableNoData notFound={false} />
                </TableBody>
              </Table>
            )}
          </Scrollbar>
        </DialogContent>

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

AlunoTurmaForm.propTypes = {
  turma: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
