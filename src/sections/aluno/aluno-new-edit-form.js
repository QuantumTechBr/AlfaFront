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
  const [escolasAssessor, setEscolasAssessor] = useState(escolas);
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

  const botaoLabel = () => {
    return (
      <Button
        variant="contained"
        onClick={() => {
          edit.onTrue();
          setRowToEdit();
        }}
        startIcon={<Iconify icon="mingcute:add-line" />}
        sx={{
          bgcolor: '#00A5AD',
        }}
      >
        Turma
      </Button>
    )
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
        if (ano.status === "NÃO FINALIZADO") {
          return ano.id;
        }
      })
      let aluno_escolas = []
      let aluno_turmas = []
      if (data.escola != '') {
        aluno_escolas = [
          {
            escola_id: data.escola,
            ano_id: anoLetivoAtual.id
          }
        ]
      }
      if (data.turma) {
        aluno_turmas = [
          {
            turma_id: data.turma
          }
        ]
      }
      const nascimento = new Date(data.data_nascimento)
      const necessidades_especiais_data = JSON.stringify(data.necessidades_especiais);
      const toSend = {
        nome: data.nome,
        matricula: data.matricula.toString(),
        data_nascimento: nascimento.getFullYear() + "-" + (nascimento.getMonth() + 1) + "-" + nascimento.getDate(),
        necessidades_especiais: necessidades_especiais_data,
        laudo_necessidade: data.necessidades_especiais == [] ? 'false' : data.laudo
      }
      if (currentAluno) {
        await alunoMethods.updateAlunoById(currentAluno.id, toSend).then(buscaTurmas({ force: true })).catch((error) => {
          throw error;
        });

      } else {
        await alunoMethods.insertAluno(toSend).then(buscaTurmas({ force: true })).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentAluno ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.aluno.list);
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
    // if (currentAluno?.alunos_turmas?.length > 0) {
    //   console.log(currentAluno)
    //   currentAluno.alunos_turmas.map((at) => {
    //     data.push({
    //       id: at.id,
    //       ano_letivo: at.turma.ano,
    //       escola: at.turma.escola,
    //       turma: at.turma,
    //     })
    //   })
    //   if (currentAluno?.alunoEscolas?.length > 0) {
    //     for (let index = 0; index < currentAluno.alunoEscolas.length; index++) {
    //       for (let j = 0; j < currentAluno.alunos_turmas.length; j++) {
    //         if (currentAluno.alunoEscolas[index].escola.id == currentAluno.alunos_turmas[j].turma.escola.id) {
    //           data[0].id_aluno_escola = currentAluno.alunoEscolas[index].id;
    //           continue;
    //         }

    //       }

    //     }
    //   }

    // }else if (currentAluno?.alunoEscolas?.length > 0) {
    //   currentAluno.alunoEscolas.map((ae) => {
    //     data.push({
    //       id: '',
    //       id_aluno_escola: ae.id,
    //       ano_letivo: ae.ano,
    //       escola: ae.escola,
    //       turma: at.turma,
    //     })
    //   })
    // }

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
    // if (currentAluno?.alunoEscolas?.length > 0 ) {
    //   setTableData([{
    //     ano_letivo: currentAluno?.alunoEscolas[0].ano,
    //     escola: currentAluno?.alunoEscolas[0].escola,
    //     turma: currentAluno?.alunos_turmas[0].turma,

    //   }])
    //   console.log(currentAluno)
    // }
    // console.log(currentAluno)
    // let anoLetivoAluno = {};
    // let escolaAluno = {};
    // let turmaAluno = {};
    // let promises = [];
    // let alunoEscolasTurmas = [];
    // if (currentAluno?.alunoEscolas?.length > 0 ) {
    //   promises.push(buscaAnoLetivo(currentAluno.alunoEscolas[0].ano).then((ano) => {
    //     anoLetivoAluno = ano;
    //   }));
    //   promises.push(buscaEscola(currentAluno.alunoEscolas[0].escola).then((esc) => {
    //     escolaAluno = esc;
    //   }));
    // }
    // if (currentAluno?.alunos_turmas?.length > 0) {
    //   promises.push(buscaTurma(currentAluno.alunos_turmas[0].turma).then((tur) => {
    //     turmaAluno = tur;
    //   }));
    // }
    // Promise.all(promises).then(() => {	
    //   setTableData([{
    //     ano_letivo: anoLetivoAluno,
    //     escola: escolaAluno,
    //     turma: turmaAluno,
    //   }])
    // }).catch((error) => {
    //   setErrorMsg('Erro de comunicação com a API de estudantes', error);
    // });
  }, [currentAluno]);

  useEffect(() => {
    buscaEscolas().then(_escolas => {
      setEscolasAssessor(_escolas)
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaTurmas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
    });
    buscaAnosLetivos().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de anos letivos');
    });
  }, [buscaAnosLetivos, buscaEscolas, buscaTurmas]);

  useEffect(() => {
    if (user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") {
      setValue('escola', user.funcao_usuario[0].escola.id)
    } else if (user?.funcao_usuario[0]?.funcao?.nome == "ASSESSOR DDZ") {
      setEscolasAssessor(escolas.filter((escola) => escola.zona.id == user.funcao_usuario[0].zona.id))
    }
  }, [escolas, setValue, user.funcao_usuario]);

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
      // alunoMethods
      //   .deleteAlunoById(id)
      //   .then((retorno) => {
      //     // setTableData(deleteRow);
      //     buscaTurmas({ force: true });
      //     contextReady.onFalse();
      //     // buscando.onFalse(),
      //     // tabelaPreparada.onFalse(),
      //     setTableData([]);
      //     setTimeout(preparacaoInicial, 1000);
      //   })
      //   .catch((error) => {
      //     setErrorMsg(
      //       'Erro de comunicação com a API de estudantes no momento da exclusão do estudante'
      //     );
      //     console.log(error);
      //   });

      // table.onUpdatePageDeleteRow(dataInPage.length);
      // setCountAlunos(countAlunos - 1)

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
      if (novosDados.id == 'novo' && novosDados.id_aluno_escola == 'novo') {
        _tableData.push({
          id: novosDados.turma?.id,
          id_aluno_escola: novosDados.id_aluno_escola,
          ano_letivo: novosDados.ano_letivo,
          escola: novosDados.escola,
          turma: novosDados.turma,
        })
      }
      const alunoEscola = novosDados.ano_letivo?.id ? [{ aluno_id: currentAluno.id, ano_id: novosDados.ano_letivo.id }] : [];
      const alunoTurma = novosDados.turma?.id ? { aluno_id: currentAluno.id, turma_id: novosDados.turma.id } : {};
      try {
        if (novosDados.escola?.id != undefined) {
          let escolaMudou = true;
          mapEscolaInicial.map((ei) => {
            if (ei.escola_id == novosDados.escola.id && ei.ano_id == novosDados.ano_letivo?.id ) {
              escolaMudou = false;
            }
          })
          if (escolaMudou) {
            escolaMethods.updateAlunosByEscolaId(novosDados.escola.id, alunoEscola);
          }
        }

        if (novosDados.id == 'novo' || novosDados.id == '') {
          if (alunoTurma.aluno_id != undefined) {
            turmaMethods.insertAlunoTurma(alunoTurma);

          }
        } else {
          if (alunoTurma.aluno_id != undefined) {
            turmaMethods.updateAlunoTurmaById(novosDados.id, alunoTurma);
          }
        }
        enqueueSnackbar('Atualizado com sucesso!');
        // window.location.reload();
      } catch (error) {
        setErrorMsg('Tentativa de atualização de escola/turma/ano falhou');
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

                {!currentAluno &&
                  <>
                    <RHFSelect sx={{
                    }} id={`escola_` + `${currentAluno?.id}`} disabled={user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR" ? true : false} name="escola" label="Escola">
                      {escolasAssessor.map((escola) => (
                        <MenuItem key={escola.id} value={escola.id}>
                          {escola.nome}
                        </MenuItem>
                      ))}
                    </RHFSelect>

                    <RHFSelect sx={{
                      display: getValues('escola') ? "inherit" : "none"
                    }} id={`turma_` + `${currentAluno?.id}`} disabled={getValues('escola') == '' ? true : false} name="turma" label="Turma">
                      {turmas.filter((te) => te.escola_id == getValues('escola'))
                        .map((turma) => (
                          <MenuItem key={turma.id} value={turma.id}>
                            {turma.ano_escolar}º {turma.nome} ({turma.turno})
                          </MenuItem>
                        ))}
                    </RHFSelect>
                  </>
                }

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
      />
    </>
  );
}

AlunoNewEditForm.propTypes = {
  currentAluno: PropTypes.object,
}
