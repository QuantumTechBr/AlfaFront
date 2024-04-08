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
import { useDebounce } from 'src/hooks/use-debounce';

// ----------------------------------------------------------------------
import DashboardDiagnosticaTableToolbar from './dashboard-diagnostica-table-toolbar';
import dashboardsMethods from 'src/sections/overview/dashboards-repository';

//
import NumeroComponent from '../../components/numero-component';
import DashboardGridFilters from '../../components/dashboard-grid-filter';
import Scrollbar from 'src/components/scrollbar';

//
import { paths } from 'src/routes/paths';
import IndiceAlfabetizacaoBimestreComponent from '../../components/indice-alfabetizacao-bimestre-component';
import { preDefinedZonaOrder } from 'src/_mock';

export default function DashboardDiagnosticaView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [_escolasFiltered, setEscolasFiltered] = useState([]);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(true);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: '',
    escola: [],
    turma: [],
    anoEscolar: [],
    pne: '-',
    pneItem: '-',
  });

  const isZonaFiltered = filters.zona && filters.zona != '';
  const isEscolaFiltered = (filters.escola?.length ?? 0) > 0;

  const [dados, setDados] = useState({
    total_alunos: null,
    total_alunos_presentes: null,
    total_alunos_ausentes: null,
    //
    grid_ddz: [],
    grid_escolas: [],
    grid_turmas: [],
  });

  const grid = isEscolaFiltered
    ? dados.grid_turmas
    : isZonaFiltered
    ? dados.grid_escolas
    : dados.grid_ddz;

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
          (_filtersToSearch.anoLetivo != '' ? _filtersToSearch.anoLetivo : _.first(anosLetivos))
            ?.id,
        ],
        ddz: _filtersToSearch.zona.id ? [_filtersToSearch.zona.id] : [],
        escola: _filtersToSearch.escola.map((item) => item.id),
        turma: _.flatten(
          filters.anoEscolar.map((aE) => {
            return getTurmasPorAnoEscolar(aE);
          })
        ),
        laudo_necessidade: _filtersToSearch.pne == '-' ? '' : _filtersToSearch.pne,
        necessidades_especiais:
          _filtersToSearch.pne == '-' || _filtersToSearch.pneItem == '-'
            ? []
            : [`["${_filtersToSearch.pneItem}"]`],
      };

      await Promise.all([
        dashboardsMethods.getDashboardAvaliacaoDiagnostico(fullFilters).then((response) => {
          const result = Object.assign({}, response.data);

          // BEGIN adequação dos dados
          let _grid_escolas = Object.assign(
            {},
            _(result.grid_turmas)
              .groupBy((item) => item.escola_id)
              .value()
          );
          result.grid_escolas = [];

          _(_grid_escolas).forEach((turmasEscola, escola_id) => {
            result.grid_escolas.push({
              escola_id: _.first(turmasEscola).escola_id,
              escola_nome: _.first(turmasEscola).escola_nome,
              qtd_turmas: turmasEscola.length,
              qtd_alunos: _.sumBy(turmasEscola, (_turma) => _turma.qtd_alunos),
              turmas: turmasEscola,
            });
          });

          const _sorted = result.grid_ddz.sort((a, b) => {
            const na = preDefinedZonaOrder[a.zona_nome] ?? 0;
            const nb = preDefinedZonaOrder[b.zona_nome] ?? 0;
            return na - nb;
          });

          result.grid_ddz = _sorted;
          // END adequação dos dados

          setDados((prevState) => ({
            ...prevState,
            ...result,
          }));
        }),
      ]);

      isGettingGraphics.onFalse();
    },
    [filters, anosLetivos, getTurmasPorAnoEscolar, isGettingGraphics]
  );

  const handleFilters = useCallback(
    (campo, value) => {
      let _newFilters = filters;
      if (campo == 'zona') {
        if (value.length == 0) {
          setEscolasFiltered(escolas);
        } else {
          var escolasFiltered = escolas.filter((escola) => value.id == escola.zona.id);
          setEscolasFiltered(escolasFiltered);
        }

        _newFilters = { ...filters, ['escola']: [], [campo]: value };
        setFilters(_newFilters);
      } else {
        _newFilters = { ...filters, [campo]: value };
        setFilters(_newFilters);
      }
      return _newFilters;
    },
    [setFilters, setEscolasFiltered, escolas, filters]
  );

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
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
  }, [preparacaoInicialRunned, buscaAnosLetivos, buscaTurmas, contextReady]);

  useEffect(() => {
    if (contextReady.value) {
      const _filters = {
        ...filters,
        ...(anosLetivos && anosLetivos.length > 0 ? { anoLetivo: _.first(anosLetivos) } : {}),
      };

      setFilters(_filters);
      preencheGraficos(_filters);
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: _.first(anosLetivos),
      zona: [],
      escola: [],
      turma: [],
      anoEscolar: [],
      pne: '-',
      pneItem: '-',
    });
  };

  // TABLE GRID
  const TABLE_HEAD = [
    ...(isEscolaFiltered
      ? [
          { id: 'escolas', label: 'Escolas', notsortable: true },
          { id: 'turma', label: 'Turma', notsortable: true },
        ]
      : isZonaFiltered
      ? [
          { id: 'escolas', label: 'Escolas', notsortable: true },
          { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
        ]
      : [
          { id: 'ddz', label: 'DDZ', notsortable: true },
          { id: 'escolas', label: 'Escolas', width: 110, notsortable: true },
          { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
        ]),
    { id: 'estudantes', label: 'Estudantes', width: 110, notsortable: true },
    { id: 'presentes', label: 'Presentes', width: 110, notsortable: true },
    { id: 'ausentes', label: 'Ausentes', width: 110, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = { campo: '' };

  const table = useTable({ defaultRowsPerPage: 15 });

  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const dataFiltered = applyTableFilter({
    isZonaFiltered: isZonaFiltered,
    isEscolaFiltered: isEscolaFiltered,
    inputData: grid,
    comparator: getComparator(table.order, table.orderBy),
    filters: debouncedGridFilter,
  });

  const notFound = dataFiltered.length == 0;

  const handleTableFilters = useCallback(
    (nome, value) => {
      table.onResetPage();
      setTableFilters((prevState) => ({
        ...prevState,
        campo: value,
      }));
    },
    [table]
  );

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
            <Typography variant="h3">Dashboard: Avaliação Diagnóstica</Typography>
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
                <DashboardDiagnosticaTableToolbar
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
                      xs: '100%',
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
                    total={dados.total_alunos}
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
                    title="Estudantes Presentes"
                    total={dados.total_alunos_presentes ?? 0}
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
                    title="Estudantes Ausentes"
                    total={dados.total_alunos_ausentes ?? 0}
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

                <Grid xs={12}>
                  <Card sx={{ mt: 3, mb: 4 }}>
                    <CardHeader
                      title={isEscolaFiltered ? 'Turmas' : isZonaFiltered ? 'Escolas' : 'DDZs'}
                    />
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
                            rowCount={grid.length}
                            onSort={table.onSort}
                          />

                          <TableBody>
                            {Object.entries(
                              dataFiltered.slice(
                                table.page * table.rowsPerPage,
                                table.page * table.rowsPerPage + table.rowsPerPage
                              )
                            ).map(([key, row]) => (
                              <Row
                                key={`tableRowDash_${key}`}
                                row={{ ...row, key: key }}
                                isZonaFiltered={isZonaFiltered}
                                isEscolaFiltered={isEscolaFiltered}
                                filterOnClick={(id) => {
                                  if (isEscolaFiltered) {
                                    return false;
                                  } else if (isZonaFiltered) {
                                    const _filters = handleFilters(
                                      'escola',
                                      _.filter(escolas, (_escola) => _escola.id == id)
                                    );
                                    preencheGraficos(_filters);
                                  } else {
                                    const _filters = handleFilters(
                                      'zona',
                                      _.find(zonas, (_zona) => _zona.id == id)
                                    );
                                    preencheGraficos(_filters);
                                  }
                                }}
                              />
                            ))}

                            <TableEmptyRows
                              height={43}
                              emptyRows={emptyRows(table.page, table.rowsPerPage, grid.length)}
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

function applyTableFilter({ isZonaFiltered, isEscolaFiltered, inputData, comparator, filters }) {
  const { campo } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (campo) {
    if (isEscolaFiltered) {
      inputData = inputData.filter(
        (row) =>
          _.compact([
            row.escola_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1,
            `${row.turma_ano_escolar}${row.turma_nome}`
              .toLowerCase()
              .indexOf(campo.toLowerCase()) !== -1,
            row.escola_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1,
            `${row.turma_ano_escolar} ${row.turma_nome}`
              .toLowerCase()
              .indexOf(campo.toLowerCase()) !== -1,
            `${row.turma_ano_escolar}º ${row.turma_nome}`
              .toLowerCase()
              .indexOf(campo.toLowerCase()) !== -1,
          ]).length > 0
      );
    } else if (isZonaFiltered) {
      inputData = inputData.filter(
        (row) =>
          _.compact([row.escola_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1]).length > 0
      );
    } else {
      inputData = inputData.filter(
        (row) => row.zona_nome.toLowerCase().indexOf(campo.toLowerCase()) !== -1
      );
    }
  }

  return inputData;
}

// ----------------------------------------------------------------------
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  ':hover': {
    backgroundColor: theme.palette.action.focus,
  },
}));

function RowZona(props) {
  const { row, filterOnClick } = props;

  let _totalEntradaPresentes = 0;
  let _totalEntradaAusentes = 0;
  _.forEach(row.qtd_alunos_entrada.frequencias, (frequencia, keyN) => {
    if (['Presente'].includes(frequencia)) {
      _totalEntradaPresentes += row.qtd_alunos_entrada.total[keyN];
    }
    if (['Ausente'].includes(frequencia)) {
      _totalEntradaAusentes += row.qtd_alunos_entrada.total[keyN];
    }
  });

  let _totalSaidaPresentes = 0;
  let _totalSaidaAusentes = 0;
  _.forEach(row.qtd_alunos_saida.frequencias, (frequencia, keyN) => {
    if (['Presente'].includes(frequencia)) {
      _totalSaidaPresentes += row.qtd_alunos_saida.total[keyN];
    }
    if (['Ausente'].includes(frequencia)) {
      _totalSaidaAusentes += row.qtd_alunos_saida.total[keyN];
    }
  });

  const _totalPresentes = _totalSaidaPresentes > 0 ? _totalSaidaPresentes : _totalEntradaPresentes;
  const _totalAusentes = _totalSaidaAusentes > 0 ? _totalSaidaAusentes : _totalEntradaAusentes;

  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.zona_nome}</TableCell>
      <TableCell>{row.qtd_escolas ?? 0}</TableCell>
      <TableCell>{row.qtd_turmas ?? 0}</TableCell>
      <TableCell>{row.qtd_alunos ?? 0}</TableCell>
      <TableCell>{_totalPresentes ?? 0}</TableCell>
      <TableCell>{_totalAusentes ?? 0}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => filterOnClick(row.zona_id)}
        >
          Ver escolas
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}

function RowEscola(props) {
  const { row, filterOnClick } = props;

  let _totalEntradaPresentes = 0;
  let _totalEntradaAusentes = 0;

  let _totalSaidaPresentes = 0;
  let _totalSaidaAusentes = 0;

  _.forEach(row.turmas, (_turma) => {
    _.forEach(_turma.qtd_alunos_entrada.frequencias, (frequencia, keyN) => {
      if (['Presente'].includes(frequencia)) {
        _totalEntradaPresentes += _turma.qtd_alunos_entrada.total[keyN];
      }
      if (['Ausente'].includes(frequencia)) {
        _totalEntradaAusentes += _turma.qtd_alunos_entrada.total[keyN];
      }
    });

    _.forEach(_turma.qtd_alunos_saida.frequencias, (frequencia, keyN) => {
      if (['Presente'].includes(frequencia)) {
        _totalSaidaPresentes += _turma.qtd_alunos_saida.total[keyN];
      }
      if (['Ausente'].includes(frequencia)) {
        _totalSaidaAusentes += _turma.qtd_alunos_saida.total[keyN];
      }
    });
  });

  const _totalPresentes = _totalSaidaPresentes > 0 ? _totalSaidaPresentes : _totalEntradaPresentes;
  const _totalAusentes = _totalSaidaAusentes > 0 ? _totalSaidaAusentes : _totalEntradaAusentes;

  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.escola_nome}</TableCell>
      <TableCell>{row.qtd_turmas ?? 0}</TableCell>
      <TableCell>{row.qtd_alunos ?? 0}</TableCell>
      <TableCell>{_totalPresentes ?? 0}</TableCell>
      <TableCell>{_totalAusentes ?? 0}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => filterOnClick(row.escola_id)}
        >
          Ver turmas
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}

function RowTurma(props) {
  const { row } = props;

  let _totalEntradaPresentes = 0;
  let _totalEntradaAusentes = 0;
  _.forEach(row.qtd_alunos_entrada.frequencias, (frequencia, keyN) => {
    if (['Presente'].includes(frequencia)) {
      _totalEntradaPresentes += row.qtd_alunos_entrada.total[keyN];
    }
    if (['Ausente'].includes(frequencia)) {
      _totalEntradaAusentes += row.qtd_alunos_entrada.total[keyN];
    }
  });

  let _totalSaidaPresentes = 0;
  let _totalSaidaAusentes = 0;
  _.forEach(row.qtd_alunos_saida.frequencias, (frequencia, keyN) => {
    if (['Presente'].includes(frequencia)) {
      _totalSaidaPresentes += row.qtd_alunos_saida.total[keyN];
    }
    if (['Ausente'].includes(frequencia)) {
      _totalSaidaAusentes += row.qtd_alunos_saida.total[keyN];
    }
  });

  const _totalPresentes = _totalSaidaPresentes > 0 ? _totalSaidaPresentes : _totalEntradaPresentes;
  const _totalAusentes = _totalSaidaAusentes > 0 ? _totalSaidaAusentes : _totalEntradaAusentes;

  return (
    <StyledTableRow
      key={`tableStyledRowDash_${row.key}`}
      sx={{ '& > *': { borderBottom: 'unset' } }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.escola_nome}</TableCell>
      <TableCell>
        {row.turma_ano_escolar}º {row.turma_nome}
      </TableCell>
      <TableCell>{row.qtd_alunos ?? 0}</TableCell>
      <TableCell>{_totalPresentes ?? 0}</TableCell>
      <TableCell>{_totalAusentes ?? 0}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button
          component={RouterLink}
          color="primary"
          variant="contained"
          size="small"
          href={`${paths.dashboard.registro_aprendizagem.root_diagnostico}`}
        >
          Ver avaliações
        </Button>
      </TableCell>
    </StyledTableRow>
  );
}

function Row(props) {
  const { row, isZonaFiltered, isEscolaFiltered, filterOnClick } = props;

  if (isEscolaFiltered) {
    return (
      <RowTurma
        row={{ ...row }}
        isZonaFiltered={isZonaFiltered}
        isEscolaFiltered={isEscolaFiltered}
        filterOnClick={(id) => filterOnClick(id)}
      />
    );
  } else if (isZonaFiltered) {
    return <RowEscola row={{ ...row }} filterOnClick={(id) => filterOnClick(id)} />;
  } else {
    return <RowZona row={{ ...row }} filterOnClick={(id) => filterOnClick(id)} />;
  }
}
