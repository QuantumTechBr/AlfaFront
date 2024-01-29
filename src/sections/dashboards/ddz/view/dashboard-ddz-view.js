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
  Box,
  TableHead,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { styled } from '@mui/material/styles';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

// contexts
import { AuthContext } from 'src/auth/context/alfa';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';

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
import { useSearchParams } from 'src/routes/hook';
import { useDebounce } from 'src/hooks/use-debounce';

import { first } from 'lodash';

// ----------------------------------------------------------------------
import DashboardDDZTableToolbar from './dashboard-ddz-table-toolbar';
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

export default function DashboardDDZView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const searchParams = useSearchParams();
  const initialZona = searchParams.get('zona');

  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);
  const [zonaFiltro, setZonaFiltro] = useState('');

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: zonaFiltro,
  });

  const [dados, setDados] = useState({
    total_alunos_avaliados: null,
    //
    grid_escolas: [],
    desempenho_alunos: {},
  });

  const preencheGraficos = useCallback(
    async (_filters) => {
      let _filtersToSearch = _filters ?? filters;
      isGettingGraphics.onTrue();
      const fullFilters = {
        ano_letivo: [
          (_filtersToSearch.anoLetivo != '' ? _filtersToSearch.anoLetivo : first(anosLetivos)).id,
        ],
        ddz: [_filtersToSearch.zona.id],
      };

      await Promise.all([
        //
        dashboardsMethods.getDashboardGridEscolas(fullFilters).then((response) => {
          // adequação dos dados
          let result = _(response.data)
            .groupBy((turmaEscola) => turmaEscola.escola_nome)
            .map((escolaTurmas, key) => {
              let _alunos = _.sumBy(escolaTurmas, (s) => s.qtd_alunos);
              let _avaliados = _.sumBy(escolaTurmas, (s) => _.last(s.qtd_avaliados));
              let _alfabetizados = _.sumBy(escolaTurmas, (s) => _.last(s.qtd_alfabetizado));
              let _nao_alfabetizados = _.sumBy(escolaTurmas, (s) => _.last(s.qtd_nao_alfabetizado));
              let _deixou_de_frequentar = _.sumBy(escolaTurmas, (s) => _.last(s.qtd_nao_avaliado));

              return {
                escola_nome: key,
                registros: escolaTurmas,
                escola_id: escolaTurmas[0]?.escola_id,
                //
                turmas: escolaTurmas.length,
                alunos: _alunos,
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
            })
            .value();

          setDados((prevState) => ({
            ...prevState,
            total_alunos_avaliados: result.reduce((acc, i) => acc + i.avaliados, 0),
            grid_escolas: result,
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
    [dados, filters, zonas, anosLetivos, contextReady.value]
  );

  const handleFilters = useCallback(
    (campo, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [campo]: value,
      }));
    },
    [setFilters, setZonaFiltro, zonas]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      preparacaoInicialRunned.onTrue();
      Promise.all([buscaAnosLetivos(), buscaZonas()]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [preparacaoInicialRunned, anosLetivos, zonas]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, [preparacaoInicial]);

  useEffect(() => {
    if (contextReady.value) {
      let _filters = {
        ...filters,
        zona: zonas.find((z) => z.id == initialZona),
        ...(anosLetivos && anosLetivos.length ? { anoLetivo: first(anosLetivos) } : {}),
      };
      setFilters(_filters);
      preencheGraficos(_filters);
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    if (user?.funcao_usuario?.length > 0) {
      let _zonaFiltro = '';
      if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ') {
        _zonaFiltro = user?.funcao_usuario[0]?.zona;
      } else {
        _zonaFiltro = user?.funcao_usuario[0]?.escola?.zona;
      }

      setZonaFiltro(_zonaFiltro);
      setFilters((prevState) => ({
        ...prevState,
        zona: _zonaFiltro,
      }));
    }
  }, []);

  // TABLE GRID

  const TABLE_HEAD = [
    { id: 'collapse', label: '', notsortable: true },
    { id: 'escola', label: 'Escola', notsortable: true },
    { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
    { id: 'estudantes', label: 'Estudantes', width: 110, notsortable: true },
    { id: 'avaliados', label: 'Avaliados', width: 110, notsortable: true },
    { id: 'alfabetizados', label: 'Alfabetizados', width: 110, notsortable: true },
    { id: 'nao_alfabetizados', label: 'Não alfabetizados', width: 160, notsortable: true },
    { id: 'deixou_de_frequentar', label: 'Deixou de frequentar', width: 180, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = { escola: '' };

  const table = useTable({ defaultRowsPerPage: 15 });

  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const dataFiltered = applyTableFilter({
    inputData: dados.grid_escolas,
    comparator: getComparator(table.order, table.orderBy),
    filters: debouncedGridFilter,
  });

  const notFound = !dataFiltered.length;

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

  const reduceAlfabetizacaoGeral = function () {
    return {
      hasSeries: true,
      categories: [
        {
          series: [
            {
              name: 'Alfabetizado',
              amount: _.sumBy(dados.grid_escolas, (s) => s.alfabetizados),
            },
            {
              name: 'Não alfabetizado',
              amount: _.sumBy(dados.grid_escolas, (s) => s.nao_alfabetizados),
            },
            {
              name: 'Deixou de frequentar',
              amount: _.sumBy(dados.grid_escolas, (s) => s.deixou_de_frequentar),
            },
          ],
        },
      ],
    };
  };

  const totalEstudandesGeral = useCallback(() => {
    let total = 0;
    total = _.sumBy(dados.grid_escolas ?? [], (ddz) => ddz.alunos);
    return total;
  });

  const calculaMeta = () => {
    let _meta = _.sum(_.values(anos_metas)) / _.values(anos_metas).length;
    return _meta;
  };

  const getTotalAlfabetizados = () => {
    let _soma = _.sumBy(dados.grid_escolas, (s) => s.alfabetizados);
    return _soma;
  };
  const getTotalAvaliados = (ano) => {
    let _soma = _.sumBy(dados.grid_escolas, (s) => s.avaliados);
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
            <Typography variant="h3">Dashboard (DDZ)</Typography>
          </Grid>
        </Stack>

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
              <DashboardDDZTableToolbar
                filters={filters}
                onFilters={handleFilters}
                anoLetivoOptions={anosLetivos}
                ddzOptions={zonas}
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
              total={totalEstudandesGeral()}
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
            {!isGettingGraphics.value && (
              <MetaComponent
                title="Meta"
                subtitle="entre a média das séries"
                meta={calculaMeta()}
                alfabetizados={getTotalAlfabetizados()}
                total={getTotalAvaliados()}
              ></MetaComponent>
            )}
          </Grid>

          {!!isGettingGraphics.value && (
            <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
              <LoadingBox />
            </Grid>
          )}

          {!isGettingGraphics.value && (
            <IndicesCompostosAlfabetizacaoGeralWidget
              title="por escola"
              indice_alfabetizacao={[
                ...dados.grid_escolas.map((e) => {
                  return {
                    ...e,
                    title: e.escola_nome,
                  };
                }),
              ]}
              indice_alfabetizacao_geral={reduceAlfabetizacaoGeral()}
            />
          )}

          {!isGettingGraphics.value && (dados.desempenho_alunos.chart?.series ?? []).length > 0 && (
            <Grid xs={12}>
              <DesempenhoAlunosWidget
                title="Desempenho dos Estudantes - Índice de fases"
                subheader={dados.desempenho_alunos.subheader}
                chart={dados.desempenho_alunos.chart}
              />
            </Grid>
          )}
        </Grid>
      </Grid>

      {!isGettingGraphics.value && (
        <Card sx={{ mt: 3, mb: 4 }}>
          <CardHeader title="Escolas" />
          <DashboardGridFilters filters={tableFilters} onFilters={handleTableFilters} />

          <TableContainer sx={{ mt: 1, height: 500 }}>
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 960 }} aria-label="collapsible table">
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dados.grid_escolas.length}
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
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dados.grid_escolas.length)}
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
  const { escola } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (escola) {
    inputData = inputData.filter(
      (row) => row.escola_nome.toLowerCase().indexOf(escola.toLowerCase()) !== -1
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
    <>
      <StyledTableRow
        key={`tableStyledRowDash_${row.key}`}
        sx={{ '& > *': { borderBottom: 'unset', backgroundColor: open ? `#00000020` : null } }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.escola_nome}</TableCell>
        <TableCell>{row.turmas}</TableCell>
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
            href={`${paths.dashboard.root}/dash-escola/?escola=${row.escola_id ?? ''}`}
          >
            Ver mais
          </Button>
        </TableCell>
      </StyledTableRow>

      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, border: '1px solid #00000080' }}>
              <Table size="small" aria-label="Turmas" width="100%">
                <TableHead>
                  <TableRow>
                    <TableCell>Ano - Turma</TableCell>
                    <TableCell>Estudandes</TableCell>
                    <TableCell>Avaliados</TableCell>
                    <TableCell>Alfabetizados</TableCell>
                    <TableCell>Não alfabetizados</TableCell>
                    <TableCell>Deixou de frequentar</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.registros.map((registro) => (
                    <StyledTableRow
                      key={
                        registro.turma_id ??
                        `${registro.escola_nome}-${registro.turma_ano_escolar}-${registro.turma_nome}-${registro.turma_turno}-`
                      }
                    >
                      <TableCell component="th" scope="row">
                        {registro.turma_ano_escolar} {registro.turma_nome}
                      </TableCell>
                      <TableCell width="110">{registro.qtd_alunos}</TableCell>
                      <TableCell width="110">{_.last(registro.qtd_avaliados)}</TableCell>
                      <TableCell width="110">{_.last(registro.qtd_alfabetizado)}</TableCell>
                      <TableCell width="160">{_.last(registro.qtd_nao_alfabetizado)}</TableCell>
                      <TableCell width="180">{_.last(registro.qtd_nao_avaliado)}</TableCell>
                      <TableCell width="77"></TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
