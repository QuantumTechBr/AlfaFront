'use client';

import { isEqual, last } from 'lodash';

import { useEffect, useState, useCallback } from 'react';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// _mock
import { RegistroAprendizagemFases } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
import { useForm, Controller } from 'react-hook-form';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import FormProvider from 'src/components/hook-form';

import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import RegistroAprendizagemFaseFormTableRow from './registro-aprendizagem-fase-form-table-row';
import RegistroAprendizagemFaseFormTableToolbar from './registro-aprendizagem-fase-form-table-toolbar';
import RegistroAprendizagemFaseFormTableFiltersResult from './registro-aprendizagem-fase-form-table-filters-result';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 150 },
  ...Object.entries(RegistroAprendizagemFases).map((itemList) => {
    return { id: itemList[0], label: itemList[1], width: 80 };
  }),
  { id: 'observacao', label: 'Observação' },
];

const defaultFilters = {};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormListView({ turmaInicial, bimestreInicial }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { turmas, buscaTurmas, buscaTurmaPorId } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const [tableData, setTableData] = useState([]);

  const initialFormValues = {
    turma: '',
    bimestre: '',
    registros: [],
  };

  const table = useTable();
  const settings = useSettingsContext();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // TODO CRIAR FUNCAO UNICA PARA RECRIAR TODOS OS FILTROS

  const handleFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [nome]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const methods = useForm({
    //resolver: yupResolver(NewUserSchema),
    defaultValues: initialFormValues,
  });

  const {
    register,
    reset,
    resetField,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const formValues = watch();
  const { turma, bimestre } = formValues;

  const getRegistros = async (turmaToGetRegistros, bimestreToGetRegistros) => {
    turmaToGetRegistros ??= turma;
    bimestreToGetRegistros ??= bimestre;

    if (!!turmaToGetRegistros && !!bimestreToGetRegistros) {
      // BUSCAR NO BANCO DE DADOS

      let registrosDaTurmaBimestre =
        await registroAprendizagemMethods.getAllRegistrosAprendizagemFase({
          turmaId: turmaToGetRegistros.id,
          bimestreId: bimestre.id,
        });
      console.table(registrosDaTurmaBimestre.data);

      await buscaTurmaPorId({ id: turmaToGetRegistros.id }).then((_turma) => {
        // resetField('registros');
        let _newRegistros = [];

        _turma.aluno_turma.forEach((alunoTurmaItem) => {
          const registroEncontrado = last(
            registrosDaTurmaBimestre.data.filter((reg) => reg.aluno_turma.id == alunoTurmaItem.id)
          );

          _newRegistros[alunoTurmaItem.id] = {
            aluno_nome: alunoTurmaItem.aluno.nome,
            avaliacao_id: registroEncontrado?.id ?? '',
            aluno_turma_id: alunoTurmaItem.id,
            resultado: registroEncontrado?.resultado ?? '',
            observacao: registroEncontrado?.observacao ?? '',
          };
        });
        setValue('registros', _newRegistros);

        setTableData(_turma.aluno_turma);
      });
    }
  };

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (type == 'change' && ['turma', 'bimestre'].includes(name)) {
        getRegistros(values.turma, values.bimestre);
      }
    });

    return () => subscription.unsubscribe();
  }, [turmas, bimestres, watch, getRegistros]);

  const onSubmit = handleSubmit(async (data) => {
    const retornoPadrao = {
      nome: `Avaliação de Fase ${turma.ano_escolar}º ${turma.nome} - ${bimestre.ordinal}º Bimestre ${turma.ano.ano}`,
      bimestre_id: bimestre.id,
      tipo: 'Fase',
    };

    const toSend = Object.values(data.registros).map((formItem) => {
      // console.table(formItem);
      let item = { ...retornoPadrao, ...formItem };
      item.nome = `${item.nome} - ${item.aluno_nome}`
      delete item.aluno_nome;
      delete item.avaliacao_id; // TODO REMOVE - RECEBER NO BANCO PARA UPDATE
      return item;
    });

    console.log('toSend');
    console.table(toSend);

    try {
      await registroAprendizagemMethods.insertRegistroAprendizagemFase(toSend);
      enqueueSnackbar('Atualizado com sucesso!');
      router.push(paths.dashboard.registro_aprendizagem.root_fase);
    } catch (error) {
      console.log('Erro ao Salvar');
      console.error(error);
    }
  });

  useEffect(() => {
    console.log('useEffect FORM FASE LIST VIEW');
    buscaBimestres();
    buscaTurmas().then((_turmas) => {
      if (!!turmaInicial) {
        if (!!_turmas) {
          const _turmaComplete = _turmas.filter((t) => t.id == turmaInicial);
          if (_turmaComplete && !!_turmaComplete.length) {
            setValue('turma', _turmaComplete[0]); // FORM INPUT
          }
        }
      }

      if (!!bimestreInicial) {
        if (!!bimestres) {
          const _bimestreComplete = bimestres.filter((t) => t.id == bimestreInicial);
          if (_bimestreComplete && !!_bimestreComplete.length) {
            setValue('bimestre', _bimestreComplete[0]); // FORM INPUT
          }
        }
      }

      if (!!turmaInicial && !!bimestreInicial) getRegistros();
    });
  }, [turmas, buscaTurmas, turmaInicial, bimestres, buscaBimestres, bimestreInicial, setValue]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Criação/Edição Avaliação de Fase do Desenvolvimento da Leitura e da Escrita"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Avaliações de Fase',
              href: paths.dashboard.registro_aprendizagem.root_fase,
            },
            { name: 'Avaliação de Fase' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Card>
            <RegistroAprendizagemFaseFormTableToolbar
              filters={filters}
              onFilters={handleFilters}
              turmaOptions={turmas}
              bimestreOptions={bimestres}
            />

            {canReset && (
              <RegistroAprendizagemFaseFormTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                onResetFilters={handleResetFilters}
                results={dataFiltered.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered.map((row, index) => {
                      return (
                        <RegistroAprendizagemFaseFormTableRow
                          key={row.id}
                          row={row}
                          index={index}
                        />
                      );
                    })}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              hidden
              count={dataFiltered.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={false}
            />
          </Card>

          <Stack sx={{ mt: 3 }} direction="row" spacing={0.5} justifyContent="flex-end">
            <Grid alignItems="center" xs={3}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Salvar informações
              </LoadingButton>
            </Grid>
          </Stack>
        </FormProvider>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (item) => item.aluno.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  return inputData;
}