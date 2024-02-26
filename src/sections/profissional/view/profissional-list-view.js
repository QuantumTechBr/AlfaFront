'use client';

import isEqual from 'lodash/isEqual';
import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
import ProfissionalTableRow from '../profissional-table-row';
import ProfissionalTableToolbar from '../profissional-table-toolbar';
import ProfissionalTableFiltersResult from '../profissional-table-filters-result';
import profissionalMethods from '../profissional-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import userMethods from 'src/sections/user/user-repository';
import LoadingBox from 'src/components/helpers/loading-box';

// ----------------------------------------------------------------------


const TABLE_HEAD = [
  { id: 'profissional', label: 'Profissional', width: 300 },
  { id: 'email', label: 'E-Mail', width: 200 },
  { id: 'funcao', label: 'Função', width: 100 },
  { id: 'escola', label: 'Escola', width: 100 },
  { id: 'zona', label: 'DDZ', width: 100 },
  { id: 'turma', label: 'turma?', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  nome: '',
  escola: [],
  role: [],
};

// ----------------------------------------------------------------------

export default function ProfissionalListView() {

  const [_profissionalList, setProfissionalList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [countProfissionais, setCountProfissionais] = useState(0);
  const preparado = useBoolean(false);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const contextReady = useBoolean(false);
  const [filters, setFilters] = useState(defaultFilters);

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);


  const buscaProfissionais = useCallback(async (pagina=0, linhasPorPagina=25, oldProfissionalList=[], filtros=filters) => {
    setWarningMsg('');
    setErrorMsg('');
    contextReady.onFalse();
    const offset = (pagina)*linhasPorPagina;
    const limit = linhasPorPagina;
    const {nome, escola, role} = filtros;
    
    await profissionalMethods.getAllProfissionaisPaginado({offset, limit, nome: nome, escolas: escola, funcao: role, }).then(async profissionais => {
      if (profissionais.data.count == 0) {
        setWarningMsg('A API retornou uma lista vazia de profissionais');
        contextReady.onTrue();
        preparado.onTrue();
      } else {
        const pros = profissionais.data.results;

        for (var i = 0; i < pros.length; i++) {
          const funcao = [];
          const zona = [];
          const escola = [];
          if(pros[i].funcao_usuario?.length > 0 ){
            for (let index = 0; index < pros[i].funcao_usuario.length; index++) {  
              funcao.push(pros[i].funcao_usuario[index].funcao?.id);
              escola.push(pros[i].funcao_usuario[index].escola?.id);
              zona.push(pros[i].funcao_usuario[index].zona?.id);
            }
            pros[i].funcao = funcao[0] ? funcao[0] : '';
            pros[i].escola = escola ? escola : '';
            pros[i].zona = zona[0] ? zona[0] : '';
          } else {
            pros[i].funcao = '';
            pros[i].escola = '';
            pros[i].zona = '';
          }
          pros[i].status = pros[i].status.toString();
        }

        setProfissionalList([...oldProfissionalList, ...pros]);
        setTableData([...oldProfissionalList, ...pros]);   
        // const listaProfissionais = profissionais.data.results;
        // setProfissionalList([...oldProfissionalList, ...listaProfissionais]);
        // setTableData([...oldProfissionalList, ...listaProfissionais]);
        contextReady.onTrue();
      }
      setCountProfissionais(profissionais.data.count);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de profissionais');
      console.log(error);
      contextReady.onTrue();
      preparado.onTrue();
    });
  }, [contextReady, filters]);

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
        preparado.onTrue(); 
      }),
      buscaFuncoes().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de funções');
        preparado.onTrue();
      }),
      buscaProfissionais(table.page, table.rowsPerPage).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de profissinais');
        console.log(error);
      })
    ]);
    contextReady.onTrue();
    preparado.onTrue();
  }, [buscaEscolas, buscaProfissionais, contextReady, table.page, table.rowsPerPage]);

  const onChangePage = async (event, newPage) => {
    if (_profissionalList.length < (newPage+1)*table.rowsPerPage) {
      buscaProfissionais(newPage, table.rowsPerPage, _profissionalList);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback((event) => {
    table.setPage(0);
    table.setRowsPerPage(parseInt(event.target.value, 10));
    setProfissionalList([]);
    setTableData([]);
    buscaProfissionais(0, event.target.value);
  }, [buscaProfissionais, table]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  // useEffect(() => {
  //   profissionalMethods.getAllProfissionais().then(profissionais => {
  //     if (profissionais.data.length == 0) {
  //       setWarningMsg('A API retornou uma lista vazia de profissionais');
  //       preparado.onTrue(); 
  //     }
  //     const pros = profissionais.data;

  //     for (var i = 0; i < pros.length; i++) {
  //       const funcao = [];
  //       const zona = [];
  //       const escola = [];
  //       if(pros[i].funcao_usuario?.length > 0 ){
  //         for (let index = 0; index < pros[i].funcao_usuario.length; index++) {  
  //           funcao.push(pros[i].funcao_usuario[index].funcao?.id);
  //           escola.push(pros[i].funcao_usuario[index].escola?.id);
  //           zona.push(pros[i].funcao_usuario[index].zona?.id);
  //         }
  //         pros[i].funcao = funcao[0] ? funcao[0] : '';
  //         pros[i].escola = escola ? escola : '';
  //         pros[i].zona = zona[0] ? zona[0] : '';
  //       } else {
  //         pros[i].funcao = '';
  //         pros[i].escola = '';
  //         pros[i].zona = '';
  //       }
  //       pros[i].status = pros[i].status.toString();
  //     }

  //     setProfissionalList(pros);
  //     setTableData(pros);   
  //     preparado.onTrue();  
  //   }).catch((error) => {
  //     setErrorMsg('Erro de comunicação com a API de profissionais');
  //     preparado.onTrue(); 
  //   })
  //   buscaEscolas().catch((error) => {
  //     setErrorMsg('Erro de comunicação com a API de escolas');
  //     preparado.onTrue(); 
  //   });
  //   buscaFuncoes().catch((error) => {
  //     setErrorMsg('Erro de comunicação com a API de funções');
  //     preparado.onTrue(); 
  // });

  // profissionalMethods.getAllProfissionaisPaginado({offset: 0, limit: 200}).then((profissionais) => {
  //   console.log(profissionais)
  // })
  // }, []);


  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilters = useCallback(
    async (nome, value) => {
      table.onResetPage();
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
      setTableData([]);
      setProfissionalList([]);
      buscaProfissionais(table.page, table.rowsPerPage, [], novosFiltros);
    },
    [table, filters, buscaProfissionais]
  );


  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      userMethods.deleteUserById(id).then(retorno => {
        setTableData(deleteRow);
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de usuários no momento da exclusão do profissional');
      });

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const remainingRows = [];
    const promises = [];
    tableData.map((row) => {
      if(table.selected.includes(row.id)) {
        const newPromise = userMethods.deleteUserById(row.id).catch((error) => {
          remainingRows.push(row);
          setErrorMsg('Erro de comunicação com a API de usuários no momento da exclusão do profissional');
          throw error;
        });
        promises.push(newPromise)
      } else {
        remainingRows.push(row);
      }
    });
    Promise.all(promises).then(
      retorno => {
        setTableData(remainingRows);
      }
    )

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: tableData.length,
    });
  }, [dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.profissional.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      nome: '',
      escola: [],
      role: [],
    };
    setTableData([]);
    setProfissionalList([]);
    setFilters(resetFilters);
    buscaProfissionais(table.page, table.rowsPerPage);

  }, [buscaProfissionais, table.page, table.rowsPerPage]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Listar"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Profissionais', href: paths.dashboard.profissional.root },
            { name: 'Listar' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.profissional.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: "#00A5AD",
              }}
            >
              Adicionar
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}

        <Card>

          <ProfissionalTableToolbar
            filters={filters}
            onFilters={handleFilters}
            roleOptions={funcoes}
            escolaOptions={escolas}
          />

          {canReset && (
            <ProfissionalTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={tableData.length}
              roleOptions={funcoes}
              escolaOptions={escolas}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
            {!preparado.value ? (
                <LoadingBox />
                ) : (
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {tableData
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ProfissionalTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table> )}
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={countProfissionais}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> profissionais?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { nome, role, escola } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (user) => user.profissional.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user?.funcao));
  }

  if (escola.length) {
    inputData = inputData.filter((user) => escola.includes(user?.escola));
  }

  return inputData;
}
