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

export default function ProfissionalTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  roleOptions,
  escolaOptions,
  ...other
}) {

  const funcoesSelecionadas = [];
  const escolasSelecionadas = [];

  roleOptions.map((funcao) => {
    if(filters.role?.includes(funcao.id)) {
      funcoesSelecionadas.push(funcao)
    }
  })

  escolaOptions.map((escola) => {
    if(filters.escola?.includes(escola.id)) {
      escolasSelecionadas.push(escola)
    }
  })

  const handleRemoveProfissional = (inputValue) => {
    onFilters('nome', '');
  };

  const handleRemoveRole = (inputValue) => {
    const newValue = filters.role.filter((item) => item !== inputValue);
    onFilters('role', newValue);
  };

  const handleRemoveEscola = (inputValue) => {
    const newValue = filters.escola.filter((item) => item !== inputValue);
    onFilters('escola', newValue);
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
        {/* {filters.status !== 'all' && (
          <Block label="Status:">
            <Chip size="small" label={filters.status} onDelete={handleRemoveStatus} />
          </Block>
        )} */}

        {filters.nome !== '' && (
          <Block label="Nome:">
            <Chip size="small" label={filters.nome} onDelete={handleRemoveProfissional} />
          </Block>
        )}

        {!!funcoesSelecionadas.length && (
          <Block label="Função:">
            {funcoesSelecionadas.map((item) => (
              <Chip key={item.id} label={item.nome} size="small" onDelete={() => handleRemoveRole(item.id)} />
            ))}
          </Block>
        )}

        {/* {!!filters.ddz.length && (
          <Block label="DDZ:">
            {filters.ddz.map((item) => (
              <Chip key={item} label={item} size="small" onDelete={() => handleRemoveDdz(item)} />
            ))}
          </Block>
        )} */}

          {!!filters.escola.length && (
          <Block label="Escola:">
            {escolasSelecionadas.map((item) => (
              <Chip key={item.id} label={item.nome} size="small" onDelete={() => handleRemoveEscola(item.id)} />
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

ProfissionalTableFiltersResult.propTypes = {
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
