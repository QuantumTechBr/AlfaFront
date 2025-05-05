import PropTypes from 'prop-types';
// @mui
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import VisualizaImportacao from './importacao-modal-visualiza-importacao';


// ----------------------------------------------------------------------

export default function ImportacaoTableRow({ row }) {
  const {
    descricao,
    status,
    created_at,
    updated_at,
  } = row;

  function formatarData(dataString) {
    // Cria um objeto Date a partir da string
    const data = new Date(dataString);
  
    // Extrai os componentes da data
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const segundos = data.getSeconds().toString().padStart(2, '0');
  
    // Concatena os componentes no formato desejado
    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
  }

  const data_criacao = created_at ? formatarData(created_at) : '';
  const data_atualizacao = updated_at ? formatarData(updated_at) : '';

  const visualizaImportacao = useBoolean(false);

  const closeVisualizaImportacao = (retorno = null) => {
    visualizaImportacao.onFalse();
  };

  const handleClickRow = () => {
    visualizaImportacao.onTrue();
  }

  return (
    <>
      <TableRow 
      onClick={handleClickRow}
      hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{descricao}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{status}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{data_criacao}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{data_atualizacao}</TableCell>
      </TableRow>
      <VisualizaImportacao open={visualizaImportacao.value} onClose={closeVisualizaImportacao} importacao={row}/>
    </>
  );
}

ImportacaoTableRow.propTypes = {
  row: PropTypes.object,
  quickEdit: PropTypes.func,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
