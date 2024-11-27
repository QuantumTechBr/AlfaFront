'use client';

import { useEffect, useState, useCallback } from 'react';
import { first } from 'lodash';

// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { useAuthContext } from 'src/auth/hooks';

// _mock
import { _anos, _periodos } from 'src/_mock';

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
import { escolas_piloto } from 'src/_mock';
import ImportHelperButton from 'src/components/helpers/import-helper-button';
import { CSVLink } from "react-csv";
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano_letivo', label: 'Ano Letivo', width: 75 },
  { id: 'ano_escolar', label: 'Ano de Ensino', width: 75 },
  { id: 'nome', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'periodo', label: 'Perfil', width: 105 },
  { id: 'escola_nome', label: 'Escola' },
  { id: 'atualizado_por', label: 'Atualizado Por' },
  { id: '', width: 72 },
];

const defaultFilters = {
  ano: '',
  escola: [],
  turma: [],
  periodo: [],
  pesquisa: '',
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoListView() {
  const { user, checkPermissaoModulo } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable();
  const popover = usePopover();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [countAcompanhamentos, setCountAcompanhamentos] = useState(0);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const [uploadedFile, setUploadedFile] = useState(null);
  const contextReady = useBoolean(false);
  const [csvTurmaData, setCsvTurmaData] = useState([]);
  const [csvTurmaFileName, setCsvTurmaFileName] = useState('');
  const [csvEscolaData, setCsvEscolaData] = useState([]);
  const [csvEscolaFileName, setCsvEscolaFileName] = useState('');
  const permissaoCadastrar = checkPermissaoModulo('registro_aprendizagem', 'cadastrar');
  const permissaoSuperAdmin = checkPermissaoModulo('superadmin', 'upload');
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();

  const [filters, setFilters] = useState(defaultFilters);
  const [turmasFiltered, setTurmasFiltered] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const tabelaPreparada = useBoolean(false);
  const buscando = useBoolean(false);
  const buscandoCSV = useBoolean(false);
  const closeUploadModal = () => {
    setOpenUploadModal(false);
  }

  const modalStyle = {
    position: 'absolute',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

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
      const _filters = filters;

      if (anosLetivos.length > 0) {
        anosLetivos.map((ano)=>{
          
          if (ano.ano == anoAtual) {
            _filters.ano = ano.id;
          }
        })
      }
      if (escolas.length && escolas.length == 1) {
        _filters.escola = escolas.length ? [{
          label: escolas[0].nome,
          id: escolas[0].id,
        }] : [] ?? [];
      }

      setFilters((prevState) => ({
        ...prevState,
        ..._filters,
      }));

      if (_filters.ano) {
        buscarAvaliacoes(table.page, table.rowsPerPage, [], _filters);
      }
    }
  }, [contextReady.value]);

  const buscarAvaliacoes = useCallback(async (pagina = 0, linhasPorPagina = 25, prevList = [], filtros = filters) => {
    if (contextReady.value && anosLetivos.length && turmas.length) {
      // setTableData([]);
      setWarningMsg('');
      setErrorMsg('');
      tabelaPreparada.onFalse();
      buscando.onTrue();

      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;

      let escola = [];
      if (filtros.escola.length > 0) {
        filtros.escola.map((esc) => {
          escola.push(esc.id)
        })
      }

      let escFiltered = [];
      if (escola.length == 0 && sessionStorage.getItem('escolasPiloto') == 'true') {
        escolas.map((esc) => {
          if (escolas_piloto.includes(esc.nome)) {
            escFiltered.push(esc.id);
          }
        })
      }
      if (escFiltered.length > 0) {
        escola = escFiltered;
      }

      const _filtersToSend = {
        turmas: (filters.turma.length ? filters.turma : turmasFiltered).map((turma) => turma.id),
        periodo: filters.periodo.length ? filters.periodo : _periodos,
        offset: offset,
        limit: limit,
        ano: filtros.ano ? filtros.ano : '',
        escolas: escola,
      };

      const _newList = [];

      // ENTRADA E SAÍDA
      await registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemDiagnostico(_filtersToSend)
        .then((response) => {
          if (response.data?.results.length) {
            response.data.results.forEach((registro) => {
              const turma = turmas.find((turma) => turma.id == registro.turma_id);
              if (turma?.id) {
                const retorno = { ...turma };
                retorno.periodo = registro.periodo;
                retorno.escola_nome = escolas.find((escola) => escola.id == turma.escola_id).nome;
                retorno.ano_letivo = anosLetivos.find((ano) => ano.id == turma.ano_id).ano;
                retorno.atualizado_por = registro.atualizado_por;

                _newList.push(retorno);
              }
            });
            setTableData([...prevList, ..._newList]);
            setCountAcompanhamentos(response.data.count);
            tabelaPreparada.onTrue();
            buscando.onFalse()
          }
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de Registro Aprendizagem Diagnostico de Entrada');
          buscando.onFalse()
          console.error(error);
        });
      buscando.onFalse();
    }
  }, [contextReady, anosLetivos, turmas, filters, _periodos]);

  const buscarAvaliacoesCSV = useCallback(async (por, filtros = filters) => {
    if (anosLetivos.length && turmas.length) {
      setWarningMsg('O seu arquivo está sendo gerado. Dependendo do número de registros, isso pode levar alguns minutos. ' +
        'Para uma resposta mais rápida, tente filtrar menos registros. ' +
        'Quando o processo for concluído, um email será enviado com o arquivo em anexo para ' + user.email + 
        ' e essa mensagem irá sumir. Enquanto isso, você pode continuar utilizando o sistema normalmente.'
      );	
      setErrorMsg('');
      buscandoCSV.onTrue();

      let escola = [];
      if (filtros.escola.length > 0) {
        filtros.escola.map((esc) => {
          escola.push(esc.id)
        })
      }

      let escFiltered = [];
      if (escola.length == 0 && sessionStorage.getItem('escolasPiloto') == 'true') {
        escolas.map((esc) => {
          if (escolas_piloto.includes(esc.nome)) {
            escFiltered.push(esc.id);
          }
        })
      }
      if (escFiltered.length > 0) {
        escola = escFiltered;
      }

      const _filtersToSend = {
        tipo: "Diagnóstico",
        turma: (filters.turma.length ? filters.turma : turmasFiltered).map((turma) => turma.id),
        periodo: filters.periodo.length ? filters.periodo : _periodos,
        ano: filtros.anoLetivo ? filtros.anoLetivo.id : "",
        escola: escola,
      };

      if(por == 'turma') {
        await registroAprendizagemMethods
          .getRelatorioAvaliacaoPorTurma(_filtersToSend)
          .then((result) => {
            setWarningMsg('Arquivo enviado com sucesso para o email ' + user.email);
            buscandoCSV.onFalse();
          })
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de registro aprendizagem diagnóstico');
            buscandoCSV.onFalse();
          });
      } else if (por == 'escola') {
        await registroAprendizagemMethods
          .getRelatorioAvaliacaoPorEscola(_filtersToSend)
          .then((result) => {
            setWarningMsg('Arquivo enviado com sucesso para o email ' + user.email);
            buscandoCSV.onFalse();
          })
          .catch((error) => {
            setErrorMsg('Erro de comunicação com a API de registro aprendizagem diagnóstico');
            buscandoCSV.onFalse();
          });
      }
    }
  }, [anosLetivos, turmas, filters, _periodos]);

  useEffect(() => {
    const idsEscolas = filters.escola.map(escola => escola.id);
    const _turmasFiltered = turmas.filter((turma) => idsEscolas.includes(turma.escola_id));
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
        .then(
          contextReady.onFalse(),
          buscando.onFalse(),
          tabelaPreparada.onFalse(),
          setTableData([]),
          setTimeout(preparacaoInicial, 1000),
        )
        .catch((error) => {
          setErrorMsg(
            'Erro de comunicação com a API de registros aprendizagem no momento da exclusão do registro'
          );
        });

    },
    [dataInPage.length, table, tableData, preparacaoInicial]
  );

  const novaAvaliacao = useBoolean();

  const closeNovaAvaliacao = () => {
    novaAvaliacao.onFalse();
  };

  const onChangePage = async (event, newPage) => {
    if (tableData.length < (newPage + 1) * table.rowsPerPage) {
      buscarAvaliacoes(newPage, table.rowsPerPage, tableData);
    }
    table.setPage(newPage);
  };

  const onChangeRowsPerPage = useCallback(
    (event) => {
      table.setPage(0);
      table.setRowsPerPage(parseInt(event.target.value, 10));
      setTableData([]);
      buscarAvaliacoes(0, event.target.value);
    },
    [buscarAvaliacoes, table]
  );

  const uploadAvaliacoes = async () => {
    try {
      const formData = new FormData();

      closeUploadModal();

      setWarningMsg('Enviando arquivo. Por favor, aguarde... ' +
        'O processo de importação pode demorar alguns minutos e até mesmo horas dependendo do número de registros a serem validados. ' +
        'Você pode acompanhar o status do processo pelo painel do Django Admin. Por favor, evite iniciar vários processos de importação simultaneamente. ' +
        'Isso pode gerar lentidão no sistema e até mesmo inconsistência de dados.'
      );

      const response = await registroAprendizagemMethods.importFileDiagnostico(formData);

      if (response.ok) {
        // File uploaded successfully
        console.log('File uploaded successfully');
      } else {
        // Error uploading file
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  const handleFileUpload = (event) => {
    setUploadedFile(event.target.files[0]);
  }


  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
       
          <CustomBreadcrumbs
          heading="Acompanhamento Diagnóstico"
          links={[
            { name: '' },
          ]}
          action= {permissaoCadastrar && (
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
          youtubeLink="https://www.youtube.com/embed/fxgNcBmSqYQ?si=ZgvKKXdEZpmjb2ik&cc_load_policy=1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {permissaoSuperAdmin && (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={() => setOpenUploadModal(true)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#EE6C4D',
                marginBottom: "1em"
              }}
            >
              Importar Acompanhamentos de Diagnóstico
            </Button>
            <ImportHelperButton
              ordemImportacao='escola -> turma -> aluno e usuário -> acompanhamento'
              nomeTela='ACOMPANHAMENTO DE DIAGNOSTICO'
              linkDownload={'/modelos-de-importacao/modelo-importacao-acompanhamento-diagnostico.xlsx'}
            />
          </Box>

        )}
        <NovaAvaliacaoForm
          open={novaAvaliacao.value}
          onClose={closeNovaAvaliacao}
          initialTipo="Acompanhamento Diagnóstico"
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
              escolaOptions={escolas}
              turmaOptions={turmasFiltered.length ? turmasFiltered : null}
              periodoOptions={_periodos}
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
              onClick={() => {
                setTableData([]);
                table.setPage(0);
                buscarAvaliacoes(table.page, table.rowsPerPage, []);
              }}
            >
              Aplicar filtros
            </Button>

            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill"/>
          </IconButton>

          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="left-top"
            // sx={{ width: 200 }}
          >

            {(buscandoCSV.value) &&
              <LoadingBox
                sx={{ pt: 0.3, pl: 2.5 }}
                texto="Gerando CSV... Você receberá um email com o arquivo em anexo."
              />
            }
            {(!buscandoCSV.value) &&
              <>
                <MenuItem
                  onClick={() => {
                    buscarAvaliacoesCSV('turma');
                  }}
                >
                  <Iconify icon="material-symbols:download" />
                  <Button className='downloadCSVFilterBtn'>
                    Relatório por turmas
                  </Button>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    buscarAvaliacoesCSV('escola');
                  }}
                >
                  <Iconify icon="material-symbols:download" />
                  <Button className='downloadCSVFilterBtn'>
                    Relatório por escolas
                  </Button>
                </MenuItem>
              </>
            }


          </CustomPopover>
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
            count={countAcompanhamentos}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Card>
      </Container>
      <Modal open={openUploadModal} onClose={closeUploadModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Upload Arquivo (xlsx ou csv)</Typography>
          <input type="file"
            onChange={handleFileUpload}
          />
          <Button variant="contained" onClick={uploadAvaliacoes}>Upload</Button>
        </Box>
      </Modal>
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
