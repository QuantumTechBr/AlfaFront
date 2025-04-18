import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AlunoTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  escolaOptions,
  turmaOptions,
  faseOptions,
  ...other
}) {

  const escolasSelecionadas = [];
  const turmasSelecionadas = [];
  const fasesSelecionadas = [];

  escolaOptions.map((escola) => {
    if(filters.escola?.includes(escola.id)) {
      escolasSelecionadas.push(escola)
    }
  })

  turmaOptions.map((turma) => {
    if(filters.turma?.includes(turma.id)) {
      turmasSelecionadas.push(turma)
    }
  })

  faseOptions.map((fase)=> {
    if(filters.fase?.includes(fase)) {
      fasesSelecionadas.push(fase)
    }    
  })

  const handleRemoveNome = (inputValue) => {
    onFilters('nome');
  };

  const handleRemoveMatricula = (inputValue) => {
    onFilters('matricula');
  };
  
  const handleRemoveEscola = (inputValue) => {
    const newValue = filters.escola.filter((item) => item !== inputValue);
    onFilters('escola', newValue);
  };

  const handleRemoveTurma = (inputValue) => {
    const newValue = filters.turma.filter((item) => item !== inputValue);
    onFilters('turma', newValue);
  };

  const handleRemoveFase = (inputValue) => {
    const newValue = filters.fase.filter((item) => item !== inputValue);
    onFilters('fase', newValue)
  }

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultados escontrados
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">

        {filters.nome !== '' && (
          <Block label="Nome:">
            <Chip size="small" label={filters.nome} onDelete={handleRemoveNome} />
          </Block>
        )}
        
        {filters.matricula !== '' && (
          <Block label="Matrícula:">
            <Chip size="small" label={filters.matricula} onDelete={handleRemoveMatricula} />
          </Block>
        )}

        {!!filters.escola.length && (
          <Block label="Escola:">
            {escolasSelecionadas.map((item) => (
              <Chip key={item.id} label={item.nome} size="small" onDelete={() => handleRemoveEscola(item.id)} />
            ))}
          </Block>
        )}

        {!!filters.turma.length && (
          <Block label="Turma:">
            {turmasSelecionadas.map((item) => (
              <Chip key={item.id} label={item.ano_escolar.concat('º ', item.nome)} size="small" onDelete={() => handleRemoveTurma(item.id)} />
            ))}
          </Block>
        )}

        {!!filters.fase.length && (
          <Block label="Fase:">
            {fasesSelecionadas.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveFase(item)} />
            ))}
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Limpar
        </Button>
      </Stack>
    </Stack>
  );
}

AlunoTableFiltersResult.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  results: PropTypes.number,
};

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
