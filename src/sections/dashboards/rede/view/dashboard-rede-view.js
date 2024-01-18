'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import _, { sum } from 'lodash';

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
import { useRouter } from 'src/routes/hook';
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


export default function DashboardRedeView() {
  const ICON_SIZE = 65;

  const theme = useTheme();
  const settings = useSettingsContext();

  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  const contextReady = useBoolean(false);
  const preparacaoInicialRunned = useBoolean(false);
  const isGettingGraphics = useBoolean(false);

  const [filters, setFilters] = useState({
    anoLetivo: '',
  });

  const [dados, setDados] = useState({
    total_usuarios_ativos: {},
    total_alunos_ativos: {},
    //
    grid_ddz: [],
    desempenho_alunos: {},
  });

  const preencheGraficos = async () => {
    isGettingGraphics.onTrue();
    const fullFilters = {
      ano_letivo: [(filters.anoLetivo != '' ? filters.anoLetivo : first(anosLetivos)).id],
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
      dashboardsMethods.getDashboardGridRede(fullFilters).then((response) => {
        let result = response.data.map((i) => ({
          ...i,
          alunos: i.qtd_alunos,
          avaliados: Array.isArray(i.qtd_avaliados) ? sum(i.qtd_avaliados) : i.qtd_avaliados,
          alfabetizados: Array.isArray(i.qtd_alfabetizado)
            ? sum(i.qtd_alfabetizado)
            : i.qtd_alfabetizado,
          nao_alfabetizados: i.qtd_nao_alfabetizado,
          deixou_de_frequentar: i.qtd_nao_avaliado,
        }));

        setDados((prevState) => ({
          ...prevState,
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

  const preparacaoInicial = useCallback(() => {
    if (!preparacaoInicialRunned.value) {
      console.log('preparacaoInicial');
      preparacaoInicialRunned.onTrue();
      Promise.all([buscaAnosLetivos()
       ]).then(() => {
        contextReady.onTrue();
      });
    }
  }, [preparacaoInicialRunned, anosLetivos]);

  useEffect(() => {
    preparacaoInicial(); // chamada unica
  }, [preparacaoInicial]);

  useEffect(() => {
    if (contextReady.value) {
      setFilters((prevState) => ({
        ...prevState,
        ...(anosLetivos && anosLetivos.length ? { anoLetivo: first(anosLetivos) } : {}),
      }));
      
      preencheGraficos();
    }
  }, [contextReady.value]); // CHAMADA SEMPRE QUE ESTES MUDAREM

  useEffect(() => {
    setFilters({
      anoLetivo: '',
    });
  }, []);

  const filtroReset = () => {
    setFilters({
      anoLetivo: first(anosLetivos),
    });
  };

  // TABLE GRID
  const router = useRouter();
  const TABLE_HEAD = [
    { id: 'ddz', label: 'DDZ', notsortable: true },
    { id: 'escolae', label: 'Escolas', notsortable: true },
    { id: 'turmas', label: 'Turmas', width: 110, notsortable: true },
    { id: 'alunos', label: 'Alunos', width: 110, notsortable: true },
    { id: 'avaliados', label: 'Alunos avaliados', width: 110, notsortable: true },
    { id: 'alfabetizados', label: 'Alfabetizados', width: 110, notsortable: true },
    { id: 'nao_alfabetizados', label: 'Não alfabetizados', width: 110, notsortable: true },
    { id: 'deixou_de_frequentar', label: 'Deixou de frequentar', width: 110, notsortable: true },
    { id: '', width: 88, notsortable: true },
  ];

  const defaultTableFilters = {
    zona: '',
  };

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

  const reduceAlfabetizacaoGeral = function () {
    return {
      hasSeries: true,
      categories: [
        {
          series: [
            {
              name: 'Alfabetizado',
              amount: dados.grid_ddz.reduce((acc, i) => acc + sum(i.qtd_alfabetizado), 0),
            },
            {
              name: 'Não alfabetizado',
              amount: dados.grid_ddz.reduce((acc, i) => acc + i.qtd_nao_alfabetizado, 0),
            },
            {
              name: 'Deixou de frequentar',
              amount: dados.grid_ddz.reduce((acc, i) => acc + i.qtd_nao_avaliado, 0),
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
            <Typography variant="h3">Dashboard (Rede)</Typography>
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
              <DashboardRedeTableToolbar
                filters={filters}
                onFilters={handleFilters}
                anoLetivoOptions={anosLetivos}
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
              title="por DDZ"
              indice_alfabetizacao={[
                ...dados.grid_ddz.map((e) => {
                  return {
                    ...e,
                    title: e.zona_nome,
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
        <Card sx={{ mb: 4 }}>
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
    <>
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
    </>
  );
}
