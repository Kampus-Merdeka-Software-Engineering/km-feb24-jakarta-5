//humburger menu
const menu = document.querySelector('.menu');
const hamburger = document.querySelector('.hamburger');
const bars = document.querySelector('.icon-bars');
const close = document.querySelector('.icon-close');

hamburger.addEventListener('click',displayMenu);
menu.addEventListener('click',displayMenu);

//cross menu
function displayMenu(){
    if(menu.classList.contains('tampil')){
        menu.classList.remove('tampil');
        bars.style.display='inline';
        close.style.display='none';
    } else{
        menu.classList.add('tampil');
        bars.style.display='none';
        close.style.display='inline';
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');
    const netProfitElement = document.getElementById('netProfit');
    const revenueElement = document.getElementById('revenue');
    const costElement = document.getElementById('cost');
    const orderElement = document.getElementById('order');
    const chartCanvas = document.getElementById('profitchartbyyear');
    const ctx = chartCanvas.getContext('2d');
    let chart;

    // Fetch the JSON data
    fetch('dataset.json')
        .then(response => response.json())
        .then(data => {
            // Initial rendering
            updateDashboard(data);
            drawChart(data);

            // Add event listeners for each filter
            filterForm.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', function() {
                    const filteredData = filterData(data);
                    updateDashboard(filteredData);
                    redrawChart(filteredData);
                });
            });
        })
        .catch(error => console.error('Error loading the dataset:', error));

    // Function to filter data based on selected criteria
    function filterData(data) {
        const year = document.getElementById('year').value;
        const country = document.getElementById('countryType').value;
        const subcategory = document.getElementById('subcategory-filter').value;
        const gender = document.getElementById('gender').value;

        return data.filter(item => {
            return (year === "" || item.Year.toString() === year) &&
                   (!country || item.Country === country) &&
                   (!subcategory || item.Sub_Category === subcategory) &&
                   (!gender || item.Customer_Gender === gender);
        });
    }

    // Function to update the dashboard with filtered data
    function updateDashboard(data) {
        const totalProfit = data.reduce((sum, item) => sum + item.Profit, 0);
        const totalRevenue = data.reduce((sum, item) => sum + item.Revenue, 0);
        const totalCost = data.reduce((sum, item) => sum + item.Cost, 0);
        const totalOrders = data.reduce((sum, item) => sum + item.Order_Quantity, 0);

        netProfitElement.textContent = totalProfit.toFixed(2);
        revenueElement.textContent = totalRevenue.toFixed(2);
        costElement.textContent = totalCost.toFixed(2);
        orderElement.textContent = totalOrders;
    }

    // Function to draw the initial chart
    function drawChart(data) {
        const year = document.getElementById('year').value;
        const chartData = year ? getMonthlyAverageData(data, year) : getYearlyAverageData(data);
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: year ? {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM'
                        },
                        tooltipFormat: 'MMM yyyy'
                    } : {
                        unit: 'year',
                        displayFormats: {
                            year: 'yyyy'
                        },
                        tooltipFormat: 'yyyy'
                    },
                    title: {
                        display: true,
                        text: year ? 'Month' : 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Average Profit'
                    }
                }
            }
        };
        const config = {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Average Profit',
                    data: chartData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: options
        };
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, config);
    }

    // Function to redraw the chart with filtered data
    function redrawChart(data) {
        const year = document.getElementById('year').value;
        const chartData = year ? getMonthlyAverageData(data, year) : getYearlyAverageData(data);
        if (chart) {
            chart.data.datasets[0].data = chartData;
            chart.options.scales.x.time = year ? {
                unit: 'month',
                displayFormats: {
                    month: 'MMM'
                },
                tooltipFormat: 'MMM yyyy'
            } : {
                unit: 'year',
                displayFormats: {
                    year: 'yyyy'
                },
                tooltipFormat: 'yyyy'
            };
            chart.options.scales.x.title.text = year ? 'Month' : 'Year';
            chart.update();
        } else {
            drawChart(data);
        }
    }

    // Function to get yearly average profit data based on filtered data
    function getYearlyAverageData(data) {
        const yearlyData = {};
        data.forEach(item => {
            const year = item.Year;
            if (!yearlyData[year]) {
                yearlyData[year] = { sum: 0, count: 0 };
            }
            yearlyData[year].sum += item.Profit;
            yearlyData[year].count += 1;
        });

        // Generate chart data
        const chartData = [];
        for (let year in yearlyData) {
            chartData.push({
                x: year,
                y: yearlyData[year].sum / yearlyData[year].count
            });
        }
        return chartData;
    }

    // Function to get monthly average profit data based on filtered data for a specific year
    function getMonthlyAverageData(data, year) {
        const filteredData = data.filter(item => item.Year.toString() === year);

        // Calculate the monthly average profit
        const monthlyData = {};
        filteredData.forEach(item => {
            const date = new Date(item.Date);
            const month = date.getMonth(); // 0 (January) to 11 (December)
            if (!monthlyData[month]) {
                monthlyData[month] = { sum: 0, count: 0 };
            }
            monthlyData[month].sum += item.Profit;
            monthlyData[month].count += 1;
        });

        // Generate chart data with all months
        const chartData = [];
        for (let i = 0; i < 12; i++) {
            chartData.push({
                x: new Date(year, i),
                y: monthlyData[i] ? (monthlyData[i].sum / monthlyData[i].count) : 0
            });
        }

        return chartData;
    }
});
    