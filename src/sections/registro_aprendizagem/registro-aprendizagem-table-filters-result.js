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

export default function RegistroAprendizagemTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}) {

  const handleRemoveEscola = (inputValue) => {
    const newValue = filters.escola.filter((item) => item !== inputValue);
    onFilters('escola', newValue);
  };
  
  const handleRemoveTurma = (inputValue) => {
    const newValue = filters.turma.filter((item) => item !== inputValue);
    onFilters('turma', newValue);
  };

  const handleRemoveBimestre = (inputValue) => {
    const newValue = filters.bimestre.filter((item) => item !== inputValue);
    onFilters('bimestre', newValue);
  };
  
  const handleRemoveDisciplina = (inputValue) => {
    const newValue = filters.disciplina.filter((item) => item !== inputValue);
    onFilters('disciplina', newValue);
  };

  const handleRemoveNome = (inputValue) => {
    onFilters('nome', '');
  };
  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          resultados escontrados
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.nome && filters.nome !== '' && (
          <Block label="Nome:">
            <Chip size="small" label={filters.nome} onDelete={handleRemoveNome} />
          </Block>
        )}

        {!!filters.escola.length && (
          <Block label="Escola:">
            {filters.escola.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveEscola(item)} />
            ))}
          </Block>
        )}

        {!!filters.turma.length && (
          <Block label="Turma:">
            {filters.turma.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveTurma(item)} />
            ))}
          </Block>
        )}

        {filters.bimestre && !!filters.bimestre.length && (
          <Block label="Bimestre:">
            {filters.bimestre.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveBimestre(item)} />
            ))}
          </Block>
        )}

        {filters.disciplina && !!filters.disciplina.length && (
          <Block label="Disciplina:">
            {filters.disciplina.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveDisciplina(item)} />
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

RegistroAprendizagemTableFiltersResult.propTypes = {
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
