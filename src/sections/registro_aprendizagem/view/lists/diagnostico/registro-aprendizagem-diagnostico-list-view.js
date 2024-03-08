'use client';

import { useEffect, useState, useCallback } from 'react';
import { first } from 'lodash';

// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { useAuthContext } from 'src/auth/hooks';

// _mock
import { _anos } from 'src/_mock';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
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
import RegistroAprendizagemDiagnosticoTableRow from './registro-aprendizagem-diagnostico-table-row';
import RegistroAprendizagemTableToolbar from '../registro-aprendizagem-table-toolbar';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import LoadingBox from 'src/components/helpers/loading-box';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano_letivo', label: 'Ano Letivo', width: 75 },
  { id: 'ano_escolar', label: 'Ano Escolar', width: 75 },
  { id: 'nome', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'periodo', label: 'Período', width: 105 },
  { id: 'escola_nome', label: 'Escola' },
  { id: 'atualizado_por', label: 'Atualizado Por' },
  { id: '', width: 72 },
];

const defaultFilters = {
  anoLetivo: '',
  escola: '',
  turma: [],
  pesquisa: '',
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoListView() {
  const { checkPermissaoModulo } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable();

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const contextReady = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo('registro_aprendizagem', 'cadastrar');

  const [filters, setFilters] = useState(defaultFilters);
  const [turmasFiltered, setTurmasFiltered] = useState([]);
  const [tableData, setTableData] = useState([]);

  const tabelaPreparada = useBoolean(false);
  const buscando = useBoolean(false);

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
    ]).finally(() => {
      contextReady.onTrue();
    });
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    if (contextReady.value) {
      const _filters = {};

      if (anosLetivos.length) {
        _filters.anoLetivo = anosLetivos.length ? first(anosLetivos) : '' ?? '';
      }
      if (escolas.length && escolas.length == 1) {
        _filters.escola = escolas.length ? first(escolas) : [] ?? [];
      }

      setFilters((prevState) => ({
        ...prevState,
        ..._filters,
      }));

      if (_filters.anoLetivo) {
        buscarAvaliacoes();
      }
    }
  }, [contextReady.value]);

  const buscarAvaliacoes = async () => {
    if (contextReady.value && anosLetivos.length && turmas.length) {
      setTableData([]);
      tabelaPreparada.onFalse();
      buscando.onTrue();
      setWarningMsg('');
      setErrorMsg('');

      const promisesList = [];
      let turmasComRegistroNovo = [];

      const _filtersToSend = {
        turmaId: (filters.turma.length ? filters.turma : turmasFiltered).map((turma) => turma.id),
      };

      // INICIAL
      const buscaPeriodoInicial = registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemDiagnostico({ ..._filtersToSend, periodo: 'Inicial' })
        .then((response) => {
          if (response.data?.length) {
            response.data.forEach((registro) => {
              const turma = turmas.find((turma) => turma.id == registro.turma_id);
              if (turma?.id) {
                const retorno = { ...turma };
                retorno.periodo = 'Inicial';
                retorno.escola_nome = escolas.find((escola) => escola.id == turma.escola_id).nome;
                retorno.ano_letivo = anosLetivos.find((ano) => ano.id == turma.ano_id).ano;
                retorno.atualizado_por = registro.atualizado_por;

                turmasComRegistroNovo.push(retorno);
              }
            });
          }
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de Registro Aprendizagem Diagnostico Inicial');
          console.error(error);
        });
      promisesList.push(buscaPeriodoInicial);

      // FINAL
      const buscaPeriodoFinal = registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemDiagnostico({ ..._filtersToSend, periodo: 'Final' })
        .then((response) => {
          if (response.data?.length) {
            response.data.forEach((registro) => {
              const turma = turmas.find((turma) => turma.id == registro.turma_id);
              if (turma?.id) {
                const retorno = { ...turma };
                retorno.periodo = 'Final';
                retorno.escola_nome = escolas.find((escola) => escola.id == turma.escola_id).nome;
                retorno.ano_letivo = anosLetivos.find((ano) => ano.id == turma.ano_id).ano;
                retorno.atualizado_por = registro.atualizado_por;

                turmasComRegistroNovo.push(retorno);
              }
            });
          }
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de Registro Aprendizagem Diagnostico Final');
          console.error(error);
        });
      promisesList.push(buscaPeriodoFinal);

      //
      await Promise.all(promisesList).then(() => {
        setTableData(turmasComRegistroNovo);
        tabelaPreparada.onTrue();
      });
    }

    buscando.onFalse();
  };

  useEffect(() => {
    const _turmasFiltered = turmas.filter((turma) => filters.escola.id == turma.escola_id);
    setTurmasFiltered(_turmasFiltered);
  }, [filters.escola]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !tableData.length;

  const handleFilters = useCallback(
    (campo, value) => {
      let _filters = {};
      if (campo == 'escola') {
        _filters.turma = [];
      }
      _filters[campo] = value;
      setFilters((prevState) => ({
        ...prevState,
        ..._filters,
      }));
    },
    [table]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.registro_aprendizagem.edit_diagnostico(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    (id, periodo) => {
      const deleteRow = tableData.find((row) => row.id == id && row.periodo == periodo);
      if (!deleteRow) {
        setWarningMsg('Linha a ser deletada não encontrada.');
        return;
      }
      const remainingRows = tableData.filter((row) => row.id !== id || row.periodo !== periodo);
      registroAprendizagemMethods
        .deleteRegistroAprendizagemByFilter({ tipo: 'diagnóstico', turmaId: id, periodo: periodo })
        .then((retorno) => {
          setTableData(remainingRows);
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de registros aprendizagem no momento da exclusão do registro'
          );
        });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    const promises = [];
    tableData.map((row) => {
      if (table.selected.includes(`${row.id}_${row.periodo}`)) {
        const newPromise = registroAprendizagemMethods
          .deleteRegistroAprendizagemByFilter({
            tipo: 'diagnóstico',
            turmaId: row.id,
            periodo: row.periodo,
          })
          .catch((error) => {
            remainingRows.push(row);
            setErrorMsg(
              'Erro de comunicação com a API de registros no momento da exclusão do registro'
            );
            throw error;
          });
        promises.push(newPromise);
      } else {
        remainingRows.push(row);
      }
    });
    Promise.all(promises).then((retorno) => {
      setTableData(remainingRows);
    });

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const novaAvaliacao = useBoolean();

  const closeNovaAvaliacao = () => {
    novaAvaliacao.onFalse();
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h4">Avaliação Diagnóstica</Typography>
          {permissaoCadastrar && (
            <Button
              onClick={novaAvaliacao.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#00A5AD',
              }}
            >
              Adicionar
            </Button>
          )}
        </Stack>

        <NovaAvaliacaoForm
          open={novaAvaliacao.value}
          onClose={closeNovaAvaliacao}
          initialTipo="Avaliação de Fase"
        />

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>
          <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{
              pr: { xs: 2.5, md: 2.5 },
            }}
          >
            <RegistroAprendizagemTableToolbar
              filters={filters}
              onFilters={handleFilters}
              anoLetivoOptions={anosLetivos}
              turmaOptions={turmasFiltered.length ? turmasFiltered : null}
              escolaOptions={escolas}
              export_type="diagnostico"
            />

            <Button
              variant="contained"
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
              onClick={buscarAvaliacoes}
            >
              Aplicar filtros
            </Button>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {(!contextReady.value || buscando.value) && <LoadingBox />}
              
              {contextReady.value && tabelaPreparada.value && (
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataInPage.map((row) => (
                      <RegistroAprendizagemDiagnosticoTableRow
                        key={`RegistroAprendizagemDiagnosticoTableRow_${row.id}_${row.periodo}`}
                        row={row}
                        onEditRow={() => handleEditRow(row.id, row.periodo)}
                        onDeleteRow={() => handleDeleteRow(row.id, row.periodo)}
                      />
                    ))}

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
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { pesquisa } = filters;

  if (!inputData) {
    return [];
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  const _pesquisa = pesquisa.trim().toLowerCase();

  if (_pesquisa.length) {
    inputData = inputData.filter((item) => {
      return (
        // item.ano.ano.toString().toLowerCase().indexOf(_pesquisa) !== -1 ||
        // `${item.ano_escolar.toLowerCase()}${item.nome.toLowerCase()}`.indexOf(
        //   _pesquisa
        // ) !== -1 ||
        // item.turno.toLowerCase().indexOf(_pesquisa) !== -1 ||
        // item.periodo.toLowerCase().indexOf(_pesquisa) !== -1 ||
        item.escola.nome.toLowerCase().indexOf(_pesquisa) >= 0
      );
    });
  }

  return inputData;
}
