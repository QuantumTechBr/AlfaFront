'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

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

// components
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
import { useRouter } from 'src/routes/hook';
import { useDebounce } from 'src/hooks/use-debounce';

import { first, last } from 'lodash';

// ----------------------------------------------------------------------
import DashboardDDZTableToolbar from './dashboard-ddz-table-toolbar';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
import dashboardsMethods from 'src/sections/overview/dashboards-repository';

//
import NumeroComponent from '../../components/numero-component';
import DesempenhoAlunosWidget from '../../components/desempenho-alunos-widget';
import MetaComponent from '../../components/meta-component';
import IndicesCompostosAlfabetizacaoGeralWidget from '../../widgets/indices-compostos-alfabetizacao-geral-widget';
import DashboardGridFilters from '../../components/dashboard-grid-filter';

//
import { paths } from 'src/routes/paths';
import Scrollbar from 'src/components/scrollbar';

export default function DashboardDDZView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);
  const [zonaFiltro, setZonaFiltro] = useState([]);

  const [filters, setFilters] = useState({
    anoLetivo: '',
    zona: zonaFiltro,
  });

  const [dados, setDados] = useState({
    total_usuarios_ativos: {},
    total_alunos_ativos: {},
    //
    grid_escolas: [],
    desempenho_alunos: {},
  });

  const preencheGraficos = async () => {
    isGettingGraphics.onTrue();
    const fullFilters = {
      ano_letivo: [(filters.anoLetivo != '' ? filters.anoLetivo : first(anosLetivos)).id],
      ddz: filters.zona.map((item) => item.id),
    };

    await Promise.all([
      dashboardsMethods
        .getDashboardTotalUsuariosAtivos({
          ano_letivo: fullFilters.ano_letivo,
          ddz: fullFilters.ddz,
          escola: fullFilters.escola,
        })
        .then((response) => {
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
      dashboardsMethods
        .getDashboardGridEscolas({
          ...fullFilters,
        })
        .then((response) => {
          setDados((prevState) => ({
            ...prevState,
            grid_escolas: response.data,
          }));
          setTableData(response.data);
        }),

      // ## DESEMPENHO ALUNO
      dashboardsMethods
        .getDashboardDesempenhoAlunos({ ano_letivo: fullFilters.ano_letivo, ddz: fullFilters.ddz })
        .then((response) => {
          setDados((prevState) => ({
            ...prevState,
            desempenho_alunos: response.data,
          }));
        }),
    ]);

    isGettingGraphics.onFalse();
  };

  const handleFilters = useCallback(
    (campo, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [campo]: value,
      }));
    },
    [setFilters]
  );

  const preparacaoInicial = async () => {
    if (preparacaoInicialRunned.value === false) {
      preparacaoInicialRunned.onTrue();
      await Promise.all([buscaAnosLetivos(), buscaZonas()]);
      contextReady.onTrue();
    }
  };

  preparacaoInicial(); // chamada unica

  useEffect(() => {
    if (contextReady.value) {
      preencheGraficos();

      if (anosLetivos && anosLetivos.length) {
        setFilters((prevState) => ({
          ...prevState,
          anoLetivo: first(anosLetivos),
        }));
      }
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    let _zonaFiltro = [];
    if (user?.funcao_usuario?.length > 0) {
      if (user?.funcao_usuario[0]?.funcao?.nome == 'ASSESSOR DDZ') {
        _zonaFiltro = [user?.funcao_usuario[0]?.zona];
      } else {
        _zonaFiltro = [user?.funcao_usuario[0]?.escola?.zona];
      }
    }
    setZonaFiltro(_zonaFiltro);
    setFilters({
      anoLetivo: '',
      zona: _zonaFiltro,
    });
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: first(anosLetivos),
      zona: zonaFiltro,
    });
  };

  const novaAvaliacao = useBoolean();
  const closeNovaAvaliacao = (retorno = null) => {
    novaAvaliacao.onFalse();
  };

  // TABLE
  const router = useRouter();
  const TABLE_HEAD = [
    { id: 'escola', label: 'Escola', notsortable: true },
    { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
    { id: 'Alunos', label: 'Alunos', width: 110, notsortable: true },
    { id: 'avaliados', label: 'Alunos avaliados', width: 110, notsortable: true },
    { id: 'alfabetizados', label: 'Alfabetizados', width: 110, notsortable: true },
    { id: 'nao_alfabetizados', label: 'Não alfabetizados', width: 110, notsortable: true },
    { id: 'deixou_de_frequentar', label: 'Deixou de frequentar', width: 110, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = {
    escola: '',
  };

  const table = useTable({ defaultRowsPerPage: 15 });
  const [tableData, setTableData] = useState([]);
  const [tableFilters, setTableFilters] = useState(defaultTableFilters);

  const debouncedGridFilter = useDebounce(tableFilters, 380);

  const dataFiltered = applyTableFilter({
    inputData: tableData,
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

          <Grid xs={12} md="auto">
            <Button
              variant="contained"
              color="primary"
              onClick={novaAvaliacao.onTrue}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Registro de Aprendizagem
            </Button>
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
              <Button variant="contained" onClick={preencheGraficos}>
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
              percents={dados.total_usuarios_ativos.percent}
              total={dados.total_usuarios_ativos.total}
              chart={{
                series: dados.total_usuarios_ativos.chart ?? [],
              }}
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
              percent={dados.total_alunos_ativos.percent}
              total={dados.total_alunos_ativos.total}
              chart={{
                colors: [theme.palette.info.light, theme.palette.info.main],
                series: dados.total_alunos_ativos.chart?.series ?? [],
              }}
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
              title="DDZ"
              indice_alfabetizacao={{}}
              indice_alfabetizacao_geral={{}}
            />
          )}
        </Grid>

        {!isGettingGraphics.value && (dados.desempenho_alunos.chart?.series ?? []).length > 0 && (
          <Grid xs={12}>
            <DesempenhoAlunosWidget
              title="Desempenho dos Estudantes"
              subheader={dados.desempenho_alunos.subheader}
              chart={dados.desempenho_alunos.chart ?? { categories: [], series: [] }}
            />
          </Grid>
        )}
      </Grid>

      <NovaAvaliacaoForm open={novaAvaliacao.value} onClose={closeNovaAvaliacao} />

      <Card sx={{ my: 4, }}>
        <CardHeader title="Escolas" />
        <DashboardGridFilters filters={tableFilters} onFilters={handleTableFilters} />

        <TableContainer sx={{ mt: 1 ,  height:500 }}>
          <Scrollbar>
            <Table size="small" sx={{ minWidth: 960, }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                onSort={table.onSort}
              />

              <TableBody>
                {Object.entries(
                  dataFiltered.slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                ).map(([key, row]) => (
                  <StyledTableRow key={`tableRowDash_${key}`}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.escola_nome}</TableCell>
                    <TableCell>{row.qtd_alfabetizado}</TableCell>
                    <TableCell>{row.qtd_alunos}</TableCell>
                    <TableCell>{row.qtd_avaliados}</TableCell>
                    <TableCell>{row.qtd_nao_alfabetizado}</TableCell>
                    <TableCell>{row.qtd_nao_avaliado}</TableCell>
                    <TableCell>{row.turma_ano_escolar}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        onClick={() => {
                          router.push(`${paths.dashboard.root}/dash-escola`);
                        }}
                      >
                        Ver mais
                      </Button>
                    </TableCell>

                    {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.turma_nome}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.turma_turno}</TableCell> */}
                  </StyledTableRow>
                ))}

                <TableEmptyRows
                  height={43}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
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
