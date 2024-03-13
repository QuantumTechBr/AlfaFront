'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import _ from 'lodash';

// @mui
import { useTheme } from '@mui/material/styles';
import {
  Stack,
  Button,
  Typography,
  Container,
  Card,
  TableRow,
  TableCell,
  CardHeader,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { styled } from '@mui/material/styles';

// contexts
import { AuthContext } from 'src/auth/context/alfa';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';

// components
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';
import LoadingBox from 'src/components/helpers/loading-box';
import Iconify from 'src/components/iconify';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter, useSearchParams } from 'src/routes/hook';
import { useDebounce } from 'src/hooks/use-debounce';

// ----------------------------------------------------------------------
import DashboardEscolaTableToolbar from './dashboard-escola-table-toolbar';
import dashboardsMethods from 'src/sections/overview/dashboards-repository';

//
import NumeroComponent from '../../components/numero-component';
import DesempenhoAlunosWidget from '../../components/desempenho-alunos-widget';
import MetaComponent from '../../components/meta-component';
import IndicesCompostosAlfabetizacaoGeralWidget from '../../widgets/indices-compostos-alfabetizacao-geral-widget';
import DashboardGridFilters from '../../components/dashboard-grid-filter';
import Scrollbar from 'src/components/scrollbar';

//
import { paths } from 'src/routes/paths';
import { anos_metas } from 'src/_mock/assets';

export default function DashboardEscolaView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const searchParams = useSearchParams();
  const initialEscola = searchParams.get('escola');

  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(true);
  const [zonaFiltro, setZonaFiltro] = useState([]);
  const [escolaFiltro, setEscolaFiltro] = useState([]);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: [],
    escola: [],
    turma: [],
    anoEscolar: [],
  });

  const [dados, setDados] = useState({
    total_alunos_avaliados: null,
    //
    grid_turmas: [],
    desempenho_alunos: {},
  });

  const getTurmasPorAnoEscolar = useCallback(
    (anoEscolar) => {
      return turmas.filter((turma) => turma.ano_escolar == anoEscolar).map((turma) => turma.id);
    },
    [turmas]
  );

  const preencheGraficos = useCallback(
    async (_filters) => {
      table.onResetPage();
      console.log('preencheGraficos');
      const _filtersToSearch = _filters ?? filters;
      isGettingGraphics.onTrue();
      const fullFilters = {
        ano_letivo: [
          (_filtersToSearch.anoLetivo != '' ? _filtersToSearch.anoLetivo : _.first(anosLetivos)).id,
        ],
        ddz: _filtersToSearch.zona.map((item) => item.id),
        escola: _filtersToSearch.escola.map((item) => item.id),
        turma: _.flatten(
          filters.anoEscolar.map((aE) => {
            return getTurmasPorAnoEscolar(aE);
          })
        ),
      };

      await Promise.all([
        //
        dashboardsMethods.getDashboardGridTurmas(fullFilters).then((response) => {
          // adequação dos dados
          const result = response.data.map((i) => {
            const _avaliados = _.isArray(i.qtd_avaliados)
              ? _.last(i.qtd_avaliados)
              : i.qtd_avaliados;
            const _alfabetizados = _.isArray(i.qtd_alfabetizado)
              ? _.last(i.qtd_alfabetizado)
              : i.qtd_alfabetizado;
            const _nao_alfabetizados = _.isArray(i.qtd_nao_alfabetizado)
              ? _.last(i.qtd_nao_alfabetizado)
              : i.qtd_nao_alfabetizado;
            const _deixou_de_frequentar = _.isArray(i.qtd_nao_avaliado)
              ? _.last(i.qtd_nao_avaliado)
              : i.qtd_nao_avaliado;

            return {
              ...i,
              alunos: i.qtd_alunos,
              avaliados: _avaliados,
              alfabetizados: _alfabetizados,
              nao_alfabetizados: _nao_alfabetizados,
              deixou_de_frequentar: _deixou_de_frequentar,
              //
              indice_alfabetizacao:
                _avaliados > 0
                  ? Number(`${((_alfabetizados / _avaliados) * 100).toFixed(0)}`)
                  : _avaliados,
            };
          });

          setDados((prevState) => ({
            ...prevState,
            total_alunos_avaliados: result.reduce((acc, i) => acc + (i.avaliados ?? 0), 0),
            grid_turmas: result,
          }));
        }),

        // ## DESEMPENHO ALUNO
        dashboardsMethods.getDashboardDesempenhoAlunos(fullFilters).then((response) => {
          setDados((prevState) => ({
            ...prevState,
            desempenho_alunos: response.data,
          }));
        }),
      ]);

      isGettingGraphics.onFalse();
    },
    [filters, anosLetivos, getTurmasPorAnoEscolar, isGettingGraphics]
  );

  const handleFilters = useCallback(
    (campo, value) => {
      if (campo == 'zona') {
        if (value.length == 0) {
          setEscolasFiltered(escolas);
        } else {
          var escolasFiltered = escolas.filter((escola) =>
            value.map((zona) => zona.id).includes(escola.zona.id)
          );
          setEscolasFiltered(escolasFiltered);
        }

        setFilters((prevState) => ({
          ...prevState,
          ['escola']: [],
          [campo]: value,
        }));
      } else {
        setFilters((prevState) => ({
          ...prevState,
          [campo]: value,
        }));
      }
    },
    [setFilters, setEscolasFiltered, escolas]
  );

  const preparacaoInicial = useCallback(() => {
    if (preparacaoInicialRunned.value === false) {
      preparacaoInicialRunned.onTrue();
      Promise.all([
        buscaAnosLetivos(),
        buscaZonas(),
        buscaEscolas().then((_escolas) => setEscolasFiltered(_escolas)),
        buscaTurmas(),
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [
    preparacaoInicialRunned,
    buscaAnosLetivos,
    buscaZonas,
    buscaEscolas,
    buscaTurmas,
    contextReady,
  ]);

  useEffect(() => {
    if (contextReady.value) {
      const _escola = escolas.filter((e) => e.id == initialEscola);

      const _filters = {
        ...filters,
        ...(_escola.length > 0 ? { escola: _escola } : {}),
        ...(zonaFiltro.length > 0 && _escola.length == 0
          ? {}
          : { zona: zonas.filter((z) => z.id == _escola[0]?.zona.id) ?? filters.zona }),
        ...(anosLetivos && anosLetivos.length > 0 ? { anoLetivo: _.first(anosLetivos) } : {}),
      };
      setFilters(_filters);
      preencheGraficos(_filters);
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    if (user?.funcao_usuario?.length > 0) {
      let _zonaFiltro = [];
      if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ') {
        _zonaFiltro = [user?.funcao_usuario[0]?.zona];
      } else {
        _zonaFiltro = [user?.funcao_usuario[0]?.escola?.zona];
      }

      let _escolaFiltro = [];
      if (user?.funcao_usuario[0]?.funcao?.nome == 'DIRETOR') {
        _escolaFiltro = [user?.funcao_usuario[0]?.escola];
      }
      setZonaFiltro(_zonaFiltro);
      setEscolaFiltro(_escolaFiltro);
      setFilters((prevState) => ({
        ...prevState,
        zona: _zonaFiltro,
        escola: _escolaFiltro,
      }));
    }
  }, [user?.funcao_usuario]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: _.first(anosLetivos),
      zona: zonaFiltro,
      escola: [],
      turma: [],
      anoEscolar: [],
    });
  };

  // TABLE GRID
  const router = useRouter();
  const TABLE_HEAD = [
    { id: 'ano_escolar', label: 'Ano', width: 110, notsortable: true },
    { id: 'turma_nome', label: 'Turma', width: 110, notsortable: true },
    { id: 'turno', label: 'Turno', width: 110, notsortable: true },
    { id: 'professores', label: 'Professores', notsortable: true },
    { id: 'estudantes', label: 'Estudantes', width: 110, notsortable: true },
    { id: 'avaliados', label: 'Avaliados', width: 110, notsortable: true },
    { id: 'alfabetizados', label: 'Alfabetizados', width: 110, notsortable: true },
    { id: 'nao_alfabetizados', label: 'Não alfabetizados', width: 160, notsortable: true },
    { id: 'deixou_de_frequentar', label: 'Deixou de frequentar', width: 180, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = { professor: '' };

  const table = useTable({ defaultRowsPerPage: 15 });

  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const dataFiltered = applyTableFilter({
    inputData: dados.grid_turmas,
    comparator: getComparator(table.order, table.orderBy),
    filters: debouncedGridFilter,
  });

  const notFound = dataFiltered.length == 0;

  const handleTableFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      setTableFilters((prevState) => ({
        ...prevState,
        escola: value,
      }));
    },
    [table]
  );

  const reduceAlfabetizacaoGeral = () => {
    return {
      hasSeries: true,
      categories: [
        {
          series: [
            {
              name: 'Alfabetizado',
              amount: _.sumBy(dados.grid_turmas, (s) => s.alfabetizados),
            },
            {
              name: 'Não alfabetizado',
              amount: _.sumBy(dados.grid_turmas, (s) => s.nao_alfabetizados),
            },
            {
              name: 'Deixou de frequentar',
              amount: _.sumBy(dados.grid_turmas, (s) => s.deixou_de_frequentar),
            },
          ],
        },
      ],
    };
  };

  const getTotalEstudandes = useCallback(() => {
    return _.sumBy(dados.grid_turmas ?? [], (turma) => turma.alunos);
  }, [dados]);

  const calculaMeta = () => {
    const _anos_metas = filters.anoEscolar.length
      ? _.pickBy(anos_metas, (v, k) => filters.anoEscolar.includes(+k))
      : anos_metas;
    return _.sum(_.values(_anos_metas)) / _.values(_anos_metas).length;
  };

  const getTotalAlfabetizados = () => _.sumBy(dados.grid_turmas, (s) => s.alfabetizados);
  const getTotalEstudandesAvaliados = () => _.sumBy(dados.grid_turmas, (s) => s.avaliados);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Stack
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Grid xs={12} md>
            <Typography variant="h3">Dashboard (Escola)</Typography>
          </Grid>
        </Stack>

        {!contextReady.value && (
          <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
            <LoadingBox />
          </Grid>
        )}

        {!!contextReady.value && (
          <>
            <Stack
              flexGrow={1}
              direction={{
                xs: 'column',
                md: 'row',
              }}
              width="100%"
              spacing={{
                xs: 1,
                md: 0,
              }}
              alignItems="center"
              sx={{ position: { md: 'sticky' }, top: { md: 0 }, zIndex: { md: 1101 } }}
              paddingY={1}
            >
              <Grid xs={12} md="auto" paddingY={0}>
                <DashboardEscolaTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  anoLetivoOptions={anosLetivos}
                  ddzOptions={zonas}
                  escolaOptions={_escolasFiltered || escolas}
                  anoEscolarOptions={[1, 2, 3]}
                />
              </Grid>
              <Grid xs={12} md="auto" paddingY={0}>
                <Button
                  variant="contained"
                  sx={{
                    width: {
                      xs: '70%',
                      md: 'auto',
                    },
                  }}
                  onClick={() => {
                    preencheGraficos();
                  }}
                >
                  Aplicar filtros
                </Button>

                <Button
                  variant="soft"
                  sx={{
                    width: {
                      xs: 'calc(30% - 10px)',
                      md: 'auto',
                    },
                    marginLeft: { xs: '10px', md: 2 },
                  }}
                  onClick={filtroReset}
                >
                  Limpar
                </Button>
              </Grid>
            </Stack>

            {!!isGettingGraphics.value && (
              <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
                <LoadingBox />
              </Grid>
            )}

            {!isGettingGraphics.value && (
              <Grid container marginX={0} spacing={3} marginTop={3} width="100%">
                <Grid xs={12} md={4}>
                  <NumeroComponent
                    title="Total de Estudantes"
                    total={getTotalEstudandes()}
                    icon={
                      <Iconify
                        width={ICON_SIZE}
                        icon="bi:people-fill"
                        sx={{
                          color: theme.palette['primary'].main,
                        }}
                      />
                    }
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <NumeroComponent
                    title="Total de Estudantes Avaliados"
                    total={dados.total_alunos_avaliados ?? 0}
                    icon={
                      <Iconify
                        width={ICON_SIZE}
                        icon="bi:people-fill"
                        sx={{
                          color: theme.palette['primary'].main,
                        }}
                      />
                    }
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <MetaComponent
                    title="Meta"
                    subtitle="entre a média das séries"
                    meta={calculaMeta()}
                    alfabetizados={getTotalAlfabetizados()}
                    total={getTotalEstudandesAvaliados()}
                  ></MetaComponent>
                </Grid>

                <IndicesCompostosAlfabetizacaoGeralWidget
                  title="por turma"
                  indice_alfabetizacao={[
                    ...dados.grid_turmas.map((e) => {
                      return {
                        ...e,
                        title: `${e.turma_ano_escolar} ${e.turma_nome}`,
                      };
                    }),
                  ]}
                  indice_alfabetizacao_geral={reduceAlfabetizacaoGeral()}
                />

                {dados.desempenho_alunos.chart &&
                  (dados.desempenho_alunos.chart?.series ?? []).length > 0 && (
                    <Grid xs={12}>
                      <DesempenhoAlunosWidget
                        title="Desempenho dos Estudantes - Índice de fases"
                        subheader={dados.desempenho_alunos.subheader}
                        chart={dados.desempenho_alunos.chart}
                      />
                    </Grid>
                  )}

                <Grid xs={12}>
                  <Card sx={{ mt: 3, mb: 4 }}>
                    <CardHeader title="Turmas" />
                    <DashboardGridFilters filters={tableFilters} onFilters={handleTableFilters} />

                    <TableContainer
                      sx={{
                        mt: 1,
                        height:
                          70 +
                          (dataFiltered.length == 0
                            ? 350
                            : (dataFiltered.length < table.rowsPerPage
                                ? dataFiltered.length
                                : table.rowsPerPage) * 43),
                      }}
                    >
                      <Scrollbar>
                        <Table size="small" sx={{ minWidth: 960 }} aria-label="collapsible table">
                          <TableHeadCustom
                            order={table.order}
                            orderBy={table.orderBy}
                            headLabel={TABLE_HEAD}
                            rowCount={dados.grid_turmas.length}
                            onSort={table.onSort}
                          />

                          <TableBody>
                            {Object.entries(
                              dataFiltered.slice(
                                table.page * table.rowsPerPage,
                                table.page * table.rowsPerPage + table.rowsPerPage
                              )
                            ).map(([key, row]) => (
                              <Row key={`tableRowDash_${key}`} row={{ ...row, key: key }} />
                            ))}

                            <TableEmptyRows
                              height={43}
                              emptyRows={emptyRows(
                                table.page,
                                table.rowsPerPage,
                                dados.grid_turmas.length
                              )}
                            />

                            <TableNoData notFound={notFound} />
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>

                    <TablePaginationCustom
                      count={dataFiltered.length}
                      page={table.page}
                      rowsPerPage={table.rowsPerPage}
                      rowsPerPageOptions={[5, 10, 15, 25]}
                      onPageChange={table.onChangePage}
                      onRowsPerPageChange={table.onChangeRowsPerPage}
                      dense={table.dense}
                    />
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyTableFilter({ inputData, comparator, filters }) {
  const { professor } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (professor) {
    inputData = inputData.filter(
      (row) => row.professor_nome.toLowerCase().indexOf(professor.toLowerCase()) !== -1
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

function Row(props) {
  const { row } = props;

  // TODO REMOVER E MIGRAR PARA ACESSO UNICO
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.action.hover,
    },
    ':hover': {
      backgroundColor: theme.palette.action.focus,
    },
  }));
  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell>{row.turma_ano_escolar}º</TableCell>
      <TableCell>{row.turma_nome}</TableCell>
      <TableCell>{row.turma_turno}</TableCell>
      <TableCell>{(row.turma_professor ?? []).map((prof) => prof.nome).join(`, `)}</TableCell>
      <TableCell>{row.alunos ?? 0}</TableCell>
      <TableCell>{row.avaliados ?? 0}</TableCell>
      <TableCell>{row.alfabetizados ?? 0}</TableCell>
      <TableCell>{row.nao_alfabetizados ?? 0}</TableCell>
      <TableCell>{row.deixou_de_frequentar ?? 0}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          component={RouterLink}
          href={`${paths.dashboard.root}/dash-turma/?turma=${row.turma_id ?? ''}`}
        >
          Ver mais
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}
