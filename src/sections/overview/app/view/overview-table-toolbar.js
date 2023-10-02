
import PropTypes from 'prop-types';

import { useEffect, useState, useCallback, useContext } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSettingsContext } from 'src/components/settings';
import turmaMethods from 'src/sections/turma/turma-repository';

// ----------------------------------------------------------------------

import { _ddzs, USER_STATUS_OPTIONS } from 'src/_mock';

export default function OverviewTableToolbar({
    filters,
    onFilters,
    ddzOptions,
    escolaOptions,
    turmaOptions,
}) {

    const handleFilterDdz = useCallback(
        (event) => {
            onFilters(
                'ddz',
                typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
            );
        },
        [onFilters]
    );

    const handleFilterEscola = useCallback(
        (event) => {
            onFilters(
                'escola',
                typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
            );
        },
        [onFilters]
    );

    const handleFilterTurma = useCallback(
        (event) => {
            onFilters(
                'turma',
                typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
            );
        },
        [onFilters]
    );

    const renderValueTurma = (selected) =>
        selected.map((turmaId) => {
            return turmaOptions.find((option) => option.id == turmaId)?.nome;
        }).join(', ');

    const renderValueEscola = (selected) =>
        selected.map((escolaId) => {
            console.log(escolaId);
            return escolaOptions.find((option) => option.id == escolaId)?.nome;
        }).join(', ');

    return ( 
        <>
            <Stack
                spacing={2}
                alignItems={{ xs: 'flex-end', md: 'center' }}
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
                sx={{
                    p: 2.5,
                    pr: { xs: 2.5, md: 1 },
                }}
            >
                <FormControl
                    sx={{
                        flexShrink: 0,
                        width: { xs: 1, md: 100 },
                    }}
                >
                    <InputLabel>DDZ</InputLabel>
                    <Select
                        multiple
                        value={filters.ddz}
                        onChange={handleFilterDdz}
                        input={<OutlinedInput label="DDZ" />}
                        renderValue={(selected) => selected.map((value) => value).join(', ')}
                        MenuProps={{
                            PaperProps: {
                                sx: { maxHeight: 240 },
                            },
                        }}
                    >
                        {ddzOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                <Checkbox disableRipple size="small" checked={filters.ddz.includes(option)} />
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl
                    sx={{
                        flexShrink: 0,
                        width: { xs: 1, md: 300 },
                    }}
                >
                    <InputLabel>Escola</InputLabel>

                    <Select
                        multiple
                        value={filters.escola}
                        onChange={handleFilterEscola}
                        input={<OutlinedInput label="Escola" />}
                        renderValue={renderValueEscola}
                        MenuProps={{
                            PaperProps: {
                                sx: { maxHeight: 240 },
                            },
                        }}
                    >
                        {escolaOptions?.map((escola) => (
                            <MenuItem key={escola.id} value={escola.id}>
                                <Checkbox disableRipple size="small" checked={filters.escola.includes(escola.id)} />
                                {escola.nome}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {turmaOptions && (
                <FormControl
                    sx={{
                        flexShrink: 0,
                        width: { xs: 1, md: 300 },
                    }}
                >
                    <InputLabel>Turma</InputLabel>
                
                   
                    <Select
                        multiple
                        value={turmaOptions}
                        onChange={handleFilterTurma}
                        input={<OutlinedInput label="Turma" />}
                        renderValue={renderValueTurma}
                        MenuProps={{
                            PaperProps: {
                                sx: { maxHeight: 240 },
                            },
                        }}
                    >
                        {turmaOptions?.map((turma) => (
                            <MenuItem key={turma.id} value={turma.id}>
                                <Checkbox disableRipple size="small" />
                                {turma.nome}
                            </MenuItem>
                        ))}
                    </Select>

                </FormControl>
                )}
             
            </Stack>


        </>
    );
}

OverviewTableToolbar.propTypes = {
    filters: PropTypes.object,
    onFilters: PropTypes.func,
    ddzOptions: PropTypes.array,
    turmaOptions: PropTypes.array,
    escolaOptions: PropTypes.array,
    turmaOptions: PropTypes.array,
};
