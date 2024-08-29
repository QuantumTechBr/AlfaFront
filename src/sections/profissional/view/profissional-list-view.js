'use client';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import ProfissionalTableRow from '../profissional-table-row';
import ProfissionalTableToolbar from '../profissional-table-toolbar';
import profissionalMethods from '../profissional-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import userMethods from 'src/sections/user/user-repository';
import LoadingBox from 'src/components/helpers/loading-box';
// auth
import { useAuthContext } from 'src/auth/hooks';
import ProfissionalQuickEditForm from '../profissional-quick-edit-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'profissional', label: 'Profissional', notsortable: true },
  { id: 'email', label: 'E-Mail', width: 200, notsortable: true },
  { id: 'funcao', label: 'Função', width: 100, notsortable: true },
  { id: 'escola', label: 'Escola', width: 100, notsortable: true },
  { id: 'zona', label: 'DDZ', width: 100, notsortable: true },
  { id: 'turma', label: 'turma?', width: 100, notsortable: true },
  { id: '', width: 88, notsortable: true },
];

const defaultFilters = {
  nome: '',
  escola: [],
  role: [],
};

// ----------------------------------------------------------------------

export default function ProfissionalListView() {
  const { checkPermissaoModulo } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [countProfissionais, setCountProfissionais] = useState(0);
  const preparado = useBoolean(false);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const [filters, setFilters] = useState(defaultFilters);

  const permissaoCadastrar = checkPermissaoModulo('profissionais', 'cadastrar');

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const quickEdit = useBoolean();
  const [rowToEdit, setRowToEdit] = useState();

  const [tableData, setTableData] = useState([]);

  const buscaProfissionais = useCallback(
    async (pagina = 0, linhasPorPagina = 25, oldProfissionalList = [], filtros = filters) => {
      preparado.onFalse();
      setWarningMsg('');
      setErrorMsg('');
      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      const { nome, escola, role } = filtros;

      await profissionalMethods
        .getAllProfissionaisPaginado({ offset, limit, nome: nome, escolas: escola, funcao: role })
        .then(async (profissionais) => {
          if (profissionais.data.count == 0) {
            setWarningMsg('A API retornou uma lista vazia de profissionais');
            setTableData([]);
            preparado.onTrue();
          } else {
            const pros = profissionais.data.results;

            for (var i = 0; i < pros.length; i++) {
              const funcao = [];
              const zona = [];
              const proEscola = [];
              if (pros[i].funcao_usuario?.length > 0) {
                for (let index = 0; index < pros[i].funcao_usuario.length; index++) {
                  funcao.push(pros[i].funcao_usuario[index].funcao?.id);
                  proEscola.push(pros[i].funcao_usuario[index].escola?.id);
                  zona.push(pros[i].funcao_usuario[index].zona?.id);
                }
                pros[i].funcao = funcao[0] ? funcao[0] : '';
                pros[i].escola = proEscola ? proEscola : '';
                pros[i].zona = zona[0] ? zona[0] : '';
              } else {
                pros[i].funcao = '';
                pros[i].escola = '';
                pros[i].zona = '';
              }
              pros[i].status = pros[i].status.toString();
            }

            setTableData([...oldProfissionalList, ...pros]);
            preparado.onTrue();
          }
          setCountProfissionais(profissionais.data.count);
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de profissionais');
          console.log(error);
        });
    },
    [preparado, filters]
  );

  const preparacaoInicial = useCallback(async () => {
    await Promise.all([
      buscaEscolas().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de escolas');
      }),
      buscaFuncoes().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de funções');
      }),
      buscaProfissionais(table.page, table.rowsPerPage).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de profissinais');
        console.log(error);
      }),
    ]);
    preparado.onTrue();
  }, [buscaEscolas, buscaFuncoes, buscaProfissionais]);

  const onChangePage = async (event, newPage) => {
    if (tableData.length < (newPage + 1) * table.rowsPerPage) {
      buscaProfissionais(newPage, table.rowsPerPage, tableData);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback(
    (event) => {
      table.setPage(0);
      table.setRowsPerPage(parseInt(event.target.value, 10));
      setTableData([]);
      buscaProfissionais(0, event.target.value);
    },
    [buscaProfissionais, table]
  );

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  const dataInPage = tableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !tableData.length;

  const handleFilters = useCallback(
    async (nome, value) => {
      table.onResetPage();
      const novosFiltros = {
        ...filters,
        [nome]: value,
      };
      setFilters(novosFiltros);
    },
    [table, filters]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      userMethods
        .deleteUserById(id)
        .then((retorno) => {
          preparado.onFalse()
          setTableData([]);
          setTimeout(preparacaoInicial, 1000);
        })
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de usuários no momento da exclusão do profissional'
          );
        });

      // table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.profissional.edit(id));
    },
    [router]
  );

  const handleSaveRow = useCallback(
    (novosDados) => {
      const _tableData = tableData.map((item) => {
        if (item.id === novosDados.id) {
          return { ...item, ...novosDados };
        }
        return item;
      });
      setTableData(_tableData);
    },
    [tableData]
  );

  const saveAndClose = (retorno = null) => {
    handleSaveRow({ ...rowToEdit, ...retorno });
    quickEdit.onFalse();
  };

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      nome: '',
      escola: [],
      role: [],
    };
    setTableData([]);
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
            permissaoCadastrar && (
              <Button
                component={RouterLink}
                href={paths.dashboard.profissional.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{
                  bgcolor: '#00A5AD',
                }}
              >
                Adicionar
              </Button>
            )
          }
          youtubeLink="https://www.youtube.com/embed/GI5MDRzXaFA?si=UQDtn79OfRtiTn1r"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
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
            <ProfissionalTableToolbar
              filters={filters}
              onFilters={handleFilters}
              roleOptions={funcoes}
              escolaOptions={escolas}
            />

            <Button
              variant="contained"
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
              onClick={() => {
                preparado.onFalse();
                setTableData([]);
                table.setPage(0);
                buscaProfissionais(table.page, table.rowsPerPage, [], filters);
              }}
            >
              Aplicar filtros
            </Button>
          </Stack>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              {!preparado.value ? (
                <LoadingBox texto="Buscando profissionais" />
              ) : (
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
                      <ProfissionalTableRow
                        key={row.id}
                        row={row}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        quickEdit={() => {
                          quickEdit.onTrue();
                          setRowToEdit(row);
                        }}
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
            count={countProfissionais}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>

      {checkPermissaoModulo('profissionais', 'editar') && (
        <ProfissionalQuickEditForm
          row={rowToEdit}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onSave={saveAndClose}
        />
      )}
    </>
  );
}
