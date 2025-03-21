import ApexCharts from 'apexcharts';
import axios from 'axios';

async function handleIndexPage() {
    const res = await axios.get('/api/all');
    const data = res.data;

    // const data = [{
    //     "avg_duration": "181.86266152064005",
    //     "process": "lambda-profile",
    //     "aws_account_id": "122610477593",
    //     "aws_region": "us-east-1",
    //     "count": "3",
    //     "latest_timestamp": "2025-02-28 14:09:57.131",
    //     "client_name": "Example Corp"
    // }, {
    //     "avg_duration": "23.995896339416504",
    //     "process": "lambda-stage",
    //     "aws_account_id": "122610477593",
    //     "aws_region": "us-east-1",
    //     "count": "4",
    //     "latest_timestamp": "2025-02-28 14:04:55.395",
    //     "client_name": "Example Corp"
    // }];
    const template = document.getElementById('clientRowTemplate').innerHTML;
    const tbody = document.querySelector('#clientTable tbody');

    data.forEach(item => {
        let row = template;
        row = row.replaceAll('{{client_name}}', item.client_name);
        row = row.replace('{{process}}', item.process);
        row = row.replace('{{avg_duration}}', parseFloat(item.avg_duration).toFixed(1));
        row = row.replace('{{aws_region}}', item.aws_region);
        row = row.replace('{{aws_account_id}}', item.aws_account_id);
        row = row.replace('{{count}}', item.count);
        row = row.replace('{{latest_timestamp}}', item.latest_timestamp);
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
            show: true
        },
        fill: {
            opacity: 1
        }
    };
}

async function handleDetailPage(clientName) {
    const res = await axios.get(`/api/client?name=${encodeURIComponent(clientName)}`);
    let data = res.data.replace("'", '"');
    console.log('data', data);

    // const data = {"stats":{"lambda-profile":{"duration":[205.82486653327942,164.18754625320435,175.5755717754364],"avg_duration":181.86266152064005,"latest_hash":"6a5095ebefd1495ea5d98eadef9ad127","count":3,"latest_timestamp":"2025-02-28 14:09:57.131000","latest_target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/meta\/profile_athena\/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv"},"lambda-stage":{"duration":[4.812428712844849,2.067328453063965,84.43361020088196,4.670217990875244],"avg_duration":23.995896339416504,"latest_hash":"6a5095ebefd1495ea5d98eadef9ad127","count":4,"latest_timestamp":"2025-02-28 14:04:55.395000","latest_target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/landing\/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv"}},"items":[{"avg_duration":"205.82486653327942","process":"lambda-profile","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"5732b53c056240e2a149322cd856300b","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/meta\/profile_athena\/francis_test_12_20250227_5732b53c056240e2a149322cd856300b.csv","timestamp_dt":"2025-02-27 22:54:54.129","target_format":"csv"},{"avg_duration":"164.18754625320435","process":"lambda-profile","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"e5e3194748464d8eaed4f8e1452854cb","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/meta\/profile_athena\/care_credit_sample_20250601_20250227_e5e3194748464d8eaed4f8e1452854cb.csv","timestamp_dt":"2025-02-27 22:35:57.072","target_format":"csv"},{"avg_duration":"175.5755717754364","process":"lambda-profile","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"6a5095ebefd1495ea5d98eadef9ad127","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/meta\/profile_athena\/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv","timestamp_dt":"2025-02-28 14:09:57.131","target_format":"csv"},{"avg_duration":"4.812428712844849","process":"lambda-stage","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"e5e3194748464d8eaed4f8e1452854cb","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/landing\/care_credit_sample_20250601_20250227_e5e3194748464d8eaed4f8e1452854cb.csv","timestamp_dt":"2025-02-27 22:30:24.860","target_format":null},{"avg_duration":"2.067328453063965","process":"lambda-stage","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"ce5e5614ff3d4013834051bb9f1fa39e","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/landing\/care_credit_sample_20250602_20250227_ce5e5614ff3d4013834051bb9f1fa39e.csv","timestamp_dt":"2025-02-27 22:30:28.160","target_format":null},{"avg_duration":"84.43361020088196","process":"lambda-stage","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"5732b53c056240e2a149322cd856300b","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/landing\/francis_test_12_20250227_5732b53c056240e2a149322cd856300b.csv","timestamp_dt":"2025-02-27 22:48:42.394","target_format":null},{"avg_duration":"4.670217990875244","process":"lambda-stage","aws_account_id":"122610477593","aws_region":"us-east-1","file_hash":"6a5095ebefd1495ea5d98eadef9ad127","target_name":"s3:\/\/122610477593-us-east-1-dev1-examplecorp-processing\/landing\/banana_20250228_6a5095ebefd1495ea5d98eadef9ad127.csv","timestamp_dt":"2025-02-28 14:04:55.395","target_format":null}]};
    if (data.stats?.['lambda-profile'].length() != 0) {
        const lambdaProfileData = data.stats['lambda-profile'].duration;
        const mainChartOptions = getMainChartOptions(lambdaProfileData);
        const mainChart = new ApexCharts(document.getElementById('main-chart'), mainChartOptions);
        mainChart.render();
    }

    const staticData = Object.keys(data.stats).map(key => {
        return {x: key, y: data.stats[key].avg_duration}
    });
    const staticOptions = getBarChartOptions(staticData);
    const statsChart = new ApexCharts(document.getElementById('stats-avg-duration-chart'), staticOptions);
    statsChart.render();

    const template = document.getElementById('itemRowTemplate').innerHTML;
    const tbody = document.querySelector('#itemTable tbody');

    data.items.forEach(item => {
        let row = template;
        row = row.replace('{{process}}', item.process);
        row = row.replace('{{avg_duration}}', item.avg_duration);
        row = row.replace('{{aws_region}}', item.aws_region);
        row = row.replace('{{aws_account_id}}', item.aws_account_id);
        row = row.replace('{{timestamp_dt}}', item.timestamp_dt);
        tbody.insertAdjacentHTML('beforeend', row);
    });

    document.addEventListener('dark-mode', function () {
        mainChart.updateOptions(getMainChartOptions(lambdaProfileData));
        statsChart.updateOptions(getBarChartOptions(staticData));
    });
}

async function init() {
    if (document.getElementById('clientRowTemplate')) handleIndexPage();
    const urlParams = new URLSearchParams(window.location.search);
    const clientName = urlParams.get('name');
    if (clientName) {
        handleDetailPage(clientName);
    }

}

document.addEventListener('DOMContentLoaded', init);
