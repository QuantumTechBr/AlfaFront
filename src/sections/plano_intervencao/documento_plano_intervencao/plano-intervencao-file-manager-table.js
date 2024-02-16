import PropTypes from 'prop-types';

import { useEffect, useState, useCallback } from 'react';
import FormProvider from 'src/components/hook-form';
// @mui
import { useTheme } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { tableCellClasses } from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';
// components
import Iconify from 'src/components/iconify';
import {
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
} from 'src/components/table';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'src/components/snackbar';
//
import PlanoIntervencaoFileManagerTableRow from './plano-intervencao-file-manager-table-row';
import documentoIntervencaoMethods from './documento-intervencao-repository';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nome' },
  { id: 'descricao', label: 'Descrição', width: 200 },
  { id: 'size', label: 'Tamanho', width: 120 },
  { id: 'type', label: 'Tipo', width: 120 },
  { id: 'modifiedAt', label: 'Modificado', width: 140 },
  // { id: 'shared', label: 'Compartilhar', align: 'right', width: 140 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function PlanoIntervencaoFileManagerTable({
  table,
  tableData,
  notFound,
  onDeleteRow,
  dataFiltered,
  onOpenConfirm,
}) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const registros = tableData.map(row => {
    const {id} = row;
    const {descricao} = row
    return {id: {descricao}}
  })

  const methods = useForm({
    defaultValues: {
      registros: registros
    },
  });

  const {
    dense,
    // page,
    order,
    orderBy,
    // rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    // onChangePage,
    // onChangeRowsPerPage,
  } = table;

  const {
    register,
    reset,
    resetField,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const formValues = watch();

  const denseHeight = dense ? 58 : 78;

  const onSubmit = handleSubmit(async (data) => {
   

    const mapaResultados = Object.keys(data.registros).map(async (idDocumento) => {
      const item = data.registros[idDocumento];
      if (!item.descricao ) {
        return
      }
      try {
        await documentoIntervencaoMethods.updateDocumentoById(idDocumento, item).catch((error) => {
          throw error;
        });
        enqueueSnackbar('Atualizado com sucesso!');
      } catch (error) {
        setErrorMsg('Erro de comunicação com a API de documentos de intervenção no momento de salvar o registro');
      }
    });
    
  });


  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
            {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            {!!warningMsg && <Alert severity="warning">{warningMsg}</Alert>}
        <Box
          sx={{
            position: 'relative',
            m: theme.spacing(-2, -3, -3, -3),
          }}
        >
          <TableSelectedAction
            dense={dense}
            numSelected={selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) =>
              onSelectAllRows(
                checked,
                tableData.map((row) => row.id)
              )
            }
            action={
              <Tooltip title="Delete">
                  <IconButton color="primary" onClick={onOpenConfirm}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
            }
            sx={{
              pl: 1,
              pr: 2,
              top: 16,
              left: 24,
              right: 24,
              width: 'auto',
              borderRadius: 1.5,
            }}
          />

          <TableContainer
            sx={{
              p: theme.spacing(0, 3, 3, 3),
            }}
          >
            <Table
              size={dense ? 'small' : 'medium'}
              sx={{
                minWidth: 960,
                borderCollapse: 'separate',
                borderSpacing: '0 16px',
              }}
            >
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={selected.length}
                onSort={onSort}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
                sx={{
                  [`& .${tableCellClasses.head}`]: {
                    '&:first-of-type': {
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                    },
                    '&:last-of-type': {
                      borderTopRightRadius: 12,
                      borderBottomRightRadius: 12,
                    },
                  },
                }}
              />

              <TableBody>
                {dataFiltered
                  // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <PlanoIntervencaoFileManagerTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                      onDeleteRow={() => onDeleteRow(row.id)}
                    />
                  ))}

                {/* <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                /> */}

                <TableNoData
                  notFound={notFound}
                  sx={{
                    m: -2,
                    borderRadius: 1.5,
                    border: `dashed 1px ${theme.palette.divider}`,
                  }}
                />
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Stack sx={{ mt: 3 }} direction="row" spacing={0.5} justifyContent="flex-end">
          <Grid alignItems="center" xs={3}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Salvar Descrição
            </LoadingButton>
          </Grid>
        </Stack>
      </FormProvider>

      {/* <TablePaginationCustom
        count={dataFiltered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        //
        dense={dense}
        onChangeDense={onChangeDense}
        sx={{
          [`& .${tablePaginationClasses.toolbar}`]: {
            borderTopColor: 'transparent',
          },
        }}
      /> */}
    </>
  );
}

PlanoIntervencaoFileManagerTable.propTypes = {
  dataFiltered: PropTypes.array,
  notFound: PropTypes.bool,
  onDeleteRow: PropTypes.func,
  onOpenConfirm: PropTypes.func,
  table: PropTypes.object,
  tableData: PropTypes.array,
};
