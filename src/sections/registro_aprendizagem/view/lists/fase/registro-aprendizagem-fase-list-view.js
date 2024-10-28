'use client';

import { useEffect, useState, useCallback } from 'react';
import { first } from 'lodash';

// @mui
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useContext } from 'react';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { TurmasContext } from 'src/sections/turma/context/turma-context';
import { BimestresContext } from 'src/sections/bimestre/context/bimestre-context';
import { useAuthContext } from 'src/auth/hooks';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import RegistroAprendizagemFaseTableRow from './registro-aprendizagem-fase-table-row';
import RegistroAprendizagemTableToolbar from '../registro-aprendizagem-table-toolbar';
import NovaAvaliacaoForm from 'src/sections/registro_aprendizagem/registro-aprendizagem-modal-form';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import LoadingBox from 'src/components/helpers/loading-box';
import { escolas_piloto } from 'src/_mock';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ano_letivo', label: 'Ano Letivo', width: 75 },
  { id: 'ano_escolar', label: 'Ano de Ensino', width: 75 },
  { id: 'turma', label: 'Turma', width: 75 },
  { id: 'turno', label: 'Turno', width: 105 },
  { id: 'bimestre', label: 'Bimestre', width: 80 },
  { id: 'escola', label: 'Escola' },
  { id: 'atualizado_por', label: 'Atualizado Por' },
  { id: '', width: 72 },
];

const defaultFilters = {
  anoLetivo: '',
  escola: [],
  turma: [],
  bimestre: [],
};

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseListView() {
  const { checkPermissaoModulo } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable();

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const [countAcompanhamentos, setCountAcompanhamentos] = useState(0);
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);
  const { bimestres, buscaBimestres } = useContext(BimestresContext);
  const contextReady = useBoolean(false);

  const permissaoCadastrar = checkPermissaoModulo("registro_aprendizagem", "cadastrar");
  const permissaoSuperAdmin = checkPermissaoModulo('superadmin', 'upload');


  const [filters, setFilters] = useState(defaultFilters);
  const [turmasFiltered, setTurmasFiltered] = useState([]);
  const [tableData, setTableData] = useState([]);
  const tabelaPreparada = useBoolean(false);
  const buscando = useBoolean(false);
  
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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

  const closeUploadModal = () => {
    setOpenUploadModal(false);
  }

  const handleFileUpload = (event) => {
    setUploadedFile(event.target.files[0]);
  }

  const uploadAvaliacoes = async () => {
    try {
      const formData = new FormData();
      formData.append('arquivo', uploadedFile);

      const response = await registroAprendizagemMethods.importFileFase(formData);

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
      buscaBimestres().catch((error) => {
        setErrorMsg('Erro de comunicação com a API de bimestres');
      }),
    ]).finally(() => {
      contextReady.onTrue();
    });
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas, buscaBimestres]);

  useEffect(() => {
    preparacaoInicial();
  }, []); // CHAMADA UNICA AO ABRIR

  useEffect(() => {
    if (contextReady.value) {
      const _filters = {};

      if (anosLetivos.length) _filters.anoLetivo = anosLetivos.length ? first(anosLetivos) : '' ?? '';
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

      if (_filters.anoLetivo) {
        buscarAvaliacoes(table.page, table.rowsPerPage)
      }
    }
  }, [contextReady.value]);

  const buscarAvaliacoes = useCallback(async (pagina = 0, linhasPorPagina = 25, prevList = [], filtros = filters) => {
    if (contextReady.value && anosLetivos.length && turmas.length && bimestres.length) {
      // setTableData([]);
      setWarningMsg('');
      setErrorMsg('');
      tabelaPreparada.onFalse();
      buscando.onTrue();

      const offset = pagina * linhasPorPagina;
      const limit = linhasPorPagina;
      let escola = [];
      // if (filtros.escola.length > 0) {
      //   filtros.escola.map((esc) => {
      //     escola.push(esc.id)
      //   })
      // }

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
        turmas: (filtros.turma.length ? filtros.turma : turmasFiltered).map((turma) => turma.id),
        bimestres: (filtros.bimestre.length ? filtros.bimestre : bimestres).map(
          (bimestre) => bimestre.id
          ),
        offset:offset,
        limit:limit,
        ano_letivos: filtros.anoLetivo ? [filtros.anoLetivo.id] : [],
        escolas: escola,
      };
        
      const _newList = [];

      await registroAprendizagemMethods
        .getListIdTurmaRegistroAprendizagemFase(_filtersToSend)
        .then((_turmasComRegistros) => {
          _turmasComRegistros.data.results.forEach((registro) => {
            const _turma = turmas.find((turma) => turma.id == registro.turma_id);
            if (_turma?.id) {
              const _bimestre = bimestres.find((bimestre) => bimestre.id == registro.bimestre_id);
              _newList.push({
                id: _turma.id,
                ano_letivo: anosLetivos.find((a) => a.id == _turma.ano_id).ano,
                ano_escolar: _turma.ano_escolar,
                nome: _turma.nome,
                turno: _turma.turno,
                alunos: registro.qtd_aluno_turma,
                bimestre: _bimestre,
                escola: escolas.find((e) => e.id == _turma.escola_id).nome,
                atualizado_por: registro.atualizado_por != 'None' ? registro.atualizado_por : '',
              });
            }
          });
          setTableData([...prevList, ..._newList]);
          setCountAcompanhamentos(_turmasComRegistros.data.count);
          tabelaPreparada.onTrue();
          buscando.onFalse();
        })
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API de registro aprendizagem fase');
          buscando.onFalse();
        });

      
    }
  }, [contextReady, anosLetivos, turmas, bimestres, filters]);

  useEffect(() => {
    const idsEscolas = filters.escola.map(escola => escola.id);
    const _turmasFiltered = turmas.filter((turma) => idsEscolas.includes(turma.escola_id));
    setTurmasFiltered(_turmasFiltered);
  }, [filters.escola]);

  const dataInPage = tableData.slice(
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
    (turmaInicial, bimestreInicial) => {
      router.push(paths.dashboard.registro_aprendizagem.edit_fase(turmaInicial, bimestreInicial));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    (turmaId, bimestreId) => {
      const deleteRow = tableData.find((row) => row.id == turmaId && row.bimestre.id == bimestreId);
      if (!deleteRow) {
        setWarningMsg('Linha a ser deletada não encontrada');
        return;
      }
      const remainingRows = tableData.filter(
        (row) => row.id !== turmaId || row.bimestre.id !== bimestreId
      );
      registroAprendizagemMethods
        .deleteRegistroAprendizagemByFilter({
          tipo: 'fase',
          turmaId: turmaId,
          bimestreId: bimestreId,
        }).then(
          contextReady.onFalse(),
          buscando.onFalse(),
          tabelaPreparada.onFalse(),
          setTableData([]),
          setTimeout(preparacaoInicial, 1000),
        )
        .catch((error) => {
          setErrorMsg('Erro de comunicação com a API no momento de deletar o registro');
          throw error;
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Typography variant="h4">
        Acompanhamento de Fases do Desenvolvimento da Leitura e da Escrita
        </Typography>
        {permissaoCadastrar &&
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
        }
        {permissaoSuperAdmin && (
            <Button
              onClick={() => setOpenUploadModal(true)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: '#EE6C4D',
              }}
            >
              Importar Avaliações
            </Button>
          )}
      </Stack>

      <NovaAvaliacaoForm
        open={novaAvaliacao.value}
        onClose={closeNovaAvaliacao}
        initialTipo="Acompanhamento de Fase"
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
            bimestreOptions={turmasFiltered.length ? bimestres : null}
            export_type="fase"
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
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            {(!contextReady.value || buscando.value) && <LoadingBox />}

            {contextReady.value && tabelaPreparada.value && (
              <Table size='small' sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <RegistroAprendizagemFaseTableRow
                      key={`RegistroAprendizagemFaseTableRow_${row.id}_${row.bimestre.id}`}
                      row={row}
                      onEditRow={() => handleEditRow(row.id, row.bimestre.id)}
                      onDeleteRow={() => handleDeleteRow(row.id, row.bimestre.id)}
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
      <Modal open={openUploadModal} onClose={closeUploadModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Upload Arquivo (xlsx ou csv)</Typography>
          <input type="file" 
            onChange={handleFileUpload} 
          />
          <Button variant="contained" onClick={uploadAvaliacoes}>Upload</Button>
        </Box>
      </Modal>
    </Container>
  );
}
