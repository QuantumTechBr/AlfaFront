import * as React from 'react';
import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// _mock
import { RegistroAprendizagemFases } from 'src/_mock';

//
import { slugify } from 'src/utils/functions';

// ----------------------------------------------------------------------

export default function RegistroAprendizagemFaseFormTableRow({ id_avaliacao, row }) {
  const { aluno, resultado, observacao } = row;

  const [selectedValue, setSelectedValue] = React.useState(resultado);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };


  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'left' }}>{aluno.nome}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Checkbox
            checked={selectedValue === RegistroAprendizagemFases.pre_alfabetica}
            name={'fase-resultado_' + slugify(id_avaliacao + ' ' + aluno.nome)}
            onChange={handleChange}
            value={RegistroAprendizagemFases.pre_alfabetica}
            label=""
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: 28,
              },
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Checkbox
            checked={selectedValue === RegistroAprendizagemFases.alfabetica_parcial}
            name={'fase-resultado_' + slugify(id_avaliacao + ' ' + aluno.nome)}
            onChange={handleChange}
            value={RegistroAprendizagemFases.alfabetica_parcial}
            label=""
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: 28,
              },
            }}
          />
        </TableCell>
        
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Checkbox
            checked={selectedValue === RegistroAprendizagemFases.alfabetica_completa}
            name={'fase-resultado_' + slugify(id_avaliacao + ' ' + aluno.nome)}
            onChange={handleChange}
            value={RegistroAprendizagemFases.alfabetica_completa}
            label=""
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: 28,
              },
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Checkbox
            checked={selectedValue === RegistroAprendizagemFases.alfabetica_consolidada}
            name={'fase-resultado_' + slugify(id_avaliacao + ' ' + aluno.nome)}
            onChange={handleChange}
            value={RegistroAprendizagemFases.alfabetica_consolidada}
            label=""
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: 28,
              },
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Checkbox
            checked={selectedValue === RegistroAprendizagemFases.nao_avaliado}
            name={'fase-resultado_' + slugify(id_avaliacao + ' ' + aluno.nome)}
            onChange={handleChange}
            value={RegistroAprendizagemFases.nao_avaliado}
            label=""
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: 28,
              },
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{observacao}</TableCell>
      </TableRow>

    </>
  );
}

RegistroAprendizagemFaseFormTableRow.propTypes = {
  id_avaliacao: PropTypes.number,
  row: PropTypes.object,
};
