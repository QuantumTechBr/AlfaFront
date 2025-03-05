'use client';
import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AvaliacaoDiagnosticoNewEditForm from './avaliacao-diagnostico-new-edit-form';
import { useState, useEffect, useCallback } from 'react';
import avaliacaoMethods from 'src/sections/avaliacao/avaliacao-repository';
import turmaMethods from 'src/sections/turma/turma-repository';
import habilidadeMethods from 'src/sections/habilidade/habilidade-repository';
import Alert from '@mui/material/Alert';
import { useBoolean } from 'src/hooks/use-boolean';
import { id } from 'date-fns/locale';
import { TipoVersaoAvaliacao } from 'src/sections/avaliacao/enums';
import { capitalize } from 'lodash';
// ----------------------------------------------------------------------

export default function AvaliacaoDiagnosticoCreateView({ turma, periodo }) {
  const settings = useSettingsContext();
  const [_turma, setTurma] = useState(turma);
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const prep = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [versaoAvaliacao, setVersaoAvaliacao] = useState(null);

  useEffect(() => {
    if(_turma.turmas_alunos){
      const promises = [];
      const getAllAvaliacaoDiagnosticoPromise = avaliacaoMethods.getAllAvaliacaoDiagnostico({turmaId:_turma.id, periodo: periodo}).then(registros => {
        const avaliacaoTurma = registros.data;
        if (avaliacaoTurma) {
          const _alunosTurma = (_turma.turmas_alunos == undefined) ? [] : _turma.turmas_alunos;
          avaliacaoTurma.forEach(avaliacao => {
            let r = new Array(); // mapeamento de respostas de aluno
            if (avaliacao.respostas_aluno.length > 0) {
              avaliacao.respostas_aluno.forEach(resposta => {
                r[resposta.questao.numero_questao] = resposta.alternativa.id;
              })
            }
            // definir avaliacao do aluno da turma
            const searchIndex = _alunosTurma.findIndex((aluno) => aluno.id==avaliacao.aluno_turma.id);
            if (searchIndex >= 0) {
              // _alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
              // _alunosTurma[searchIndex].promo_ano_anterior = avaliacao.promo_ano_anterior;
              _alunosTurma[searchIndex].id_registro = avaliacao.id;
              // _alunosTurma[searchIndex].id_respostas_aluno = idHabilidadesRegistroAprendizagem; 
              _alunosTurma[searchIndex].frequencia = avaliacao.frequencia ? capitalize(avaliacao.frequencia) : ''; 
              _alunosTurma[searchIndex].r = r;
              _alunosTurma[searchIndex].media_lingua_portuguesa = avaliacao.media_lingua_portuguesa ?? '';
              _alunosTurma[searchIndex].media_matematica = avaliacao.media_matematica ?? '';
              _alunosTurma[searchIndex].media_final = avaliacao.media_final ?? '';  
              _alunosTurma[searchIndex].avaliacao = avaliacao ?? '';
            }
          });
          setAlunosTurma(_alunosTurma);
        } else {
          const _alunosTurma = (_turma.turmas_alunos == undefined) ? [] : _turma.turmas_alunos;
          // const mapHabilidades = [];
          let r = new Array(); // mapeamento de respostas de aluno
          // for (var i = 0; i < habilidadesRetorno.data.length; i++) {
          //   mapHabilidades[habilidadesRetorno.data[i].id] = '';
          // }
          _alunosTurma.map(alunoTurma => {
            // alunoTurma.mapHabilidades = mapHabilidades;
            alunoTurma.r = r;
            alunoTurma.avaliacao = {
              id: '',
              frequencia: '',
              periodo: '',
              respostas_aluno: [],
              media_lingua_portuguesa: '',
              media_matematica: '',
              media_final: ''
            };
          });
          setAlunosTurma(_alunosTurma);
        }
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de avaliação diagnostico');
      });
      promises.push(getAllAvaliacaoDiagnosticoPromise);
      const getVersaoAvaliacaoPromise = avaliacaoMethods.getVersaoAvaliacao({tipo: TipoVersaoAvaliacao.DIAGNOSTICA, dataAplicavel: _turma.ano.data_inicio}).then((response) => {
        if(response.data.length > 0){
          setVersaoAvaliacao(response.data[0]);
        } else {
          setErrorMsg('Versão de avaliação não encontrada');
          throw new Error('Versão de avaliação não encontrada');
        }
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de versão de avaliação');
      });
      promises.push(getVersaoAvaliacaoPromise);

      Promise.all(promises).then(() => {
        prep.onTrue();
      });
    } else {
      setWarningMsg('As informações da turma veio sem estudantes')
      setAlunosTurma([]);
      prep.onTrue();
    }
  }, [_turma, periodo]);

  const handleTurma = useCallback(async (event) => {
    const novaTurma = (await turmaMethods.getTurmaById(event.id)).data;
    setErrorMsg('');
    setWarningMsg('');
    prep.onFalse();
    setTurma(novaTurma);
    const novaTodasHabilidades = await habilidadeMethods.getAllHabilidades().catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
      prep.onTrue();
    });
    await avaliacaoMethods.getVersaoAvaliacao({tipo: TipoVersaoAvaliacao.DIAGNOSTICA, dataAplicavel: turma?.ano?.data_inicio}).then((response) => {
      if(response.data.length > 0){
        setVersaoAvaliacao(response.data[0]);
      } else {
        setErrorMsg('Versão de avaliação não encontrada');
        throw new Error('Versão de avaliação não encontrada');
      }
    });
    const habilidade_turma = novaTodasHabilidades.data.filter((habilidade) => String(habilidade.ano_escolar) == String(novaTurma.ano_escolar));
    setHabilidades(habilidade_turma);
    if(novaTurma.turmas_alunos){
      avaliacaoMethods.getAllAvaliacaoDiagnostico({turmaId: novaTurma.id, periodo: periodo}).then(registros => {
        const novaAvaliacaoTurma = registros.data;
        if (novaAvaliacaoTurma) {
          const _alunosTurma = (novaTurma.turmas_alunos == undefined) ? [] : novaTurma.turmas_alunos;
          novaAvaliacaoTurma.forEach(registro => {
            let r = new Array();
            // const mapHabilidades = [];
            // const idHabilidadesRegistroAprendizagem = [];
            if (registro.respostas_aluno.length > 0) {
              registro.respostas_aluno.forEach(resposta => {
                r[resposta.questao.numero_questao] = resposta.alternativa.id;
              })
            }
            const searchIndex = _alunosTurma.findIndex((alunoTurma) => alunoTurma.id==registro.aluno_turma.id);
            if (searchIndex >= 0) {
              // _alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
              // _alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
              _alunosTurma[searchIndex].id_registro = registro.id;
              // _alunosTurma[searchIndex].id_respostas_aluno = idHabilidadesRegistroAprendizagem; 
              _alunosTurma[searchIndex].frequencia = registro.frequencia ? capitalize(registro.frequencia) : ''; 
              _alunosTurma[searchIndex].r = r; 
              _alunosTurma[searchIndex].media_lingua_portuguesa = registro.media_lingua_portuguesa ?? '';
              _alunosTurma[searchIndex].media_matematica = registro.media_matematica ?? '';
              _alunosTurma[searchIndex].media_final = registro.media_final ?? '';
            }
          });
          setAlunosTurma(_alunosTurma);
          prep.onTrue();
        } else {
          const _alunosTurma = (novaTurma.turmas_alunos == undefined) ? [] : novaTurma.turmas_alunos;
          // const mapHabilidades = [];
          let r = Map();
          // for (var i = 0; i < habilidade_turma.length; i++) {
          //   mapHabilidades[habilidade_turma[i].id] = '';
          // }
          _alunosTurma.map(alunoTurma => {
            // alunoTurma.mapHabilidades = mapHabilidades;
            alunoTurma.r = r;
            alunoTurma.avaliacao = {
              id: '',
              frequencia: '',
              periodo: '',
              respostas_aluno: [],
              media_lingua_portuguesa: '',
              media_matematica: '',
              media_final: ''
            };
          });
          setAlunosTurma(_alunosTurma);
          prep.onTrue();
        }
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de avaliacao diagnostico');
        prep.onTrue();
      })
    } else {
      setWarningMsg('As informações da turma veio sem estudantes')
      setAlunosTurma([]);
      prep.onTrue();
    }

  }, [periodo, prep])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xxl'}>
      <CustomBreadcrumbs
        heading="Criar novo Acompanhamento Diagnóstico"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Acompanhamentos Diagnósticos',
            href: paths.dashboard.avaliacao.root_diagnostico,
          },
          { name: 'Acompanhamento Diagnóstico - ' + `${periodo}` },
        ]}
        youtubeLink="https://www.youtube.com/embed/fxgNcBmSqYQ?si=ZgvKKXdEZpmjb2ik&cc_load_policy=1"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}    
      <AvaliacaoDiagnosticoNewEditForm turma={_turma} periodo={periodo} handleTurma={handleTurma} habilidades={habilidades} alunosTurma={alunosTurma} versaoAvaliacao={versaoAvaliacao} prep={prep}/>
    </Container>
  );
}

AvaliacaoDiagnosticoCreateView.propTypes = {
  turma: PropTypes.object,
  periodo: PropTypes.string,
};
