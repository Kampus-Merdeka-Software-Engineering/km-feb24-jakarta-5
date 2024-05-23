//hamburger menu
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

//interactive card and dashboard
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');
    const netProfitElement = document.getElementById('netProfit');
    const revenueElement = document.getElementById('revenue');
    const costElement = document.getElementById('cost');
    const orderElement = document.getElementById('order');
    const chartCanvas = document.getElementById('profitchartbyyear');
    const pieChartCanvas = document.getElementById('pie-chart');
    const ctx = chartCanvas.getContext('2d');
    const pieCtx = pieChartCanvas.getContext('2d');
    let chart;
    let pieChart;

    // Fetch the JSON data
    fetch('dataset.json')
        .then(response => response.json())
        .then(data => {
            // Initial rendering
            updateDashboard(data);
            drawChart(data);
            drawPieChart(data);

            // Add event listeners for each filter
            filterForm.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', function() {
                    const filteredData = filterData(data);
                    updateDashboard(filteredData);
                    redrawChart(filteredData);
                    redrawPieChart(filteredData);
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

    // Function to format numbers to millions
    function formatNumberToMillions(num) {
        if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        }
        return num.toFixed(2);
    }

    // Function to update the dashboard with filtered data
    function updateDashboard(data) {
        const totalProfit = data.reduce((sum, item) => sum + item.Profit, 0);
        const totalRevenue = data.reduce((sum, item) => sum + item.Revenue, 0);
        const totalCost = data.reduce((sum, item) => sum + item.Cost, 0);
        const totalOrders = data.reduce((sum, item) => sum + item.Order_Quantity, 0);

        netProfitElement.textContent = formatNumberToMillions(totalProfit);
        revenueElement.textContent = formatNumberToMillions(totalRevenue);
        costElement.textContent = formatNumberToMillions(totalCost);
        orderElement.textContent = totalOrders;
    }

    // Function to draw the initial line chart
    function drawChart(data) {
        const year = document.getElementById('year').value;
        const chartData = year ? getMonthlyAverageData(data, year) : getYearlyAverageData(data);
        const chartTitle = year ? 'Profit Chart by Month' : 'Profit Chart by Year';
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
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 24
                    },
                    color: '#153448'
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
                    borderWidth: 3, // Set the width of the line
                    tension: 0.1,
                    pointRadius: 6, // Set the size of the points
                    pointHoverRadius: 8 // Set the size of the points on hover
                }]
            },
            options: options
        };
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, config);
    }

    // Function to redraw the line chart with filtered data
    function redrawChart(data) {
        const year = document.getElementById('year').value;
        const chartData = year ? getMonthlyAverageData(data, year) : getYearlyAverageData(data);
        const chartTitle = year ? 'Profit Chart by Month' : 'Profit Chart by Year';
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
            chart.options.plugins.title.text = chartTitle;
            chart.update();
        } else {
            drawChart(data);
        }
    }

    // Function to draw the initial pie chart
    function drawPieChart(data) {
        const pieChartData = getPieChartData(data);
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Orders by Category',
                    font: {
                        size: 24
                    },
                    color: '#153448'
                }
            }
        };
        const config = {
            type: 'pie',
            data: {
                labels: pieChartData.labels,
                datasets: [{
                    data: pieChartData.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: options
        };
        if (pieChart) {
            pieChart.destroy();
        }
        pieChart = new Chart(pieCtx, config);
    }

    // Function to redraw the pie chart with filtered data
    function redrawPieChart(data) {
        const pieChartData = getPieChartData(data);
        if (pieChart) {
            pieChart.data.labels = pieChartData.labels;
            pieChart.data.datasets[0].data = pieChartData.data;
            pieChart.update();
        } else {
            drawPieChart(data);
        }
    }

    // Function to get pie chart data based on filtered data
    function getPieChartData(data) {
        const subCategoryData = {};
        data.forEach(item => {
            const subCategory = item.Sub_Category;
            if (!subCategoryData[subCategory]) {
                subCategoryData[subCategory] = 0;
            }
            subCategoryData[subCategory] += item.Order_Quantity;
        });

        return {
            labels: Object.keys(subCategoryData),
            data: Object.values(subCategoryData)
        };
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


    