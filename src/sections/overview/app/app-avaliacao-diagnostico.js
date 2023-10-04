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
import ChartColumnStacked from 'src/sections/_examples/extra/chart-view/chart-column-stacked';


export default function AppAvaliacaoDiagnostico({ title, subheader, list, ...other }) {


    const categorie =  [
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
        'H7'
    ]

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
            colors: ['#fff'],
            show: true,
        },
        xaxis: {
            categories: categorie,
        }
        
    });



    return ( 
        <Card {...other}>
            <CardHeader title={title} subheader={subheader} />
            <Scrollbar>
                <ChartColumnStacked 
                    series={[
                        { name: 'Desenvolvida', data: [3, 1, 2, 8, 1, 4, 5], stack: 'A', title: '',label: 'Desenvolvida' ,color: '#00E8B1', },
                        { name: 'Parcialmente Desenvolvida', data: [0, 4, 1, 7, 8, 1, 2], stack: 'B', label: 'Parcialmente Desenvolvida', color: '#FFD100' },
                        { name: 'Não Desenvolvida', data: [3, 4, 1, 7, 8, 1, 2], stack: 'C', label: 'Não Desenvolvida', color: '#FF1535' },
                    ]} 
                    options={chartOptions} 
                    width={86}
                    height={16}
                />
            </Scrollbar>
        </Card>
    );
}

AppAvaliacaoDiagnostico.propTypes = {
    list: PropTypes.array,
    subheader: PropTypes.string,
    title: PropTypes.string,
};