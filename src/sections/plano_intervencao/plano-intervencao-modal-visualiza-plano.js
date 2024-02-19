import PropTypes from 'prop-types';
import { useEffect, useState, useContext, useCallback } from 'react';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// routes
import { useRouter } from 'src/routes/hook';

import { IconButton } from '@mui/material';
import { CloseIcon } from 'yet-another-react-lightbox';

import { useBoolean } from 'src/hooks/use-boolean';
import planoIntervencaoMethods from './plano-intervencao-repository';
import habilidadeMethods from '../habilidade/habilidade-repository';
import documentoIntervencaoMethods from './documento_plano_intervencao/documento-intervencao-repository';
import Label from 'src/components/label';
import Typography from '@mui/material/Typography';
import { EscolasContext } from 'src/sections/escola/context/escola-context';
import { ZonasContext } from 'src/sections/zona/context/zona-context';
import { TurmasContext } from '../turma/context/turma-context';

// ----------------------------------------------------------------------

export default function VisualizaPlanoIntervencao({ open, onClose, currentPlano }) {
  const router = useRouter();
  const [hab, setHab] = useState([]);
  const preparado = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [allHab, setAllHab] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [plano, setPlano] = useState({});
  const { escolas, buscaEscolas } = useContext(EscolasContext);
  const { zonas, buscaZonas } = useContext(ZonasContext);
  const { turmas, buscaTurmas } = useContext(TurmasContext);

    const buscaDocumentos = useCallback(async () => {
    setWarningMsg('');
    setErrorMsg('');
    preparado.onFalse();
    let returnData = documentos;

    const consultaAtual = documentoIntervencaoMethods
      .getAllDocumentos(currentPlano)
      .then((response) => {
        if (response.data == '' || response.data === undefined) response.data = [];
        setDocumentos(response.data);
        returnData = response.data;
        return returnData;
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de documentos');
      })
      .finally(() => preparado.onTrue());

    return consultaAtual;
  }, [preparado, currentPlano, documentos]);

  useEffect(() => {
    planoIntervencaoMethods
      .getPlanoIntervencaoById(currentPlano)
      .then((retorno) => {
        setPlano(retorno.data);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de planos');
      });
    habilidadeMethods
      .getAllHabilidades()
      .then((retorno) => {
        setAllHab(retorno.data);
      })
      .catch((error) => {
        setErrorMsg('Erro de comunicação com a API de habilidades');
      });
    buscaEscolas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de escolas');
      preparado.onTrue();
    });
    buscaTurmas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de turmas');
      preparado.onTrue();
    });
    buscaZonas().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de zonas');
      preparado.onTrue();
    });
    buscaDocumentos();
    // preparado.onTrue()
  }, []);

  const mostrarAplicacao = () => {
    const list_retorno = [];
    let aplicacao = '';
    if (plano?.aplicacao?.alunos?.length > 0) {
      plano.aplicacao.alunos.map((alunoId) => {
        turmas.map((turma) => {
          turma?.turmas_alunos?.map((ta) => {
            if (ta?.aluno?.id == alunoId) {
              list_retorno.push(`- ${ta.aluno?.nome} `);
            }
          });
        });
      });
      aplicacao = 'Alunos ';
    } else if (plano?.aplicacao?.turmas?.length > 0) {
      plano.aplicacao.turmas.map((turmaId) => {
        turmas.map((turma) => {
          if (turma.id == turmaId) {
            list_retorno.push(
              `- ${turma.ano_escolar}º ${turma.nome} (${turma.turno})  (${turma.escola.nome})`
            );
          }
        });
      });
      aplicacao = 'Turmas ';
    } else if (plano?.aplicacao?.escolas?.length > 0) {
      plano.aplicacao.escolas.map((escolaId) => {
        escolas.map((escola) => {
          if (escola.id == escolaId) {
            list_retorno.push(`- ${escola.nome} `);
          }
        });
      });
      aplicacao = 'Escolas ';
    } else if (plano?.aplicacao?.zonas?.length > 0) {
      plano.aplicacao.zonas.map((zonaId) => {
        zonas.map((zona) => {
          if (zona.id == zonaId) {
            list_retorno.push(`- ${zona.nome} `);
          }
        });
      });
      aplicacao = 'Zonas ';
    }
    return (
      <div>
        <Typography>
          {aplicacao}
          <br></br>
        </Typography>
        {list_retorno.map((li, index) => (
          <Typography key={index}>
            {li}
            <br></br>
          </Typography>
        ))}
      </div>
    );
  };

  const retornaHabilidades = () => {
    const list_retorno = [];
    allHab.map((habilidade) => {
      if (plano?.habilidades_plano_intervencao?.includes(habilidade.id)) {
        list_retorno.push(`- ${habilidade.nome} `);
      }
    });
    list_retorno.push('-');
    return <Typography>{''.concat(...list_retorno)}</Typography>;
  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 1500, minHeight: 600 },
      }}
    >
      <DialogTitle>Visualização de Plano</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(4, 1fr)',
                }}
                sx={{
                  minHeight: 450,
                }}
              >
                <div>
                  <Label>Ano Escolar</Label>
                  <Typography>{plano?.ano_escolar}</Typography>
                </div>
                <div>
                  <Label>Habilidades</Label>
                  {retornaHabilidades()}
                </div>
                <div>
                  <Label>Início Previsto</Label>
                  <Typography>{plano?.inicio_previsto}</Typography>
                </div>
                <div>
                  <Label>Término Previsto</Label>
                  <Typography>{plano?.termino_previsto}</Typography>
                </div>
                <div>
                  <Label>Fase</Label>
                  <Typography>{plano?.fase}</Typography>
                </div>
                <div>
                  <Label>Ação</Label>
                  <Typography>{plano?.acao}</Typography>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Typography>{plano?.responsavel?.nome}</Typography>
                </div>
                <div>
                  <Label>Aplicação</Label>
                  {mostrarAplicacao()}
                </div>
                <div>
                  <Label>Anexos</Label>
                  <br></br>
                  {documentos.map((doc, index) => (
                    <div key={index}>
                      {doc?.descricao}
                      <br></br>
                      <a href={doc.arquivo}>
                        {doc.nomeArquivo}
                        <br></br>
                      </a>
                    </div>
                  ))}
                </div>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

VisualizaPlanoIntervencao.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentPlano: PropTypes.string,
};
