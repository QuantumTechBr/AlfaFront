import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// import sortBy from 'lodash/sortby';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import TableBody from '@mui/material/TableBody';

// components
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useDebounce } from 'src/hooks/use-debounce';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import Scrollbar from 'src/components/scrollbar';
import AlunoEscolaTableRow from './components/aluno-escola-table-row';
import LoadingBox from 'src/components/helpers/loading-box';
import alunoMethods from './../aluno/aluno-repository';
import escolaMethods from './escola-repository';
import Typography from '@mui/material/Typography';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CollectionsBookmarkOutlined } from '@mui/icons-material';
import { width } from '@mui/system';
import { Grid } from '@mui/material';
import { set, values } from 'lodash';

// ----------------------------------------------------------------------

export default function AlunoEscolaForm({ escola, open, onClose }) {
  const applyFilter = ({ inputData, query }) => {
    if (query) {
      inputData = inputData.filter(
        (item) =>
          item.nome.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          item.matricula.toLowerCase().indexOf(query.toLowerCase()) !== -1
      );
    }

    return inputData;
  };

  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable();
  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);
  const [allAlunos, setAllAlunos] = useState();
  const [alunos, setAlunos] = useState([]);
  const [searchAlunosInput, setSearchAlunosInput] = useState('');
  const [buscaAlu, setBuscaAlu] = useState('');
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [anoLetivoId, setAnoLetivoId] = useState();

  const getAluno = (pesquisa = '') => {
    setErrorMsg('');
    alunoMethods.getAlunoDiretor({ offset: 0, limit: 10, pesquisa: pesquisa }).then(response => {
      const auto_complete_aluno = []
      response.data.results.map((aluno) => {
        const al = {
          label: aluno.nome + ' - ' + aluno.matricula,
          id: aluno.id,
        }
        auto_complete_aluno.push(al)
      });
      setAlunos(auto_complete_aluno);
      setAllAlunos(response.data.results);
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de alunos');
    });
  }

  const methods = useForm({});

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      setAllAlunos();
      // getAllAlunos(escola.id);
      buscaAnosLetivos().then(() => {
        const idAnoLetivoAtual = anosLetivos.find((ano) => ano.status === "NÃO FINALIZADO")?.id;
        setAnoLetivoId(idAnoLetivoAtual);
        getAluno();
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de anos letivos');
      });
    }
  }, [open, buscaAnosLetivos]);

  const onSearchAlunos = useCallback((event) => {
    setSearchAlunosInput(event.target.value);
  }, []);

  const TABLE_HEAD = [
    { id: 'nome', label: 'Estudante', width: 2 },
    { id: 'matricula', label: 'Matrícula', width: 3 },
    { id: 'adicionar', label: 'Adicionar', width: 2 },
    { id: 'remover', label: 'Remover', width: 2 },
  ];

  

  const isLoading = allAlunos === undefined || allAlunos === null;

  const handleAlunos = (newInputValue) => {
    let novoAlunos = alunosSelecionados.filter((alu) => alu?.id != newInputValue?.id);
    if (novoAlunos.length == alunosSelecionados.length) {
      novoAlunos.push(allAlunos?.filter((al) => al?.id == newInputValue?.id)[0]);
    }
    setAlunosSelecionados(novoAlunos);
    setValue("alunos", newInputValue)
  }

  const handleAdicionarAluno = useCallback(
    (aluno) => {
      setErrorMsg('');
      const anoId = getValues('ano_letivo');
      const alunoEscola = [{ aluno_id: aluno?.id, ano_id: anoId }];
      try {
        escolaMethods.updateAlunoEscolaByEscolaId(escola?.id, alunoEscola)
        .then((retorno) => {
          enqueueSnackbar('Atualizado com sucesso!')
          const alunosSelecionados2 = alunosSelecionados.map((aluSel) => {
            if (aluSel?.id == aluno?.id) {
              aluSel.alunoEscolas.push(retorno.data);
            }
            return aluSel;
          });
          const alunos2 = alunos.map((alu) => {
            if (alu?.id == aluno?.id) {
              alu.alunoEscolas.push(retorno.data);
            }
            return alu;
          });
          setAlunosSelecionados(alunosSelecionados2);
          setAlunos(alunos2);
        }).catch((error) => {
          setErrorMsg('Erro de comunicação com a API de escolas');
          console.error(error);
          
        });
        // setAlunosSelecionados([]);
        // setAlunos([]);
      } catch (error) {
        setErrorMsg('Tentativa de atualização de alunos da escola falhou');
        console.error(error);
      }
    },
    [escola, anosLetivos]
  );

  const handleRemoverAluno = useCallback(
    (aluno) => {
      const anoId = getValues('ano_letivo');
      const alunoEscolaId = aluno?.alunoEscolas?.filter((ae) => ae?.ano?.id == anoId && ae?.escola?.id == escola?.id)[0]?.id;
      try {
        escolaMethods.deleteAlunosByEscolaId(escola?.id, alunoEscolaId)
        .then((retorno) => {
          enqueueSnackbar('Atualizado com sucesso!')
          const alunosSelecionados2 = alunosSelecionados.map((aluSel) => {
            if (aluSel?.id == aluno?.id) { 
              aluSel.alunoEscolas = aluSel.alunoEscolas.filter((ae) => ae?.id != alunoEscolaId);
            }
            return aluSel;
          });
          const alunos2 = alunos.map((alu) => {
            if (alu?.id == aluno?.id) {
              alu.alunoEscolas = alu.alunoEscolas.filter((ae) => ae?.id != alunoEscolaId);
            }
            return alu;
          });
          setAlunosSelecionados(alunosSelecionados2);
          setAlunos(alunos2);
          // setAlunosSelecionados([]);
          // setAlunos([]);
        }).catch((error) => {
          setErrorMsg('Erro de comunicação com a API de escolas: ' + error.toString());
        });
        
      } catch (error) {
        setErrorMsg('Tentativa de atualização de alunos da escola falhou');
        console.error(error);
      }
    },
    [escola]
  );

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 800 },
      }}
    >
      <FormProvider methods={methods}>
        {isLoading ? (
          <Box sx={{ pt: 2 }}>
              <LoadingBox />
            </Box>
        ) : (
          <>
            <DialogTitle>Definir Estudantes da Escola: {escola?.nome}</DialogTitle>
            <DialogContent>
              {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Controller
                    name="ano_letivo"
                    control={control}
                    defaultValue={anoLetivoId}
                    render={({ field }) => (
                      <RHFSelect
                        name="ano_letivo"s
                        label="Ano Letivo"
                        sx = {{ mt: 1}}
                        onChange={(e) => {
                          field.onChange(e);
                          setAnoLetivoId(e.target.value);
                        }}
                      >
                        {anosLetivos 
                        .map((ano) => (
                          <MenuItem key={ano.id} value={ano.id}>
                            {ano.ano}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    )}
                  />
                </Grid>

                <Grid item xs={9}>
                  <Controller
                    name="alunos"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        onChange={(event, newInputValue) => {
                          handleAlunos(newInputValue)}
                        }
                        value={buscaAlu}
                        options={alunos}
                        noOptionsText="Nenhum aluno encontrado"
                        filterOptions={(x) => x}
                        sx={{
                          mt: 1, mb: 1
                        }}
                        onInputChange={(event, newInputValue) => {
                            setBuscaAlu(newInputValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.code === "Enter") {
                            e.preventDefault()
                            getAluno(buscaAlu)
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Nome/Matrícula"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search"
                                    onClick={() => {
                                      getAluno(buscaAlu)
                                    }
                                    }
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}

                          />

                          
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>



              <Scrollbar sx={{ width: '100%', height: 'calc(100vh - 320px)' }}>
                <Table size="small" sx={{ width: '100%' }}>
                  <TableHeadCustom
                    order="asc"
                    orderBy="nome"
                    headLabel={TABLE_HEAD}
                    rowCount={allAlunos?.length}
                    numSelected={table.selected.length}
                  />
                  <TableBody>
                    {alunosSelecionados?.map((row) => (
                      row &&
                      <AlunoEscolaTableRow
                        key={`AlunoEscolaTableRow_${row.id}`}
                        row={row}
                        allAlunos={allAlunos}
                        currentEscola={escola}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onAdicionarAluno={() => handleAdicionarAluno(row)}
                        onRemoverAluno={() => handleRemoverAluno(row)}
                        selectedAnoLetivoId={anoLetivoId}
                      />
                    ))}

                    <TableNoData notFound={false} />
                  </TableBody>
                </Table>
                {!buscaAlu &&
                  <Typography sx={{ mt: 2}} variant="subtitle2">Busque o aluno por nome ou matrícula</Typography>
                }
              </Scrollbar>

            </DialogContent>
          </>
        )} 

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

AlunoEscolaForm.propTypes = {
  turma: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
