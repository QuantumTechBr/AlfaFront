import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
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
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import userMethods from './user-repository';
import { FuncoesContext } from 'src/sections/funcao/context/funcao-context';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from '../zona/context/zona-context';
import { PermissoesContext } from '../permissao/context/permissao-context';
import Alert from '@mui/material/Alert';
import { useAuthContext } from 'src/auth/hooks';
import { tr } from 'date-fns/locale';
import { get, set } from 'lodash';
import { Button, IconButton } from '@mui/material';
import { margin, width } from '@mui/system';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------
const filtros = {
  escolasAG: [],
};

const uploadImagemButtonStyle = {
  marginTop: '0%',
  minWidth: '150px',
  backgroundColor: 'light-green !important',
  color: 'white',
}
export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [filters, setFilters] = useState(filtros);
  const { funcoes, buscaFuncoes } = useContext(FuncoesContext);
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { permissoes, buscaPermissoes } = useContext(PermissoesContext);
  const [idsAssessorCoordenador, setIdsAssessorCoordenador] = useState([]);
  const [idAssessorGestao, setIdAssessorGestao] = useState([]);
  const [funcoesOptions, setFuncoesOptions] = useState([]);
  const [zonaCtrl, setZonaCtrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectNewAvatar, setSelectNewAvatar] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const eAdmin = useBoolean(false);

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
  }, [buscaFuncoes, buscaEscolas, buscaZonas, buscaPermissoes]);

  useEffect(() => {
    user.permissao_usuario.map((perm) => {
      if (perm.nome === "SUPERADMIN") {
        eAdmin.onTrue();
        setValue('funcao', 'SUPERADMIN');
      }
      if (perm.nome === "ADMIN") {
        eAdmin.onTrue();
        setValue('funcao', 'ADMIN');
      }
    })
  }, [user]);

  useEffect(() => {
    const idsAC = [];
    let idAG = [];
    let funcoes_opts = [];
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
        funcoes_opts.push({
          ..._funcao,
          nome_exibicao: 'PEDAGOGO',
        })
      }
    });
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
      funcao: currentUser?.funcao || currentUser?.permissao_usuario ? currentUser.permissao_usuario[0].nome : '',
      status: (currentUser?.status ? "true" : "false") || '',
      zona: zonaCtrl,
      escola: currentUser?.escola?.length == 1 ? currentUser?.escola[0] : '',
      avatar: currentUser?.avatar || null,
    }),
    [currentUser]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    defaultValues,
  });


  const {
    register,
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const { funcao } = values;

  const updateUserAvatar = async () => {
    try {
      setEnviandoImagem(true);
      const userAvatar = getValues('avatar');
      if (!!userAvatar) {
        const formData = new FormData();
        formData.append('arquivo', userAvatar)
        await userMethods.updateUserAvatar(formData).then(() => {
          setEnviandoImagem(false);
          setSelectNewAvatar(false);
          enqueueSnackbar('Avatar atualizado com sucesso!');
        }).catch((error) => {
          setEnviandoImagem(false);
          setSelectNewAvatar(false);
          throw error;
        });
      }
    } catch (error) {
      setEnviandoImagem(false);
      setSelectNewAvatar(false);
      setErrorMsg(`Tentativa de atualização do avatar falhou - ` + `${error}`);
      console.error(error);
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.funcao == "ADMIN" || data.funcao == "SUPERADMIN") {
        console.log(data.funcao)
        const permissao = permissoes.find((permissao) => permissao.nome == data.funcao);
        if (data.senha) {
          novoUsuario = {
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            login: data.email,
            status: data.status,
            permissao_usuario_id: [permissao.id]
          }
        } else {
          novoUsuario = {
            nome: data.nome,
            email: data.email,
            login: data.email,
            status: data.status,
            permissao_usuario_id: [permissao.id]
          }
        }
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
        router.push(paths.dashboard.user.list);
        return;
      }
      const funcaoEscolhida = funcoesOptions.filter((func) => func.nome_exibicao === data.funcao)[0];
      var novoUsuario = {}
      if (data.senha) {
        novoUsuario = {
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          login: data.email,
          status: data.status,
        }
      } else {
        novoUsuario = {
          nome: data.nome,
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
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      currentUser ? setErrorMsg(`Tentativa de atualização do usuário falhou - ` + `${error}`) : setErrorMsg(`Tentativa de criação do usuário falhou - ` + `${error}`);
      console.error(error);
    }
  });

  useEffect(() => {
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
  }, [setZonaCtrl]);

  const renderValueEscolasAG = (selected) =>
    selected.map((escolaId) => {
      return escolas.find((option) => option.id == escolaId)?.nome;
    }).join(', ');

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatar', newFile, { shouldValidate: true });
        setSelectNewAvatar(true);
      }
    },
    [setValue]
  );

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
            id={`zona_` + `${currentUser?.id}`}
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
      )
    }
    if (idAssessorGestao.includes(getValues('funcao'))) {
      return (
        <FormControl
          sx={{
            flexShrink: 0,
          }}
        >
          <InputLabel>Escolas</InputLabel>
          <Select
            multiple
            id={`escolas_` + `${currentUser?.id}`}
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
    } else if (getValues('funcao') == "ADMIN" || getValues('funcao') == "SUPERADMIN") {
      return (
       <></>
      )
    } else {
      return (
        <RHFSelect
          id={`escola_` + `${currentUser?.id}`} disabled={getValues('funcao') == '' ? true : false} name="escola" label="Escola">
          {escolas.map((escola) => (
            <MenuItem key={escola.id} value={escola.id}>
              {escola.nome}
            </MenuItem>
          ))}
        </RHFSelect>
      )
    }
  }



  return (

    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            {user?.id == currentUser?.id ?
              <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                  name="avatar"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  helperText={
                    <>
                      {selectNewAvatar && <div style={{
                        width: 'min-content',
                        margin: 'auto',
                      }}>
                        <LoadingButton
                          variant="contained"
                          loading={enviandoImagem}
                          style={uploadImagemButtonStyle}
                          onClick={updateUserAvatar}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              m: '0',
                              display: 'block',
                              textAlign: 'center',
                              color: 'white',
                            }}
                          >
                            Enviar imagem
                          </Typography>
                        </LoadingButton>
                      </div>}
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 3,
                          mx: 'auto',
                          display: 'block',
                          textAlign: 'center',
                          color: 'text.disabled',
                        }}
                      >
                        Permitido *.jpeg, *.jpg, *.png
                        <br /> tamanho máximo {fData(3145728)}
                      </Typography>
                    </>
                  }
                />
              </Box>
              :
              <>
                <Box
                  component="img"
                  src={currentUser?.avatar || '/assets/user-avatar.svg'}
                  alt="User Avatar"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    mx: 'auto',
                    mb: 3,
                  }}
                />
              </>
            }
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

              <RHFSelect name="funcao" label="Função">

                {funcoesOptions.map((_funcao) => (
                  <MenuItem key={_funcao.nome_exibicao} value={_funcao.nome_exibicao}>
                    {_funcao.nome_exibicao}
                  </MenuItem>
                ))}
                {eAdmin &&

                  <MenuItem key={"ADMIN"} value={"ADMIN"}>
                    {"ADMIN"}
                  </MenuItem>

                }
                {eAdmin &&

                  <MenuItem key={"SUPERADMIN"} value={"SUPERADMIN"}>
                    {"SUPERADMIN"}
                  </MenuItem>

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

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
