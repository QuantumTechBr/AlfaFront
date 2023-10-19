import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { fDate } from 'src/utils/format-time';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Mês', icon: 'mingcute:calendar-month-line' },
  { value: 'listMonth', label: 'Agenda do mês', icon: 'fluent:calendar-agenda-24-regular' },
  { value: 'multiTwoMonthYear', label: 'Ano', icon: 'mingcute:calendar-line' },
  // { value: 'timeGridWeek', label: 'Semana', icon: 'mingcute:calendar-week-line' },
  // { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
];

// ----------------------------------------------------------------------

export default function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  onNextDate,
  onPrevDate,
  onChangeView,
  onOpenForm,
  onOpenFilters,
}) {
  const smUp = useResponsive('up', 'sm');

  const popover = usePopover();

  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >
        {smUp && (
          <Button
            size="small"
            color="inherit"
            onClick={popover.onOpen}
            startIcon={<Iconify icon={selectedItem.icon} />}
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
          >
            {selectedItem.label}
          </Button>
        )}

        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onPrevDate}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Typography variant="h6">
            {view === 'multiTwoMonthYear' ? fDate(date, 'yyyy') : fDate(date, 'MMMM yyyy')}
          </Typography>

          <IconButton onClick={onNextDate}>
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button size="small" color="error" variant="contained" onClick={onToday}>
            Hoje
          </Button>

          <IconButton onClick={onOpenFilters}>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>

          <Button
            size="small"
            color="primary"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onOpenForm}
          >
            Novo evento
          </Button>
        </Stack>

        {loading && (
          <LinearProgress
            color="inherit"
            sx={{ height: 2, width: 1, position: 'absolute', bottom: 0, left: 0 }}
          />
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-left"
        sx={{ width: 160 }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            selected={viewOption.value === view}
            onClick={() => {
              popover.onClose();
              onChangeView(viewOption.value);
            }}
          >
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

CalendarToolbar.propTypes = {
  date: PropTypes.object,
  loading: PropTypes.bool,
  onChangeView: PropTypes.func,
  onOpenForm: PropTypes.func,
  onNextDate: PropTypes.func,
  onOpenFilters: PropTypes.func,
  onPrevDate: PropTypes.func,
  onToday: PropTypes.func,
  view: PropTypes.oneOf(['dayGridMonth', 'listMonth', 'multiTwoMonthYear']),
};
