
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import { USER_STATUS_OPTIONS, _ddzs } from 'src/_mock';
import userMethods from '../user/user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import Alert from '@mui/material/Alert';
import { AuthContext } from 'src/auth/context/alfa';

// ----------------------------------------------------------------------
const filtros = {
  escolasAG: [],
};
export default function ProfissionalNewEditForm({ currentUser }) {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const [filters, setFilters] = useState(filtros);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [idsAssessorCoordenador, setIdsAssessorCoordenador] = useState([]);
  const [idAssessorGestao, setIdAssessorGestao] = useState([]);
  const [funcoesOptions, setFuncoesOptions] = useState([]);
  const [ zonaCtrl, setZonaCtrl ] = useState('');

  const [funcaoProfessorDiretor, setFuncaoProfessorDiretor] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    buscaFuncoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de funções');
    });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
    });
    buscaPermissoes().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de permissoes');
    });

  }, [buscaEscolas, buscaFuncoes, buscaZonas, buscaPermissoes]);

  useEffect(() => {
    const idsAC = [];
      let idAG = [];
      let funcoes_opts = [];
      let funcoes_professor_diretor = [];
      funcoes.map((_funcao) => {
        funcoes_opts.push({
          ..._funcao,
          nome_exibicao: _funcao.nome,
        });
        if (_funcao.nome == "ASSESSOR DDZ" || _funcao.nome == "COORDENADOR DE GESTAO") {
          idsAC.push(_funcao.nome);
        } else if (_funcao.nome == "ASSESSOR DE GESTAO") {
          funcoes_opts.push({
            ..._funcao,
            nome_exibicao: 'ASSESSOR PEDAGOGICO',
          })
          idAG.push(_funcao.nome);
          idAG.push('ASSESSOR PEDAGOGICO');
        } else if (_funcao.nome == "DIRETOR") {
          funcoes_professor_diretor.push({
            ..._funcao,
            nome_exibicao: 'PEDAGOGO',
          })
          funcoes_professor_diretor.push({
            ..._funcao,
            nome_exibicao: _funcao.nome,
          });
          funcoes_opts.push({
            ..._funcao,
            nome_exibicao: 'PEDAGOGO',
          })
        } else if (_funcao.nome == "PROFESSOR") {
          funcoes_professor_diretor.push({
            ..._funcao,
            nome_exibicao: 'PROFESSOR',
          })
        }
      });
      console.log(funcoes_professor_diretor)
      setFuncaoProfessorDiretor(funcoes_professor_diretor);
      setIdsAssessorCoordenador(idsAC);
      setIdAssessorGestao(idAG);
      setFuncoesOptions(funcoes_opts);
  }, [funcoes]);


  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('Email é obrigatório').email('Email tem que ser um endereço de email válido'),
    senha: Yup.string(),
    funcao_usuario: Yup.string(),
  });
  
  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      senha: currentUser?.senha || '',
      funcao: currentUser?.funcao || '',
      status: (currentUser?.status ? "true" : "false") || '',
      zona: zonaCtrl,
      escola: currentUser?.escola?.length == 1 ? currentUser?.escola[0] : '',
    }),
    [currentUser]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });


  const {
    reset,
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const { funcao } = values;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const funcaoEscolhida = funcoesOptions.filter((func) => func.nome_exibicao === data.funcao)[0];
      var novoUsuario = {}
      if (data.senha) {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          senha: data.senha, 
          login: data.email,
          status: data.status,
        }
      } else {
        novoUsuario = {
          nome:  data.nome,
          email: data.email,
          login: data.email,
          status: data.status,
        }
      }
      if (idsAssessorCoordenador.includes(data.funcao)) {
        if (zonaCtrl == '') {
          setErrorMsg('Voce deve selecionar uma zona');
          return
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: funcaoEscolhida.id,
            zona_id: zonaCtrl,
            nome_exibicao: funcaoEscolhida.nome_exibicao,
          }];
        }
      } else if (idAssessorGestao.includes(data.funcao)) {
        if (filters.escolasAG.length == 0) {
          setErrorMsg('Voce deve selecionar uma ou mais escolas');
        } else {
          novoUsuario.funcao_usuario = [];
          filters.escolasAG.map((escolaId) => {
            novoUsuario.funcao_usuario.push({
              funcao_id: funcaoEscolhida.id,
              escola_id: escolaId,
              nome_exibicao: funcaoEscolhida.nome_exibicao,
            });
          })
        }

      } else {
        if (data.escola == '') {
          setErrorMsg('Voce deve selecionar uma escola');
          return
        } else {
          novoUsuario.funcao_usuario = [{
            funcao_id: funcaoEscolhida.id,
            escola_id: data.escola,
            nome_exibicao: funcaoEscolhida.nome_exibicao,
          }];
        }
      }

      const permissao = permissoes.find((permissao) => permissao.nome == funcaoEscolhida.nome)
      novoUsuario.permissao_usuario_id = [permissao.id]
      if (currentUser) {
        await userMethods.updateUserById(currentUser.id, novoUsuario).catch((error) => {
          throw error;
        });
        
      } else {
        await userMethods.insertUser(novoUsuario).catch((error) => {
          throw error;
        });
      }
      reset();
      enqueueSnackbar(currentUser ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
      router.push(paths.dashboard.profissional.list);
      console.info('DATA', data);
    } catch (error) {
      const arrayMsg = Object.values(error).map((msg) => {
        return (msg[0] ? msg[0].charAt(0).toUpperCase() + msg[0].slice(1) : '');
      });
      const mensagem = arrayMsg.join(' ');
      currentUser ? setErrorMsg(`Tentativa de atualização do usuário falhou - `+`${mensagem}`) : setErrorMsg(`Tentativa de criação do usuário falhou - `+`${mensagem}`);
      console.error(error);
    }
  });

  useEffect(()  => {
    reset(defaultValues)
    const escIds = [];
    setZonaCtrl(currentUser?.zona);
    if (currentUser?.escola) {
      if (currentUser.escola[0]) {
        currentUser.escola.map((escolaId) => {
          escIds.push(escolaId)
        })
      }
    }
    const novosFiltros = {
      escolasAG: escIds
    }
    setFilters(novosFiltros);
  }, [currentUser, defaultValues, reset]);
  
  // useEffect(()  => {
  //   setFilters(filtros);
  //   setValue('escola', '');
  //   setValue('zona', '');
  // }, [funcao, setValue]);

  const handleFilters = useCallback(
    async (nome, value) => {
      const novosFiltros = {
        ...filters,
        [nome]: value,
      }
      setFilters(novosFiltros);
    },
    [filters]
  );
  
  const handleEscolasAG = useCallback(
    (event) => {
      handleFilters(
        'escolasAG',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [handleFilters]
  );

  const handleZona = useCallback((event) => {
    setZonaCtrl(event.target.value);
  }, [setZonaCtrl] )

  const renderValueEscolasAG = (selected) => 
    selected?.map((escolaId) => {
        return escolas.find((option) => option.id == escolaId)?.nome;
      }).join(', ');

  const escolaOuZona = () => {
    if (idsAssessorCoordenador.includes(getValues('funcao'))) {
      return (

        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >      
          <InputLabel>DDZ</InputLabel>
          <Select
            id={`zona_`+`${currentUser?.id}`}
            name="zona"
            disabled={getValues('funcao') == '' ? true : false}
            value={zonaCtrl}
            onChange={handleZona}
            label="DDZ"
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
             {zonas.map((zona) => (
            <MenuItem key={zona.id} value={zona.id}>
              <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
            </MenuItem>
          ))}
          </Select>
        </FormControl>

        // <RHFSelect
        //   id={`zona_`+`${currentUser?.id}`} disabled={getValues('funcao') == '' ? true : false} value={zonaCtrl} onChange={handleZona} label="DDZ">
        //   {zonas.map((zona) => (
        //     <MenuItem key={zona.id} value={zona.id}>
        //       <Box sx={{ textTransform: 'capitalize' }}>{zona.nome}</Box>
        //     </MenuItem>
        //   ))}
        // </RHFSelect>
      )
    } 
    if ( idAssessorGestao.includes(getValues('funcao')) ) {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >      
          <InputLabel>Escolas</InputLabel>
          <Select
            multiple
            id={`escolas_`+`${currentUser?.id}`}
            name="escolas"
            disabled={getValues('funcao') == '' ? true : false}
            value={filters.escolasAG}
            onChange={handleEscolasAG}
            input={<OutlinedInput label="Escolas" />}
            renderValue={renderValueEscolasAG}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {escolas?.map((escola) => (
              <MenuItem key={escola.id} value={escola.id}>
                <Checkbox disableRipple size="small" checked={filters.escolasAG.includes(escola.id)} />
                  {escola.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    } else {
      return (
        <RHFSelect 
          id={`escola_`+`${currentUser?.id}`} disabled={getValues('funcao') == '' ? true : false} name="escola" label="Escola">
          {escolas.map((escola) => (
            <MenuItem key={escola.id} value={escola.id}>
              {escola.nome}
            </MenuItem>
          ))}
        </RHFSelect>
      )
    }
  }

  const desabilitaMudarFuncao = () => {
    if (user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") {
      return currentUser ? true : false
    }
    return false
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="nome" label="Nome Completo" />
              <RHFTextField name="email" label="Email" />
              <RHFTextField name="senha" label="Nova Senha" type="password" />

       
              <RHFSelect name="funcao" label="Função" disabled={desabilitaMudarFuncao()}>
                {(user?.funcao_usuario[0]?.funcao?.nome == "DIRETOR") ?
                  (funcaoProfessorDiretor.map((_funcao) => (
                    <MenuItem key={_funcao?.nome_exibicao} value={_funcao?.nome_exibicao}>
                      {_funcao?.nome_exibicao}
                    </MenuItem>)
                  ))
                  : (funcoesOptions.map((_funcao) => (
                    <MenuItem key={_funcao.nome_exibicao} value={_funcao.nome_exibicao}>
                      {_funcao.nome_exibicao}
                    </MenuItem>
                  )))
                }
              </RHFSelect>

              <RHFSelect name="status" label="Status">
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              {escolaOuZona()}

            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Criar Usuário' : 'Atualizar Usuário'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProfissionalNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
