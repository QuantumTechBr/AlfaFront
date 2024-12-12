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
import RegistroAprendizagemDiagnosticoNewEditForm from '../../form/diagnostico/registro-aprendizagem-diagnostico-new-edit-form';
import { useState, useEffect, useCallback } from 'react';
import habilidadeMethods from '../../../../habilidade/habilidade-repository';
import turmaMethods from 'src/sections/turma/turma-repository';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';
import Alert from '@mui/material/Alert';
import { useBoolean } from 'src/hooks/use-boolean';
// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoCreateView({ turma, periodo }) {
  const settings = useSettingsContext();
  const [_turma, setTurma] = useState(turma);
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const prep = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  useEffect(() => {
    habilidadeMethods.getAllHabilidades().then(habilidadesRetorno =>{
      const habilidade_turma = habilidadesRetorno.data.filter((habilidade) => String(habilidade.ano_escolar) == String(_turma.ano_escolar));
      setHabilidades(habilidade_turma);
      if(_turma.turmas_alunos){
        registroAprendizagemMethods.getAllRegistrosAprendizagemDiagnostico({turmaId:_turma.id, periodo: periodo}).then(registros => {
          const registrosAprendizagemTurma = registros.data;
          if (registrosAprendizagemTurma) {
            const _alunosTurma = (_turma.turmas_alunos == undefined) ? [] : _turma.turmas_alunos;
            registrosAprendizagemTurma.forEach(registro => {
              let r = Array(20).fill("");
              const mapHabilidades = [];
              const idHabilidadesRegistroAprendizagem = [];
              if (registro.habilidades_registro_aprendizagem.length > 0) {
                registro.habilidades_registro_aprendizagem.forEach(resposta => {
                  if (0 < resposta.numero_resposta <= 20)  {
                    r[resposta.numero_resposta - 1] = resposta.nota == "" || resposta.nota == 'NR' ? resposta.nota : Number(resposta.nota);
                  }
                })
              }
              // habilidade_turma.forEach(hab => {
              //   const encontrada = registro.habilidades_registro_aprendizagem.find((habReg) => {
              //     return habReg.habilidade.id == hab.id;
              //   });
              //   if (encontrada){
              //     mapHabilidades[encontrada.habilidade.id] = encontrada.nota
              //     idHabilidadesRegistroAprendizagem[encontrada.habilidade.id] = encontrada.id
              //   }
              // })
              const searchIndex = _alunosTurma.findIndex((aluno) => aluno.id==registro.aluno_turma.id);
              if (searchIndex >= 0) {
                _alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
                _alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
                _alunosTurma[searchIndex].id_registro = registro.id;
                _alunosTurma[searchIndex].id_habilidades_registro_aprendizagem = idHabilidadesRegistroAprendizagem; 
                _alunosTurma[searchIndex].frequencia = registro.frequencia; 
                _alunosTurma[searchIndex].r = r;
                _alunosTurma[searchIndex].media_lingua_portuguesa = registro.media_lingua_portuguesa ?? '';
                _alunosTurma[searchIndex].media_matematica = registro.media_matematica ?? '';
                _alunosTurma[searchIndex].media_final = registro.media_final ?? '';  
              }
            });
            setAlunosTurma(_alunosTurma);
            prep.onTrue();
          } else {
            const _alunosTurma = (_turma.turmas_alunos == undefined) ? [] : _turma.turmas_alunos;
            const mapHabilidades = [];
            let r = Array(20).fill("");
            for (var i = 0; i < habilidadesRetorno.data.length; i++) {
              mapHabilidades[habilidadesRetorno.data[i].id] = '';
            }
            _alunosTurma.map(alunoTurma => {
              alunoTurma.mapHabilidades = mapHabilidades;
              alunoTurma.r = r;
            });
            setAlunosTurma(_alunosTurma);
            prep.onTrue();
          }
        }).catch((error) => {
          setErrorMsg('Erro de comunicação com a API de registro aprendizagem diagnostico');
          prep.onTrue();
        });
      } else {
        setWarningMsg('As informações da turma veio sem estudantes')
        setAlunosTurma([]);
        prep.onTrue();
      }
    }).catch((error) => {
      setErrorMsg('Erro de comunicação com a API de habilidades');
      prep.onTrue();
    });
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
    const habilidade_turma = novaTodasHabilidades.data.filter((habilidade) => String(habilidade.ano_escolar) == String(novaTurma.ano_escolar));
    setHabilidades(habilidade_turma);
    if(novaTurma.turmas_alunos){
      registroAprendizagemMethods.getAllRegistrosAprendizagemDiagnostico({turmaId: novaTurma.id, periodo: periodo}).then(registros => {
        const novoRegistrosAprendizagemTurma = registros.data;
        if (novoRegistrosAprendizagemTurma) {
          const _alunosTurma = (novaTurma.turmas_alunos == undefined) ? [] : novaTurma.turmas_alunos;
          novoRegistrosAprendizagemTurma.forEach(registro => {
            let r = Array(20).fill("");
            const mapHabilidades = [];
            const idHabilidadesRegistroAprendizagem = [];
            if (registro.habilidades_registro_aprendizagem.length > 0) {
              registro.habilidades_registro_aprendizagem.forEach(resposta => {
                if (0 < resposta.numero_resposta <= 20)  {
                  r[resposta.numero_resposta - 1] = resposta.nota == "" || resposta.nota == 'NR' ? resposta.nota : Number(resposta.nota);
                }
              })
            }
            // habilidade_turma.forEach(hab => {
            //   const encontrada = registro.habilidades_registro_aprendizagem.find((habReg) => {
            //     return habReg.habilidade.id == hab.id;
            //   });
            //   if (encontrada){
            //     mapHabilidades[encontrada.habilidade.id] = encontrada.nota
            //     idHabilidadesRegistroAprendizagem[encontrada.habilidade.id] = encontrada.id
            //   }
            // })
            const searchIndex = _alunosTurma.findIndex((aluno) => aluno.id==registro.aluno_turma.id);
            if (searchIndex >= 0) {
              _alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
              _alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
              _alunosTurma[searchIndex].id_registro = registro.id;
              _alunosTurma[searchIndex].id_habilidades_registro_aprendizagem = idHabilidadesRegistroAprendizagem; 
              _alunosTurma[searchIndex].frequencia = registro.frequencia; 
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
          const mapHabilidades = [];
          let r = Array(20).fill("");
          for (var i = 0; i < habilidade_turma.length; i++) {
            mapHabilidades[habilidade_turma[i].id] = '';
          }
          _alunosTurma.map(alunoTurma => {
            alunoTurma.mapHabilidades = mapHabilidades;
            alunoTurma.r = r;
          });
          setAlunosTurma(_alunosTurma);
          prep.onTrue();
        }
      }).catch((error) => {
        setErrorMsg('Erro de comunicação com a API de registro aprendizagem diagnostico');
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
            href: paths.dashboard.registro_aprendizagem.root_diagnostico,
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
      <RegistroAprendizagemDiagnosticoNewEditForm turma={_turma} periodo={periodo} handleTurma={handleTurma} habilidades={habilidades} alunosTurma={alunosTurma} prep={prep}/>
    </Container>
  );
}

RegistroAprendizagemDiagnosticoCreateView.propTypes = {
  turma: PropTypes.object,
  periodo: PropTypes.string,
};
