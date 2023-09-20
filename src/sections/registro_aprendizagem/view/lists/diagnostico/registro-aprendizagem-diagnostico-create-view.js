'use client';
import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import { TurmasContext } from '../../../../turma/context/turma-context'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import RegistroAprendizagemDiagnosticoNewEditForm from '../../form/diagnostico/registro-aprendizagem-diagnostico-new-edit-form';
import { useState, useContext, useEffect, useCallback } from 'react';
import habilidadeMethods from '../../../../habilidade/habilidade-repository';
import registroAprendizagemMethods from 'src/sections/registro_aprendizagem/registro-aprendizagem-repository';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemDiagnosticoCreateView({ turma, periodo }) {
  const settings = useSettingsContext();
  const {turmas, buscaTurmas, buscaTurmaPorId} = useContext(TurmasContext);
  const [_turma, setTurma] = useState(turma);
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [todasHabilidades, setTodasHabilidades] = useState([]);
  const [registrosAprendizagemTurma, setRegistrosAprendizagemTurma] = useState([]);

  useEffect(() => {
    habilidadeMethods.getAllHabilidades().then(habilidadesRetorno =>{
      setTodasHabilidades(habilidadesRetorno.data)
      let habilidade_turma = habilidadesRetorno.data.filter((habilidade) => String(habilidade.ano_escolar) == String(_turma.ano_escolar));
      setHabilidades(habilidade_turma);
      if(_turma.aluno_turma){
        registroAprendizagemMethods.getRegistroAprendizagemDiagnosticoByTurmaId(_turma.id).then(registros => {
          const registrosAprendizagemTurma = registros.data.filter((registro) => registro.periodo == periodo);
          // alunosTurma.forEach(alunoTurma => {
          //   const habilidadesRegistroAprendizagem = registros.data.filter(registro => registro.aluno_turma.id == alunoTurma.id)
          //   console.log('habilidades', habilidadesRegistroAprendizagem);
          //})
          setRegistrosAprendizagemTurma(registrosAprendizagemTurma)
          if (registrosAprendizagemTurma) {
            const alunosTurma = (_turma.aluno_turma == undefined) ? [] : _turma.aluno_turma;
            console.log('alunosTurma', alunosTurma)
            registrosAprendizagemTurma.forEach(registro => {
              let mapHabilidades = [];
              habilidade_turma.forEach(hab => {
                let encontrada = registro.habilidades_registro_aprendizagem.find((habReg) => {
                  return habReg.habilidade.id == hab.id;
                });
                if (encontrada){
                  mapHabilidades[encontrada.habilidade.id] = encontrada.nota
                }
              })
              const searchIndex = alunosTurma.findIndex((aluno) => aluno.id==registro.aluno_turma.id);
              alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
              alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
            });
            console.log(alunosTurma);
            setAlunosTurma(alunosTurma);
          } else {
            const alunosTurma = (_turma.aluno_turma == undefined) ? [] : _turma.aluno_turma;
            let mapHabilidades = [];
            for (var i = 0; i < habilidadesRetorno.data.length; i++) {
              mapHabilidades[habilidadesRetorno.data[i].id] = '';
            }
            alunosTurma.map(alunoTurma => {
              alunoTurma.mapHabilidades = mapHabilidades;
            });
            setAlunosTurma(alunosTurma);
          }
        })
      }
    });
  }, []);

  const handleTurma = useCallback(async (event) => {
    const novaTurma = event.target.value;
    setTurma(event.target.value);
    const novaTodasHabilidades = await habilidadeMethods.getAllHabilidades();
    let habilidade_turma = novaTodasHabilidades.data.filter((habilidade) => String(habilidade.ano_escolar) == String(novaTurma.ano_escolar));
    setHabilidades(habilidade_turma);
    if(novaTurma.aluno_turma){
      await registroAprendizagemMethods.getRegistroAprendizagemDiagnosticoByTurmaId(novaTurma.id).then(registros => {
        const novoRegistrosAprendizagemTurma = registros.data.filter((registro) => registro.periodo == periodo);
        // alunosTurma.forEach(alunoTurma => {
        //   const habilidadesRegistroAprendizagem = registros.data.filter(registro => registro.aluno_turma.id == alunoTurma.id)
        //   console.log('habilidades', habilidadesRegistroAprendizagem);
        //})
        setRegistrosAprendizagemTurma(novoRegistrosAprendizagemTurma)
        if (novoRegistrosAprendizagemTurma) {
          const alunosTurma = (novaTurma.aluno_turma == undefined) ? [] : novaTurma.aluno_turma;
          console.log('alunosTurma', alunosTurma)
          novoRegistrosAprendizagemTurma.forEach(registro => {
            let mapHabilidades = [];
            habilidade_turma.forEach(hab => {
              let encontrada = registro.habilidades_registro_aprendizagem.find((habReg) => {
                return habReg.habilidade.id == hab.id;
              });
              if (encontrada){
                mapHabilidades[encontrada.habilidade.id] = encontrada.nota
              }
            })
            const searchIndex = alunosTurma.findIndex((aluno) => aluno.id==registro.aluno_turma.id);
            alunosTurma[searchIndex].mapHabilidades = mapHabilidades;
            alunosTurma[searchIndex].promo_ano_anterior = registro.promo_ano_anterior;
          });
          console.log('set alunos turma:', alunosTurma);
          setAlunosTurma(alunosTurma);
        } else {
          const alunosTurma = (novaTurma.aluno_turma == undefined) ? [] : novaTurma.aluno_turma;
          let mapHabilidades = [];
          for (var i = 0; i < habilidade_turma.length; i++) {
            mapHabilidades[habilidade_turma[i].id] = '';
          }
          alunosTurma.map(alunoTurma => {
            alunoTurma.mapHabilidades = mapHabilidades;
          });
          setAlunosTurma(alunosTurma);
        }
      })
    }

  }, [_turma])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar nova Avaliação de Diagnóstico"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Avaliações de Diagnóstico',
            href: paths.dashboard.registro_aprendizagem.root_diagnostico,
          },
          { name: 'Avaliação de Diagnóstico - ' + `${periodo}` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <RegistroAprendizagemDiagnosticoNewEditForm turma={_turma} periodo={periodo} handleTurma={handleTurma} habilidades={habilidades} alunosTurma={alunosTurma} />
    </Container>
  );
}

RegistroAprendizagemDiagnosticoCreateView.propTypes = {
  turma: PropTypes.object,
  periodo: PropTypes.string,
};
