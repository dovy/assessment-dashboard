import ApexCharts from 'apexcharts';
import axios from 'axios';

async function handleIndexPage() {
    let data = {};
    const res = await axios.get('/api/all');
    data = res.data;

    const template = document.getElementById('clientRowTemplate').innerHTML;
    const tbody = document.querySelector('#clientTable tbody');

    if (typeof data === 'string') {
        data = data.replaceAll("'", '"');
        data = JSON.parse(data);
    }

    data.forEach(item => {
        let row = template;
        row = row.replaceAll('{{client_name}}', item.client_name);
        row = row.replaceAll('{{aws_account_id}}', item.aws_account_id);
        row = row.replaceAll('{{file_hash}}', item.file_hash);
        row = row.replaceAll('{{process}}', item.process);
        row = row.replaceAll('{{avg_duration}}', parseFloat(item.avg_duration).toFixed(1).toString()+'s');
        row = row.replaceAll('{{aws_region}}', item.aws_region);
        row = row.replaceAll('{{aws_account_id}}', item.aws_account_id);
        row = row.replaceAll('{{count}}', item.count);
        row = row.replaceAll('{{latest_timestamp}}', item.latest_timestamp);
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

const getMainChartOptions = (data) => {
    let mainChartColors = {}

    if (document.documentElement.classList.contains('dark')) {
        mainChartColors = {
            borderColor: '#374151',
            labelColor: '#9CA3AF',
            opacityFrom: 0,
            opacityTo: 0.15,
        };
    } else {
        mainChartColors = {
            borderColor: '#F3F4F6',
            labelColor: '#6B7280',
            opacityFrom: 0.45,
            opacityTo: 0,
        }
    }

    return {
        chart: {
            height: 220,
            type: 'area',
            fontFamily: 'Inter, sans-serif',
            foreColor: mainChartColors.labelColor,
            toolbar: {
                show: false
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                enabled: true,
                opacityFrom: mainChartColors.opacityFrom,
                opacityTo: mainChartColors.opacityTo
            }
        },
        dataLabels: {
            enabled: false
        },
        tooltip: {
            style: {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
            },
        },
        grid: {
            show: true,
            borderColor: mainChartColors.borderColor,
            strokeDashArray: 1,
            padding: {
                left: 35,
                bottom: 15
            }
        },
        series: [
            {
                name: 'f',
                data,
                color: '#72bf01',
            },

        ],
        markers: {
            size: 5,
            strokeColors: '#ffffff',
            hover: {
                size: undefined,
                sizeOffset: 3
            }
        },
        xaxis: {
            categories: ['Reception', 'Stage', 'Normalize'],
            labels: {

                style: {
                    colors: [mainChartColors.labelColor],
                    fontSize: '14px',
                    fontWeight: 500,

                },
                rotate: -90,  // Rotates labels 90 degrees counter-clockwise
            },
            axisBorder: {
                color: mainChartColors.borderColor,
            },
            axisTicks: {
                color: mainChartColors.borderColor,
            },
            crosshairs: {
                show: true,
                position: 'back',
                stroke: {
                    color: mainChartColors.borderColor,
                    width: 1,
                    dashArray: 10,
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: [mainChartColors.labelColor],
                    fontSize: '14px',
                    fontWeight: 500,
                },
                formatter: function (value) {
                    return value;
                }
            },
        },
        legend: {
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            labels: {
                colors: [mainChartColors.labelColor]
            },
            itemMargin: {
                horizontal: 10
            }
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    xaxis: {
                        labels: {
                            show: false,
                            rotate: -90,  // Rotates labels 90 degrees counter-clockwise
                        }
                    }
                }
            }
        ]
    };
}

const getBarChartOptions = (data) => {
    return {
        colors: ['#1A56DB', '#FDBA8C'],
        series: [
            {
                name: 'Seconds',
                color: '#72bf01',
                data
            }
        ],
        chart: {
            type: 'bar',
            height: 220,
            fontFamily: 'Inter, sans-serif',
            foreColor: '#4B5563',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                columnWidth: '90%',
                borderRadius: 3
            }
        },
        tooltip: {
            shared: false,
            intersect: false,
            style: {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
            },
        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 1
                }
            }
        },
        stroke: {
            show: true,
            width: 5,
            colors: ['transparent']
        },
        grid: {
            show: false
        },
        dataLabels: {
            enabled: true
        },

        legend: {
            show: false
        },
        xaxis: {
            floating: false,
            labels: {
                show: true
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
        },
        yaxis: {
            show: true,
            labels: {
                formatter: function (value) {

                    return value;
                }
            }
        },
        fill: {
            opacity: 1
        }
    };
}

async function handleDetailPage(clientName) {
    let data = {};
    const res = await axios.get(`/api/client?name=${encodeURIComponent(clientName)}`);
    data = res.data;

    let lambdaProfileData = {};
    console.log(data);
    const None = null;
    if (typeof data === 'string') {
        data = data.replaceAll("'", '"').replaceAll('None', 'null');
        data = JSON.parse(data);
    }

    if (data.stats.hasOwnProperty("lambda-profile")) {
        lambdaProfileData = data.stats['lambda-profile'].duration;
        const mainChartOptions = getMainChartOptions(lambdaProfileData);
        const mainChart = new ApexCharts(document.getElementById('main-chart'), mainChartOptions);
        mainChart.render();
    }

    const staticData = Object.keys(data.stats).map(key => {
        return {x: key, y: parseFloat(data.stats[key].avg_duration).toFixed(1)};
    });
    const staticOptions = getBarChartOptions(staticData);
    const statsChart = new ApexCharts(document.getElementById('stats-avg-duration-chart'), staticOptions);
    statsChart.render();

    const template = `<tr>
    <td class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
        {{timestamp_dt}}
    </td>
    <td class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
        <span>{{file_hash}}</span>
    </td>
    <td class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
        <span class="font-semibold">{{process}}</span>
    </td>
    <td class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
        {{avg_duration}}
    </td>
    <td class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
        <a href="https://{{aws_account_id}}.signin.aws.amazon.com/console" type="button" target="_blank"
           class="mb-4 sm:mb-0 mr-4 inline-flex text-green-200 items-center text-gray-900 border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> {{aws_account_id}} [{{aws_region}}] &nbsp;
             <img src="//localhost:1313/external-link.svg" class="svg" style="height:16px;" alt="" />
        </a>
    </td>
    <td class="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
        <a href="{{target_name}}" type="button" target="_blank"
           class="mb-4 sm:mb-0 mr-4 inline-flex text-green-200 items-center text-gray-900 border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
             <img src="//localhost:1313/external-link.svg" class="svg" style="height:16px;" alt="" />
        </a>
    </td>
</tr>`
    
    // document.getElementById('itemRowTemplate').innerHTML;
    const tbody = document.querySelector('#itemTable tbody');

    data.items.forEach(item => {
        let row = template;
        row = row.replace('{{avg_duration}}', parseFloat(item.avg_duration).toFixed(1).toString()+'s');
        row = row.replace('{{process}}', item.process);
        row = row.replaceAll('{{aws_account_id}}', item.aws_account_id);
        row = row.replace('{{aws_region}}', item.aws_region);
        row = row.replaceAll('{{file_hash}}', item.file_hash);
        row = row.replaceAll('{{target_name}}', item.target_name);
        row = row.replace('{{timestamp_dt}}', item.timestamp_dt);
        row = row.replace('{{target_name}}', item.target_name);
        tbody.insertAdjacentHTML('beforeend', row);
    });

    document.addEventListener('dark-mode', function () {
        mainChart.updateOptions(getMainChartOptions(lambdaProfileData));
        statsChart.updateOptions(getBarChartOptions(staticData));
    });
}

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(window.location);
    console.log(window.location.search);
    const clientName = urlParams.get('name');
    if (clientName) {
        console.log('Client name: ' + clientName);
        handleDetailPage(clientName);
    } else {
        console.log('index');
        if (document.getElementById('clientRowTemplate')) handleIndexPage();
    }
}

document.addEventListener('DOMContentLoaded', init);
