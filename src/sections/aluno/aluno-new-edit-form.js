import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import Tooltip from '@mui/material/Tooltip';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFMultiSelect
} from 'src/components/hook-form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import alunoMethods from './aluno-repository';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';
import Alert from '@mui/material/Alert';
import { EscolasContext } from '../escola/context/escola-context';
import { TurmasContext } from '../turma/context/turma-context';
import { AuthContext } from 'src/auth/context/alfa';
import { useBoolean } from 'src/hooks/use-boolean';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
// _mock
import { necessidades_especiais } from 'src/_mock';
import AlunoEscolaTurmaAnoTableRow from './aluno-escola-turma-ano-table-row';
import AlunoEscolaTurmaAnoEditModal from './aluno-escola-turma-ano-edit-modal';
import escolaMethods from '../escola/escola-repository';
import turmaMethods from '../turma/turma-repository';
import { TireRepair } from '@mui/icons-material';



// ----------------------------------------------------------------------

export default function AlunoNewEditForm({ currentAluno }) {
  const { user } = useContext(AuthContext);
  const { anosLetivos, buscaAnosLetivos, buscaAnoLetivo } = useContext(AnosLetivosContext);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const { escolas, buscaEscolas, buscaEscola } = useContext(EscolasContext);
  const { turmas, buscaTurmas, buscaTurma } = useContext(TurmasContext);
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const [tableData, setTableData] = useState([]);
  const [mapEscolaInicial, setMapEscolaInicial] = useState([]);
  const necessidades_options = necessidades_especiais.map(ne => {
    return { value: ne, label: ne }
  })
  const edit = useBoolean(false);
  const alunoNascimento = useMemo(() => {
    if (currentAluno) {
      return parseISO(currentAluno.data_nascimento);
    }
    return null;
  }, [currentAluno]);
  const [rowToEdit, setRowToEdit] = useState();
  const NewAlunoSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    matricula: Yup.string().required('Matrícula é obrigatório'),
    data_nascimento: Yup.date().required('Data de Nascimento é obrigatório'),
  });

  const anoAtual = new Date().getFullYear();

  const podeAdicionarEscola = () => {
    return tableData?.length < anosLetivos.length
  }

  const botaoLabel = () => {
    return (
      <Tooltip
        title={podeAdicionarEscola() ? 'Adicionar Escola' : "Aluno só pode estar em uma escola e turma por ano letivo."}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: '#d3d3d3', 
              color: '#333',
              boxShadow: 1,
              fontSize: '0.875rem',
              textAlign: 'center', 
            },
          },
          arrow: {
            sx: {
              color: '#d3d3d3', 
            },
          },
        }}
      >
        <Box>
          <Button
            variant="contained"
            disabled={!podeAdicionarEscola()}
            onClick={() => {
              edit.onTrue();
              setRowToEdit();
            }}
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: '#00A5AD',
            }}
          >
            Escola
          </Button>
        </Box>
      </Tooltip>
    );
  }

  const TABLE_HEAD = [
    { id: 'escola', label: 'Escola', width: 400, notsortable: true },
    { id: 'turma', label: 'Turma', width: 100, notsortable: true },
    { id: 'ano_letivo', label: 'Ano Letivo', width: 100, notsortable: true },
    { id: '', label: botaoLabel(), width: 88 },
  ];

  const defaultValues = useMemo(
    () => ({
      nome: currentAluno?.nome || '',
      matricula: currentAluno?.matricula || '',
      data_nascimento: alunoNascimento,
      necessidades_especiais: currentAluno?.necessidades_especiais ? JSON.parse(currentAluno.necessidades_especiais) : [],
      laudo: currentAluno?.laudo_necessidade ? currentAluno?.laudo_necessidade : 'false'
    }),
    [currentAluno, alunoNascimento]
  );

  const methods = useForm({
    resolver: yupResolver(NewAlunoSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const anoLetivoAtual = anosLetivos.find((ano) => {
        if (ano.ano == anoAtual) {
          return ano.id;
        }
      })
      // let aluno_escolas = []
      // let aluno_turmas = []
      // if (!currentAluno && data.escola != '') {
      //   aluno_escolas = [
      //     {
      //       escola_id: data.escola,
      //       ano_id: anoLetivoAtual.id ?? anoLetivoAtual[0].id
      //     }
      //   ]
      // }
      // if (!currentAluno && data.turma) {
      //   aluno_turmas = [
      //     {
      //       turma_id: data.turma
      //     }
      //   ]
      // }
      const nascimento = new Date(data.data_nascimento)
      const necessidades_especiais_data = JSON.stringify(data.necessidades_especiais);
      const toSend = {
        nome: data.nome,
        matricula: data.matricula.toString(),
        data_nascimento: nascimento.getFullYear() + "-" + (nascimento.getMonth() + 1) + "-" + nascimento.getDate(),
        necessidades_especiais: necessidades_especiais_data,
        laudo_necessidade: data.necessidades_especiais == [] ? 'false' : data.laudo,
        // alunoEscolas: aluno_escolas,
        // alunos_turmas: aluno_turmas
      }
      if (currentAluno) {
        await alunoMethods.updateAlunoById(currentAluno.id, toSend).then((retorno) => {
          buscaTurmas({ force: true });
          const alunoNovo = retorno.data ?? {};
          if (alunoNovo?.id) {
            router.push(paths.dashboard.aluno.edit(alunoNovo ? alunoNovo.id : ''));
          } else {
            router.push(paths.dashboard.aluno.list);
          }
        }).catch((error) => {
          throw error;
        });

      } else {
        await alunoMethods.insertAluno(toSend).then((retorno) => {
          buscaTurmas({ force: true });
          const alunoNovo = retorno.data ?? {};
          if (alunoNovo?.id) {
            router.push(paths.dashboard.aluno.edit(alunoNovo ? alunoNovo.id : ''));
          } else {
            router.push(paths.dashboard.aluno.list);
          }
        }).catch((error) => {
          throw error;
        });
      }
      enqueueSnackbar(currentAluno ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      // router.push(paths.dashboard.aluno.list);
    } catch (error) {
      currentAluno ? setErrorMsg('Tentativa de atualização do estudante falhou') : setErrorMsg('Tentativa de criação do estudante falhou');
      console.error(error);
    }
  });

  useEffect(() => {
    reset(defaultValues)
  }, [currentAluno, defaultValues, reset]);

  useEffect(() => {
    console.log(currentAluno)
    const data = []
    const map_escola_data = [];

    if (anosLetivos.length > 0) {
      anosLetivos.map((ano) => {
        let escola = {}
        let turma = {}
        let id = ''
        let id_aluno_escola = ''
        if (currentAluno?.alunoEscolas?.length > 0) {
          escola = currentAluno.alunoEscolas.find((alunoEscola) => alunoEscola.ano.id == ano.id)?.escola ?? {}
          id_aluno_escola = currentAluno.alunoEscolas.find((alunoEscola) => alunoEscola.ano.id == ano.id)?.id ?? ''
        }
        if (currentAluno?.alunos_turmas?.length > 0) {
          turma = currentAluno.alunos_turmas.find((alunoTurma) => alunoTurma.turma?.ano?.id == ano.id)?.turma ?? {}
          id = currentAluno.alunos_turmas.find((alunoTurma) => alunoTurma.turma?.ano?.id == ano.id)?.id ?? ''
        }
        if (id != '' || id_aluno_escola != '') {
          map_escola_data.push({escola_id: escola.id, ano_id: ano.id})
          data.push({
            id: id,
            id_aluno_escola: id_aluno_escola,
            ano_letivo: ano,
            escola: escola,
            turma: turma,
          })

        }
      })

    }
    setMapEscolaInicial(map_escola_data);
    setTableData(data);
  }, [currentAluno]);

  useEffect(() => {
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaTurmas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
    });
    buscaAnosLetivos().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de anos letivos');
    });
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas]);

  const handleDeleteRow = useCallback(
    (row) => {
      const deleteRow = tableData.filter((linha) => linha.id !== row.id);
      if (row.id_aluno_escola != '') {
        try {
          escolaMethods.deleteAlunosByEscolaId(row.escola.id, row.id_aluno_escola);
          enqueueSnackbar('Atualizado com sucesso!');
        } catch (error) {
          setErrorMsg('Tentativa de atualização de alunos da escola falhou');
          console.error(error);
        }
      }
      if (row.id != '') {
        try {
          turmaMethods.deleteAlunoTurmaById(row.id);
          enqueueSnackbar('Atualizado com sucesso!');
        } catch (error) {
          setErrorMsg('Tentativa de atualização de alunos da escola falhou');
          console.error(error);
        }
      }

      setTableData(deleteRow);
      const novoMapEscola = mapEscolaInicial.filter((map) => {
        return map.escola_id != row.escola.id || map.ano_id != row.ano_letivo.id
      })
      setMapEscolaInicial(novoMapEscola);
    },
    [tableData]
  );

  const handleSaveRow = useCallback(
    (novosDados) => {
      const _tableData = tableData.map((item) => {
        if (item.id === novosDados.id || item.id_aluno_escola === novosDados.id_aluno_escola) {
          return { ...item, ...novosDados };
        }
        return item;
      });
      let novaLinha = {
        id: novosDados.id,
        id_aluno_escola: novosDados.id_aluno_escola,
        ano_letivo: novosDados.ano_letivo,
        escola: novosDados.escola,
        turma: novosDados.turma,
      }
      const alunoEscola = novosDados.ano_letivo?.id ? [{ aluno_id: currentAluno.id, ano_id: novosDados.ano_letivo.id }] : [];
      const alunoTurma = novosDados.turma?.id ? { aluno_id: currentAluno.id, turma_id: novosDados.turma.id } : {};
      try {
        let promises = [];
        if (novosDados.escola?.id) {
          let escolaMudou = true;
          mapEscolaInicial.map((ei) => {
            if (ei.escola_id == novosDados.escola.id && ei.ano_id == novosDados.ano_letivo?.id ) {
              escolaMudou = false;
            }
          });
          if (escolaMudou) {
            promises.push(
              escolaMethods.updateAlunoEscolaByEscolaId(novosDados.escola.id, alunoEscola).then((alunoEscola) => {
                novaLinha.id_aluno_escola = alunoEscola.data[0]?.id;
                const novoMapEscola = [...mapEscolaInicial, {escola_id: novosDados.escola.id, ano_id: novosDados.ano_letivo?.id}];
                setMapEscolaInicial(novoMapEscola);
              }).catch((error) => {
                setErrorMsg('Tentativa de atualização de escola/turma/ano falhou', error);
              })
            );
          }
        }
        if (novosDados.id == 'novo' || novosDados.id == '') {
          if (alunoTurma.aluno_id) {
            promises.push(
              turmaMethods.insertAlunoTurma(alunoTurma).then((alunoTurma) => {
                novaLinha.id = alunoTurma.data.id;
              }).catch((error) => {
                setErrorMsg('Tentativa de atualização de escola/turma/ano falhou', error);
              })
            );
          }
        } else {
          if (alunoTurma.aluno_id) {
            promises.push(
              turmaMethods.updateAlunoTurmaById(novosDados.id, alunoTurma).catch((error) => {
                setErrorMsg('Tentativa de atualização de escola/turma/ano falhou', error);
              })
            );
          }
        }
        Promise.all(promises).then(() => {
          if ((novosDados.id == 'novo' || !novosDados.id) && (novosDados.id_aluno_escola == 'novo' || !novosDados.id_aluno_escola)) {
            _tableData.push(novaLinha)
          }
          setTableData(_tableData);
          enqueueSnackbar('Atualizado com sucesso!');
        });
        // window.location.reload();
      } catch (error) {
        setErrorMsg('Tentativa de atualização de escola/turma/ano falhou', error);
        console.error(error);
        // window.location.reload();
      }
    },
    [tableData]
  );

  const saveAndClose = (retorno = null) => {
    handleSaveRow(retorno);
    edit.onFalse();
  };

  // const turmasEscolaAno = () => {
  //   const anoLetivoAtual = anosLetivos.find((ano) => {
  //     if (ano.ano == anoAtual) {
  //       return ano.id;
  //     }
  //   })
  //   return turmas.filter((te) => te.escola_id == getValues('escola') && te.ano_id == anoLetivoAtual.id)
  // }

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={4}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >

                <RHFTextField name="nome" label="Nome do Estudante" />

                <RHFTextField type='number' name="matricula" label="Matrícula" />

                <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                  <Controller
                    name="data_nascimento"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker value={value} onChange={onChange} label='Data de Nascimento' />
                    )}
                  />
                </LocalizationProvider>

                <RHFMultiSelect
                  name="necessidades_especiais"
                  label="Necessidades Especiais"
                  options={necessidades_options}
                >
                  {necessidades_especiais.map((_ne) => (
                    <MenuItem key={_ne} value={_ne} sx={{ height: '34px' }}>
                      {_ne}
                    </MenuItem>
                  ))}
                </RHFMultiSelect>

                <RHFSelect sx={{
                  display: getValues('necessidades_especiais') == '' ? "none" : "inherit"
                }} id="laudo" disabled={getValues('necessidades_especiais') == '' ? true : false} name="laudo" label="Possui laudo médico?">
                  <MenuItem key='laudo_sim' value='true'>
                    SIM
                  </MenuItem>
                  <MenuItem key='laudo_nao' value='false' selected>
                    NÃO
                  </MenuItem>
                </RHFSelect>

              </Box>

              {currentAluno &&
                <TableContainer sx={{ pt: 2, position: 'relative', overflow: 'unset' }}>

                  <Table size="small">
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={tableData.length}
                      onSort={table.onSort}
                    />

                    <TableBody>
                      {tableData.map((row) => (
                        <AlunoEscolaTurmaAnoTableRow
                          key={row.id}
                          row={row}
                          onEditRow={() => {
                            edit.onTrue();
                            setRowToEdit(row);
                          }}
                          onDeleteRow={() => handleDeleteRow(row)}
                        />
                      ))}

                      <TableEmptyRows
                        height={49}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                      />

                    </TableBody>
                  </Table>

                </TableContainer>}
              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentAluno ? 'Criar Estudante' : 'Atualizar Estudante'}
                </LoadingButton>
              </Stack>



            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <AlunoEscolaTurmaAnoEditModal
        row={rowToEdit}
        open={edit.value}
        onClose={edit.onFalse}
        onSave={saveAndClose}
        mapEscolaInicial={mapEscolaInicial}
      />
    </>
  );
}

AlunoNewEditForm.propTypes = {
  currentAluno: PropTypes.object,
}
