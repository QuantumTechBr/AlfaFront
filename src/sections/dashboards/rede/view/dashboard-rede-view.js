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
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
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
import { useDebounce } from 'src/hooks/use-debounce';

import { first } from 'lodash';

// ----------------------------------------------------------------------
import DashboardRedeTableToolbar from './dashboard-rede-table-toolbar';
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
import IndiceAlfabetizacaoBimestreComponent from '../../components/indice-alfabetizacao-bimestre-component';
import { anos_metas } from 'src/_mock/assets';

export default function DashboardRedeView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    turma: [],
    anoEscolar: [],
  });

  const [dados, setDados] = useState({
    total_alunos_avaliados: null,
    //
    grid_ddz: [],
    desempenho_alunos: {},
  });

  const getTurmasPorAnoEscolar = useCallback((anoEscolar) => {
    return turmas.filter((turma) => turma.ano_escolar == anoEscolar).map((turma) => turma.id);
  }, [turmas]);

  const preencheGraficos = useCallback(
    async (_filters) => {
      const _filtersToSearch = _filters ?? filters;

      isGettingGraphics.onTrue();
      const fullFilters = {
        ano_letivo: [
          (_filtersToSearch.anoLetivo != '' ? _filtersToSearch.anoLetivo : first(anosLetivos))?.id,
        ],
        turma: _.flatten(
          filters.anoEscolar.map((aE) => {
            return getTurmasPorAnoEscolar(aE);
          })
        ),
      };

      await Promise.all([
        dashboardsMethods.getDashboardGridRede(fullFilters).then((response) => {
          // adequação dos dados
          const result = response.data.map((i) => {
            const _avaliados = _.isArray(i.qtd_avaliados) ? _.last(i.qtd_avaliados) : i.qtd_avaliados;
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
            total_alunos_avaliados: result.reduce((acc, i) => acc + i.avaliados, 0),
            grid_ddz: result,
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
    [filters, isGettingGraphics, anosLetivos, getTurmasPorAnoEscolar]
  );

  const handleFilters = useCallback(
    (campo, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [campo]: value,
      }));
    },
    [setFilters]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      preparacaoInicialRunned.onTrue();
      Promise.all([buscaAnosLetivos(), buscaTurmas()]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [preparacaoInicialRunned, buscaAnosLetivos, buscaTurmas, contextReady]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, [preparacaoInicial]);

  useEffect(() => {
    if (contextReady.value) {
      const _filters = {
        ...filters,
        ...(anosLetivos && anosLetivos.length ? { anoLetivo: first(anosLetivos) } : {}),
      };

      setFilters(_filters);
      preencheGraficos(_filters);
    }
  }, [anosLetivos, contextReady.value, filters, preencheGraficos]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  // TABLE GRID
  const TABLE_HEAD = [
    { id: 'ddz', label: 'DDZ', notsortable: true },
    { id: 'escolae', label: 'Escolas', notsortable: true },
    { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
    { id: 'estudantes', label: 'Estudantes', width: 110, notsortable: true },
    { id: 'avaliados', label: 'Avaliados', width: 110, notsortable: true },
    { id: 'alfabetizados', label: 'Alfabetizados', width: 110, notsortable: true },
    { id: 'nao_alfabetizados', label: 'Não alfabetizados', width: 160, notsortable: true },
    { id: 'deixou_de_frequentar', label: 'Deixou de frequentar', width: 180, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = { zona: '' };

  const table = useTable({ defaultRowsPerPage: 15 });

  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const dataFiltered = applyTableFilter({
    inputData: dados.grid_ddz,
    comparator: getComparator(table.order, table.orderBy),
    filters: debouncedGridFilter,
  });

  const notFound = !dataFiltered.length;

  const handleTableFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      setTableFilters((prevState) => ({
        ...prevState,
        zona: value,
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
              amount: _.sumBy(dados.grid_ddz, (s) => s.alfabetizados),
            },
            {
              name: 'Não alfabetizado',
              amount: _.sumBy(dados.grid_ddz, (s) => s.nao_alfabetizados),
            },
            {
              name: 'Deixou de frequentar',
              amount: _.sumBy(dados.grid_ddz, (s) => s.deixou_de_frequentar),
            },
          ],
        },
      ],
    };
  };

  const getTotalEstudandes = useCallback(() => {
    return _.sumBy(dados.grid_ddz ?? [], (ddz) => ddz.alunos);
  }, [dados]);

  const calculaMeta = () => {
    const _anos_metas = filters.anoEscolar.length
      ? _.pickBy(anos_metas, (v, k) => filters.anoEscolar.includes(+k))
      : anos_metas;
    const _meta = _.sum(_.values(_anos_metas)) / _.values(_anos_metas).length;
    return _meta;
  };

  const getTotalAlfabetizados = () => {
    const _soma = _.sumBy(dados.grid_ddz, (s) => s.alfabetizados);
    return _soma;
  };
  const getTotalEstudandesAvaliados = () => {
    const _soma = _.sumBy(dados.grid_ddz, (s) => s.avaliados);
    return _soma;
  };

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
            <Typography variant="h3">Dashboard (Rede)</Typography>
          </Grid>
        </Stack>

        {!contextReady.value && (
          <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
            <LoadingBox />
          </Grid>
        )}

        {!!contextReady.value && (
          <Grid container spacing={3}>
            <Stack
              flexGrow={1}
              direction="row"
              alignItems="center"
              justifyContent="start"
              width="100%"
              sx={{ position: 'sticky', top: 0, zIndex: 1101 }}
            >
              <Grid xs={12} md="auto">
                <DashboardRedeTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  anoLetivoOptions={anosLetivos}
                  anoEscolarOptions={[1, 2, 3]}
                />
              </Grid>
              <Grid xs={12} md="auto">
                <Button
                  variant="contained"
                  onClick={() => {
                    preencheGraficos();
                  }}
                >
                  Aplicar filtros
                </Button>
              </Grid>
            </Stack>

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
              {!!contextReady.value && !isGettingGraphics.value && (
                <MetaComponent
                  title="Meta"
                  subtitle="entre a média das séries"
                  meta={calculaMeta()}
                  alfabetizados={getTotalAlfabetizados()}
                  total={getTotalEstudandesAvaliados()}
                ></MetaComponent>
              )}
            </Grid>

            {!!isGettingGraphics.value && (
              <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
                <LoadingBox />
              </Grid>
            )}

            {!isGettingGraphics.value && (
              <Grid xs={12}>
                <IndiceAlfabetizacaoBimestreComponent
                  title="Índice de alfabetização - Bimestre"
                  grid_ddz={dados.grid_ddz}
                ></IndiceAlfabetizacaoBimestreComponent>
              </Grid>
            )}

            {!isGettingGraphics.value && (
              <IndicesCompostosAlfabetizacaoGeralWidget
                title="por DDZ"
                indice_alfabetizacao={[
                  ...dados.grid_ddz.map((e) => {
                    return {
                      ...e,
                      title: e.zona_nome,
                    };
                  }),
                ]}
                indice_alfabetizacao_geral={reduceAlfabetizacaoGeral()}
              />
            )}

            {!isGettingGraphics.value && dados.desempenho_alunos.chart &&
              dados.desempenho_alunos.chart && dados.desempenho_alunos && dados.desempenho_alunos.chart.series && (
                <Grid xs={12}>
                  <DesempenhoAlunosWidget
                    title="Desempenho dos Estudantes - Índice de fases"
                    subheader={dados.desempenho_alunos.subheader ?? ''}
                    chart={dados.desempenho_alunos.chart}
                  />
                </Grid>
              )}
          </Grid>
        )}
      </Grid>

      {!!contextReady.value && !isGettingGraphics.value && (
        <Card sx={{ mt: 3, mb: 4 }}>
          <CardHeader title="DDZs" />
          <DashboardGridFilters filters={tableFilters} onFilters={handleTableFilters} />

          <TableContainer sx={{ mt: 1, height: 300 }}>
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 960 }} aria-label="collapsible table">
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dados.grid_ddz.length}
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
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dados.grid_ddz.length)}
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
            //
            dense={table.dense}
          />
        </Card>
      )}
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyTableFilter({ inputData, comparator, filters }) {
  const { zona } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (zona) {
    inputData = inputData.filter(
      (row) => row.zona_nome.toLowerCase().indexOf(zona.toLowerCase()) !== -1
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

function Row(props) {
  const { row } = props;
  const [open, setOpen] = useState(false);

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
      sx={{ '& > *': { borderBottom: 'unset', backgroundColor: open ? `#00000020` : null } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.zona_nome}</TableCell>
      <TableCell>{row.qtd_escolas}</TableCell>
      <TableCell>{row.qtd_turmas}</TableCell>
      <TableCell>{row.alunos}</TableCell>
      <TableCell>{row.avaliados}</TableCell>
      <TableCell>{row.alfabetizados}</TableCell>
      <TableCell>{row.nao_alfabetizados}</TableCell>
      <TableCell>{row.deixou_de_frequentar}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          component={RouterLink}
          color="primary"
          variant="contained"
          size="small"
          href={`${paths.dashboard.root}/dash-ddz/?zona=${row.zona_id ?? ''}`}
        >
          Ver mais
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}
