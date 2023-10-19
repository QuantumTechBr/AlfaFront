'use client';

import Calendar from '@fullcalendar/react'; // => request placed at the top
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
//
import { useState, useEffect, useCallback, useContext } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
// utils
import { fTimestamp } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// _mock
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
// api
import { updateEvent, useGetEvents } from 'src/api/calendar';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import { useCalendar, useEvent } from '../hooks';
import { StyledCalendar } from '../styles';
import CalendarForm from '../calendar-form';
import CalendarToolbar from '../calendar-toolbar';
import CalendarFilters from '../calendar-filters';
import CalendarFiltersResult from '../calendar-filters-result';
import { AnosLetivosContext } from 'src/sections/ano_letivo/context/ano-letivo-context';



// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function CalendarView() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const smUp = useResponsive('up', 'sm');

  const openFilters = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const { calendarEvents, eventsLoading } = useGetEvents();
  const [events, setEvents] = useState([]);

  const { anosLetivos, buscaAnosLetivos } = useContext(AnosLetivosContext);

  useEffect(() => {
    let fullEvents = calendarEvents ?? [];

    // ANOS
    if(!!anosLetivos){
      anosLetivos.forEach(anoLetivo => {
        // console.table(anoLetivo);
        fullEvents.push(
          {
            id: `anoLetivo_data_inicio_${anoLetivo.id}`,
            editavel: false,
            title: `Início do ano letivo ${anoLetivo.ano}`,
            tipo: 'Ano letivo',
            allDay: true,
            start: new Date(anoLetivo.data_inicio),
            end: new Date(anoLetivo.data_inicio),
            description: '',
            // COLOR
            color: CALENDAR_COLOR_OPTIONS[3],
            textColor: CALENDAR_COLOR_OPTIONS[3],

          }
        );
        fullEvents.push(
          {
            id: `anoLetivo_data_fim_${anoLetivo.id}`,
            editavel: false,
            title: `Fim do ano letivo ${anoLetivo.ano}`,
            tipo: 'Ano Letivo',
            allDay: true,
            start: new Date(anoLetivo.data_fim),
            end: new Date(anoLetivo.data_fim),
            description: '',
            // COLOR
            color: CALENDAR_COLOR_OPTIONS[3],
            textColor: CALENDAR_COLOR_OPTIONS[3],
          }
        );
      });
    }
    

    console.table(fullEvents);
    setEvents(fullEvents);
  }, [calendarEvents, anosLetivos]);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  } = useCalendar();

  const currentEvent = useEvent(events ?? [], selectEventId, selectedRange, openForm);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  useEffect(() => {
    buscaAnosLetivos();
  }, [buscaAnosLetivos]);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const canReset = !!filters.colors.length || (!!filters.startDate && !!filters.endDate);

  const dataFiltered = applyFilter({
    inputData: events,
    filters,
    dateError,
  });

  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      onFilters={handleFilters}
      //
      canReset={canReset}
      onResetFilters={handleResetFilters}
      //
      results={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  return (
    <>
      <Container maxWidth="none">
        {canReset && renderResults}

        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              loading={eventsLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenForm={onOpenForm}
              onOpenFilters={openFilters.onTrue}
            />

            <Calendar
              weekends
              editable={false}
              droppable={false}
              selectable={true}
              locales={[ptBrLocale]}
              locale={'pt-br'}
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={new Date()}
              initialView={view}
              dayMaxEventRows={5}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              height={smUp ? 'calc(100vh - 175px)' : 'auto'}
              eventDrop={(arg) => {
                return false;
                onDropEvent(arg, updateEvent);
              }}
              eventResize={(arg) => {
                return false;
                onResizeEvent(arg, updateEvent);
              }}
              plugins={[
                multiMonthPlugin,
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              views={{
                multiTwoMonthYear: {
                  type: 'multiMonthYear',
                  multiMonthMaxColumns: 2,
                },
              }}
            />
          </StyledCalendar>
        </Card>
      </Container>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Editar evento' : 'Adicionar evento'}</>}
        </DialogTitle>

        <CalendarForm currentEvent={currentEvent} onClose={onCloseForm} />
      </Dialog>

      <CalendarFilters
        open={openFilters.value}
        onClose={openFilters.onFalse}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        canReset={canReset}
        onResetFilters={handleResetFilters}
        //
        dateError={dateError}
        //
        events={events}
        colorOptions={CALENDAR_COLOR_OPTIONS}
        onClickEvent={onClickEventInFilters}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters, dateError }) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (event) =>
          fTimestamp(event.start) >= fTimestamp(startDate) &&
          fTimestamp(event.end) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
