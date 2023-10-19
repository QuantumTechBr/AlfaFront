import PropTypes from 'prop-types';
import { useCallback } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';
// utils
import uuidv4 from 'src/utils/uuidv4';
import { fTimestamp } from 'src/utils/format-time';
// api
import { createEvent, updateEvent, deleteEvent } from 'src/api/calendar';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSwitch } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function CalendarForm({ currentEvent, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  console.table(currentEvent);

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Título é obrigatório'),
    tipo: Yup.string(),
    allDay: Yup.boolean(),
    start: Yup.mixed(),
    end: Yup.mixed(),
    description: Yup.string().max(5000, 'Máximo de 5000 caracteres'),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: currentEvent,
  });

  const {
    reset,
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = values.start && values.end ? values.start > values.end : false;

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      id: currentEvent?.id ? currentEvent?.id : null, // uuidv4()
      title: data?.title,
      tipo: data?.tipo,
      allDay: data?.allDay,
      end: data?.end,
      start: data?.start,
      description: data?.description,
    };

    try {
      if (!dateError) {
        if (currentEvent?.id) {
          await updateEvent(eventData);
          enqueueSnackbar('Update success!');
        } else {
          await createEvent(eventData);
          enqueueSnackbar('Create success!');
        }
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  });

  const onDelete = useCallback(async () => {
    try {
      await deleteEvent(`${currentEvent?.id}`);
      enqueueSnackbar('Delete success!');
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ px: 3 }}>
        <RHFTextField name="title" label="Título" />
        <RHFTextField name="tipo" label="Tipo" />

        <RHFSwitch name="allDay" label="Dia todo" />

        <Stack direction="row" alignItems="center" spacing={1}>
          <Controller
            name="start"
            control={control}
            render={({ field }) => (
              <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                {values.allDay && (
                  <MobileDatePicker
                    {...field}
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      console.log(newValue);
                      if (newValue) {
                        field.onChange(fTimestamp(newValue));
                        if (!values.end) setValue('end', newValue);
                      }
                    }}
                    label="Data de início"
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                )}

                {!values.allDay && (
                  <MobileDateTimePicker
                    {...field}
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      if (newValue) {
                        field.onChange(fTimestamp(newValue));
                        if (!values.end) setValue('end', newValue);
                      }
                    }}
                    label="Data e hora de início"
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              </LocalizationProvider>
            )}
          />

          <Controller
            name="end"
            control={control}
            render={({ field }) => (
              <LocalizationProvider adapterLocale={ptBR} dateAdapter={AdapterDateFns}>
                {values.allDay && (
                  <MobileDatePicker
                    {...field}
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      if (newValue) {
                        field.onChange(fTimestamp(newValue));
                      }
                    }}
                    label="Data de término"
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: dateError,
                        helperText: dateError && 'Data de término deve ser após a data de início',
                      },
                    }}
                  />
                )}

                {!values.allDay && (
                  <MobileDateTimePicker
                    {...field}
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      if (newValue) {
                        field.onChange(fTimestamp(newValue));
                      }
                    }}
                    label="Data e hora de término"
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: dateError,
                        helperText: dateError && 'Data de término deve ser após a data de início',
                      },
                    }}
                  />
                )}
              </LocalizationProvider>
            )}
          />
        </Stack>

        <RHFTextField name="description" label="Descrição" multiline rows={4} />
      </Stack>

      <DialogActions>
        {!!currentEvent?.id && (
          <Tooltip title="Apagar evento">
            <IconButton onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
        >
          Salvar
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

CalendarForm.propTypes = {
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
};
