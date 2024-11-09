'use client';

import { last } from 'lodash';
import { useEffect, useState, useCallback } from 'react';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import '../../form/style.css';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// _mock
import { RegistroAprendizagemFasesCRUD } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
import { useForm } from 'react-hook-form';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSnackbar } from 'src/components/snackbar';

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
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import Alert from '@mui/material/Alert';
import LoadingBox from 'src/components/helpers/loading-box';
import { RegistroAprendizagemContext } from 'src/sections/registro_aprendizagem/context/registro-aprendizagem-context';
import { CSVLink } from "react-csv";
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 100 },
  ...Object.entries(RegistroAprendizagemFasesCRUD).map((itemList) => {
    return { id: itemList[0], label: itemList[1], width: 35 };
  }),
  { id: 'leitura', label: 'Leitura', width: 250 },
  { id: 'escrita', label: 'Escrita', width: 110 },
  { id: 'observacao', label: 'Observação' },
];

const defaultFilters = { anoLetivo: '', escola: '', turma: '', bimestre: '', pesquisa: '' };

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormListView({ turmaInicial, bimestreInicial }) {
  const { checkPermissaoModulo } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable();
  const { enqueueSnackbar } = useSnackbar();
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [filters, setFilters] = useState(defaultFilters);

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const { turmas, buscaTurmas, buscaTurmaPorId } = useContext(TurmasContext);
  const { limparMapCache } = useContext(RegistroAprendizagemContext);
  const permissaoCadastrar = checkPermissaoModulo("registro_aprendizagem", "cadastrar");
  const contextReady = useBoolean(false);

  const [tableData, setTableData] = useState([]);
  const tabelaPreparada = useBoolean(false);
  const buscando = useBoolean(false);

  const initialFormValues = {
    anoLetivo: '',
    escola: '',
    turma: '',
    bimestre: '',
    registros: [],
  };

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues: initialFormValues,
  });

  const {
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // watch(): checkbox da tabela acionam atualização de tela
  watch();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const notFound = !dataFiltered.length || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      const _filters = {};
      _filters[name] = value;

      if (['escola'].includes(name) && value != '') {
        setValue('turma', '');
        _filters.turma = '';
      }

      if (['anoLetivo', 'escola'].includes(name)) {
        setValue(name, value);
        setTableData([]);
      } else if (['turma', 'bimestre'].includes(name)) {
        setValue(name, value);
        getRegistros();
      }

      setFilters((prevState) => ({
        ...prevState,
        ..._filters,
      }));
    },
    [table]
  );

  const getRegistros = async () => {
    const _turma = getValues('turma');
    const _bimestre = getValues('bimestre');

    if (_turma && _bimestre) {
      tabelaPreparada.onFalse();
      setTableData([]);
      buscando.onTrue();
      setWarningMsg('');
      setErrorMsg('');

      const registrosDaTurmaBimestre = await registroAprendizagemMethods
        .getAllRegistrosAprendizagemFase({
          turmaId: _turma.id,
          bimestreId: _bimestre.id,
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de registro aprendizagem fase');
        });
      await buscaTurmaPorId({ id: _turma.id })
        .then((__turma) => {
          const _newRegistros = [];
          let csv_dat = [["Nome", "Resultado", "Observação"]];
          __turma.turmas_alunos.forEach((alunoTurmaItem) => {
            const registroEncontrado = last(
              registrosDaTurmaBimestre.data.filter((reg) => reg.aluno_turma.id == alunoTurmaItem.id)
            );

            csv_dat.push([alunoTurmaItem.aluno.nome, registroEncontrado?.resultado ?? '', registroEncontrado?.observacao ?? '',])
            _newRegistros[alunoTurmaItem.id] = {
              aluno_nome: alunoTurmaItem.aluno.nome,
              ...(registroEncontrado?.id !== undefined
                ? { avalicao_id: registroEncontrado?.id }
                : null),
              aluno_turma_id: alunoTurmaItem.id,
              resultado: registroEncontrado?.resultado ?? '',
              observacao: registroEncontrado?.observacao ?? '',
            };
          });
          
          const bimestre_csv = getValues('bimestre');
          const turma_csv = getValues('turma');
          const escola_csv = getValues('escola');
          setValue('registros', _newRegistros);
          setCsvFileName(`${anosLetivos.find((a) => a.id == _turma.ano_id).ano} - ${escola_csv.nome} - ${turma_csv.ano_escolar}º ${turma_csv.nome} - ${bimestre_csv.ordinal}º Bimestre.csv`)
          setTableData(__turma.turmas_alunos);
          setCsvData(csv_dat);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de turma');
        });
    }
    tabelaPreparada.onTrue();
    buscando.onFalse();
  };

  const onSubmit = handleSubmit(async (data) => {
    const _turma = getValues('turma');
    const _bimestre = getValues('bimestre');

    const retornoPadrao = {
      nome: `Acompanhamento de Fase ${_turma.ano_escolar}º ${_turma.nome} - ${_bimestre.ordinal
        }º Bimestre ${anosLetivos.find((a) => a.id == _turma.ano_id).ano}`,
      bimestre_id: _bimestre.id,
      tipo: 'Fase',
    };

    const mapaResultados = Object.values(data.registros).map((formItem) => {
      if (formItem.observacao.length > 0) {
        if (formItem.resultado == '') {
          formItem.resultado = 'Não Avaliado';
        }
      } else {
        if (formItem.resultado == '') {
          return;
        }
      }
      const item = { ...retornoPadrao, ...formItem };
      item.nome = `${item.nome} - ${item.aluno_nome}`;
      delete item.aluno_nome;
      return item;
    });
    const toSend = mapaResultados.filter(Boolean);
    console.log(toSend);
    try {
      await registroAprendizagemMethods.insertRegistroAprendizagemFase(toSend).catch((error) => {
        throw error;
      });
      limparMapCache();
      enqueueSnackbar('Atualizado com sucesso!');
      router.push(paths.dashboard.registro_aprendizagem.root_fase);
    } catch (error) {
      setErrorMsg(
        'Erro de comunicação com a API de registro aprendizagem fase no momento de salvar o registro'
      );
    }
  });

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaAnosLetivos().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de anos letivos');
      }),
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaTurmas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de turmas');
      }),
      buscaBimestres().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de bimestres');
      }),
    ]).finally(() => {
      contextReady.onTrue();
    });
  }, [buscaTurmas, buscaBimestres, turmaInicial, bimestreInicial, setValue]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    if (contextReady.value) {
      let _turmaInicialFull;

      const _filters = {};

      if (turmaInicial) {
        const _turmaComplete = turmas.find((t) => t.id == turmaInicial);
        if (_turmaComplete) {
          setValue(
            'anoLetivo',
            anosLetivos.find((a) => a.id == _turmaComplete.ano_id)
          );
          _filters.anoLetivo = anosLetivos.find((a) => a.id == _turmaComplete.ano_id);

          setValue(
            'escola',
            escolas.find((e) => e.id == _turmaComplete.escola_id)
          );
          _filters.escola = escolas.find((e) => e.id == _turmaComplete.escola_id);

          setValue('turma', _turmaComplete); // FORM INPUT
          _turmaInicialFull = _turmaComplete;

          _filters.turma = turmas.find((t) => t.id == _turmaComplete.id);
        }
      }

      let _bimestreInicialFull;
      if (bimestreInicial) {
        const _bimestreComplete = bimestres.find((b) => b.id == bimestreInicial);
        if (_bimestreComplete) {
          setValue('bimestre', _bimestreComplete); // FORM INPUT
          _bimestreInicialFull = _bimestreComplete;
          _filters.bimestre = bimestres.find((b) => b.id == _bimestreComplete.id);
        }
      }

      setFilters((prevState) => ({
        ...prevState,
        ..._filters,
      }));

      if (_turmaInicialFull && _bimestreInicialFull) {
        getRegistros();
      }
    }
  }, [contextReady.value]);


  return (
    <Container maxWidth={settings.themeStretch ? false : 'xxl'}>
      <CustomBreadcrumbs
        heading="Criação/Edição Acompanhamento de Fase do Desenvolvimento da Leitura e da Escrita"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Acompanhamentos de Fase',
            href: paths.dashboard.registro_aprendizagem.root_fase,
          },
          { name: 'Acompanhamento de Fase' },
        ]}
        youtubeLink="https://www.youtube.com/embed/AFM9adKIDX8?si=IJdxDNMtQyyGijwz"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!contextReady.value ? (
        <LoadingBox texto="Buscando registros" />
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

          <Card>
            <RegistroAprendizagemFaseFormTableToolbar
              filters={filters}
              onFilters={handleFilters}
              anoLetivoOptions={anosLetivos}
              escolaOptions={escolas}
              turmaOptions={turmas.filter((_turma) => filters.escola.id == _turma.escola_id)}
              bimestreOptions={bimestres}
              showSearch={tableData.length > 0}
            />

            <CSVLink className='downloadCSVBtn' filename={csvFileName} data={csvData} >
              Exportar para CSV
            </CSVLink>


            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar sx={{
                "& .simplebar-scrollbar": {
                  "backgroundColor": "#D3D3D3",
                  'borderRadius': 10,
                },  
                maxHeight: 800,
              }}>
                {(!contextReady.value || buscando.value) && <LoadingBox />}

                {contextReady.value && tabelaPreparada.value && (
                  <Table stickyHeader size="small" sx={{ minWidth: 960 }}>
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
                            bimestres={bimestres}
                          />
                        );
                      })}

                      <TableEmptyRows
                        height={52}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                      />

                      <TableNoData notFound={notFound} />
                    </TableBody>
                  </Table>
                )}
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              hidden
              count={dataFiltered.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={true}
            />
          </Card>

          <Stack sx={{ mt: 3 }} direction="row" spacing={0.5} justifyContent="flex-end">
            <Grid alignItems="center" xs={3}>
              {permissaoCadastrar &&
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Salvar informações
                </LoadingButton>
              }
            </Grid>
          </Stack>
        </FormProvider>
      )}
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { pesquisa } = filters;

  if (!inputData) return [];

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  const _pesquisa = pesquisa.trim().toLowerCase();

  if (_pesquisa.length) {
    inputData = inputData.filter((item) => item.aluno.nome.toLowerCase().indexOf(_pesquisa) >= 0);
  }

  return inputData;
}
