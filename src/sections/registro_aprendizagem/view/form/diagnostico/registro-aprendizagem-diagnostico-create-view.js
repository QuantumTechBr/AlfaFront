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
  console.log(turma)

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
              const mapHabilidades = [];
              const idHabilidadesRegistroAprendizagem = [];
              habilidade_turma.forEach(hab => {
                const encontrada = registro.habilidades_registro_aprendizagem.find((habReg) => {
                  return habReg.habilidade.id == hab.id;
                });
                if (encontrada){
                  mapHabilidades[encontrada.habilidade.id] = encontrada.nota
                  idHabilidadesRegistroAprendizagem[encontrada.habilidade.id] = encontrada.id
                }
              })
              const searchIndex = _alunosTurma.findIndex((aluno) => aluno.id==registro.aluno_turma.id);
              if (searchIndex >= 0) {
                _alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
                _alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
                _alunosTurma[searchIndex].id_registro = registro.id;
                _alunosTurma[searchIndex].id_habilidades_registro_aprendizagem = idHabilidadesRegistroAprendizagem; 
              }
            });
            setAlunosTurma(_alunosTurma);
            prep.onTrue();
          } else {
            const _alunosTurma = (_turma.turmas_alunos == undefined) ? [] : _turma.turmas_alunos;
            const mapHabilidades = [];
            for (var i = 0; i < habilidadesRetorno.data.length; i++) {
              mapHabilidades[habilidadesRetorno.data[i].id] = '';
            }
            _alunosTurma.map(alunoTurma => {
              alunoTurma.mapHabilidades = mapHabilidades;
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
    const novaTurma = event.target.value;
    setErrorMsg('');
    setWarningMsg('');
    prep.onFalse();
    setTurma(event.target.value);
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
            const mapHabilidades = [];
            const idHabilidadesRegistroAprendizagem = [];
            habilidade_turma.forEach(hab => {
              const encontrada = registro.habilidades_registro_aprendizagem.find((habReg) => {
                return habReg.habilidade.id == hab.id;
              });
              if (encontrada){
                mapHabilidades[encontrada.habilidade.id] = encontrada.nota
                idHabilidadesRegistroAprendizagem[encontrada.habilidade.id] = encontrada.id
              }
            })
            const searchIndex = _alunosTurma.findIndex((aluno) => aluno.id==registro.aluno_turma.id);
              if (searchIndex >= 0) {
                _alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
                _alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
                _alunosTurma[searchIndex].id_registro = registro.id;
                _alunosTurma[searchIndex].id_habilidades_registro_aprendizagem = idHabilidadesRegistroAprendizagem; 
              }
          });
          setAlunosTurma(_alunosTurma);
          prep.onTrue();
        } else {
          const _alunosTurma = (novaTurma.turmas_alunos == undefined) ? [] : novaTurma.turmas_alunos;
          const mapHabilidades = [];
          for (var i = 0; i < habilidade_turma.length; i++) {
            mapHabilidades[habilidade_turma[i].id] = '';
          }
          _alunosTurma.map(alunoTurma => {
            alunoTurma.mapHabilidades = mapHabilidades;
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
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar nova Avaliação Diagnóstica"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Avaliações Diagnósticas',
            href: paths.dashboard.registro_aprendizagem.root_diagnostico,
          },
          { name: 'Avaliação Diagnóstica - ' + `${periodo}` },
        ]}
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
