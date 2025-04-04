import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import Chart, { useChart } from 'src/components/chart';
import ChartColumnStacked from 'src/sections/overview/app/chart-column-stacked';


export default function AppAvaliacaoDiagnostico({ title, subheader, list, ...other }) {

    const chartOptions = useChart({

        chart: {
            type: 'bar',
            stacked: true,
            stackType: '100%',
            zoom: {
                enabled: false,
            },
        },
        legend: {
            itemMargin: {
                horizontal: 10,
            },
            horizontalAlign: 'left',
            position: 'bottom',
            offsetY: 0,
        },
        plotOptions: {
            bar: {
                columnWidth: '100%',
                horizontal: true,

            },
        },
        stroke: {
            width: 1,
            colors: ['#FFF'],
            show: false,
        },
        xaxis: {
            categories: list.categorie ?? [],
        }
        
    });

    return ( 
        <Card {...other}>
            <CardHeader title={title} subheader={subheader} />
            <Scrollbar>
                <ChartColumnStacked 
                    series={list.series ?? []} 
                    options={chartOptions} 
                    width={86}
                    height={16}
                />
            </Scrollbar>
        </Card>
    );
}

AppAvaliacaoDiagnostico.propTypes = {
    list: PropTypes.object,
    subheader: PropTypes.string,
    title: PropTypes.string,
};