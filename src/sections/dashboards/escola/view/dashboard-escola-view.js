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

import { first } from 'lodash';

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

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);
  const [zonaFiltro, setZonaFiltro] = useState([]);
  const [escolaFiltro, setEscolaFiltro] = useState([]);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: [],
    escola: [],
  });

  const [dados, setDados] = useState({
    total_usuarios_ativos: {},
    total_alunos_ativos: {},
    //
    grid_professores: [],
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
        ddz: _filtersToSearch.zona.map((item) => item.id),
        escola: _filtersToSearch.escola.map((item) => item.id),
      };

      await Promise.all([
        dashboardsMethods.getDashboardTotalUsuariosAtivos(fullFilters).then((response) => {
          setDados((prevState) => ({
            ...prevState,
            total_usuarios_ativos: response.data,
          }));
        }),
        dashboardsMethods.getDashboardTotalAlunosAtivos(fullFilters).then((response) => {
          setDados((prevState) => ({
            ...prevState,
            total_alunos_ativos: response.data,
          }));
        }),

        //
        dashboardsMethods.getDashboardGridProfessores(fullFilters).then((response) => {
          // adequação dos dados

          setDados((prevState) => ({
            ...prevState,
            grid_professores: response.data.map((i) => ({
              ...i,
              alunos: i.qtd_alunos,
              avaliados: Array.isArray(i.qtd_avaliados) ? sum(i.qtd_avaliados) : i.qtd_avaliados,
              alfabetizados: Array.isArray(i.qtd_alfabetizado)
                ? sum(i.qtd_alfabetizado)
                : i.qtd_alfabetizado,
              nao_alfabetizados: i.qtd_nao_alfabetizado,
              deixou_de_frequentar: i.qtd_nao_avaliado,
            })),
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
    [dados, filters, anosLetivos, zonas, escolas, contextReady.value]
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
      ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [preparacaoInicialRunned, anosLetivos, zonas, escolas]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, [preparacaoInicial]);

  useEffect(() => {
    if (contextReady.value) {
      let _escola = escolas.filter((e) => e.id == initialEscola);

      let _filters = {
        ...filters,
        ...(_escola.length > 0 ? { escola: _escola } : {}),
        ...(zonaFiltro.length && _escola.length == 0
          ? {}
          : { zona: zonas.filter((z) => z.id == _escola[0]?.zona.id) ?? filters.zona }),
        ...(anosLetivos && anosLetivos.length ? { anoLetivo: first(anosLetivos) } : {}),
      };
      setFilters(_filters);
      preencheGraficos(_filters);
    }
  }, [contextReady.value, zonaFiltro, escolaFiltro, escolas]); // CHAMADA SEMPRE QUE ESTES MUDAREM

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
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: first(anosLetivos),
      zona: zonaFiltro,
      escola: [],
    });
  };

  // TABLE GRID
  const router = useRouter();
  const TABLE_HEAD = [
    { id: 'professor', label: 'Professor', notsortable: true },
    { id: 'ano_escolar', label: 'Ano', width: 110, notsortable: true },
    { id: 'turma_nome', label: 'Turma', width: 110, notsortable: true },
    { id: 'turno', label: 'Turno', width: 110, notsortable: true },
    { id: 'alunos', label: 'Alunos', width: 110, notsortable: true },
    { id: 'avaliados', label: 'Alunos avaliados', width: 110, notsortable: true },
    { id: 'alfabetizados', label: 'Alfabetizados', width: 110, notsortable: true },
    { id: 'nao_alfabetizados', label: 'Não alfabetizados', width: 110, notsortable: true },
    { id: 'deixou_de_frequentar', label: 'Deixou de frequentar', width: 110, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = {
    professor: '',
  };

  const table = useTable({ defaultRowsPerPage: 15 });

  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const dataFiltered = applyTableFilter({
    inputData: dados.grid_professores,
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
              amount: dados.grid_professores.reduce((acc, i) => acc + i.alfabetizados, 0),
            },
            {
              name: 'Não alfabetizado',
              amount: dados.grid_professores.reduce((acc, i) => acc + i.nao_alfabetizados, 0),
            },
            {
              name: 'Deixou de frequentar',
              amount: dados.grid_professores.reduce((acc, i) => acc + i.deixou_de_frequentar, 0),
            },
          ],
        },
      ],
    };
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
            <Typography variant="h3">Dashboard (Escola)</Typography>
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
              <DashboardEscolaTableToolbar
                filters={filters}
                onFilters={handleFilters}
                anoLetivoOptions={anosLetivos}
                ddzOptions={zonas}
                escolaOptions={_escolasFiltered || escolas}
              />
            </Grid>
            <Grid xs={12} md="auto">
              <Button variant="contained" onClick={() => { preencheGraficos(); }}>
                Aplicar filtros
              </Button>

              <Button variant="soft" onClick={filtroReset} sx={{ margin: { left: 4 } }}>
                Limpar
              </Button>
            </Grid>
          </Stack>

          <Grid xs={12} md={4}>
            <NumeroComponent
              title="Total de Usuários Ativos"
              total={dados.total_usuarios_ativos.total}
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
              total={dados.total_alunos_ativos.total}
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
          <Grid xs={12} md={4} alignSelf="">
            <MetaComponent title="Meta" total={76}></MetaComponent>
          </Grid>

          {!!isGettingGraphics.value && (
            <Grid flexGrow={1} flexBasis={0} sx={{ mt: 2 }} display="flex">
              <LoadingBox />
            </Grid>
          )}

          {!isGettingGraphics.value && (
            <IndicesCompostosAlfabetizacaoGeralWidget
              title="por turma"
              indice_alfabetizacao={[
                ...dados.grid_professores.map((e) => {
                  return {
                    ...e,
                    title: `${e.turma_ano_escolar} ${e.turma_nome}`,
                    indice_alfabetizacao:
                      e.avaliados > 0
                        ? Number(`${((e.alfabetizados / e.avaliados) * 100).toFixed(0)}`)
                        : e.avaliados,
                  };
                }),
              ]}
              indice_alfabetizacao_geral={reduceAlfabetizacaoGeral()}
            />
          )}
        </Grid>

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

      {!isGettingGraphics.value && (
        <Card sx={{ mt: 3, mb:4 }}>
          <CardHeader title="Professores" />
          <DashboardGridFilters filters={tableFilters} onFilters={handleTableFilters} />

          <TableContainer sx={{ mt: 1, height: 500 }}>
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 960 }} aria-label="collapsible table">
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dados.grid_professores.length}
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
                      table.rowsePrPage,
                      dados.grid_professores.length
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.professor}</TableCell>
        <TableCell>{row.turma_ano_escolar}º</TableCell>
        <TableCell>{row.turma_nome}</TableCell>
        <TableCell>{row.turma_turno}</TableCell>
        <TableCell>{row.alunos}</TableCell>
        <TableCell>{row.avaliados}</TableCell>
        <TableCell>{row.alfabetizados}</TableCell>
        <TableCell>{row.nao_alfabetizados}</TableCell>
        <TableCell>{row.deixou_de_frequentar}</TableCell>
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
    </>
  );
}
