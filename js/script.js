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

//smooth scroll
document.addEventListener('DOMContentLoaded', (event) => {
    const menuLinks = document.querySelectorAll('nav .menu ul li a');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            window.scrollTo({
                top: targetElement.offsetTop - document.querySelector('nav').offsetHeight,
                behavior: 'smooth'
            });
        });
    });
});

//"Click Here to Explore"
document.addEventListener('DOMContentLoaded', function() {
    const exploreButton = document.querySelector('.button-xl');
    exploreButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = exploreButton.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        const navHeight = document.querySelector('nav').offsetHeight;
        window.scrollTo({
            top: targetElement.offsetTop - navHeight,
            behavior: 'smooth'
        });
    });
});


//interactive card and dashboard
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');
    const netProfitElement = document.getElementById('netProfit');
    const revenueElement = document.getElementById('revenue');
    const costElement = document.getElementById('cost');
    const orderElement = document.getElementById('order');
    const chartCanvas = document.getElementById('profitchartbyyear');
    const pieChartCanvas = document.getElementById('pie-chart');
    const ageHistogramCanvas = document.getElementById('age-histogram');
    const genderPieChartCanvas = document.getElementById('bar-chart');
    const ctx = chartCanvas.getContext('2d');
    const pieCtx = pieChartCanvas.getContext('2d');
    const genderPieCtx = genderPieChartCanvas.getContext('2d');
    const ageHistogramCtx = ageHistogramCanvas.getContext('2d');
    let chart;
    let pieChart;
    let genderPieChart;
    let ageHistogram;

    // Fetch the JSON data
    fetch('dataset.json')
        .then(response => response.json())
        .then(data => {
            // Initial rendering
            updateDashboard(data);
            drawChart(data);
            drawPieChart(data);
            drawGenderPieChart(data);
            drawAgeHistogram(data);

            // Add event listeners for each filter
            filterForm.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', function() {
                    const filteredData = filterData(data);
                    updateDashboard(filteredData);
                    redrawChart(filteredData);
                    redrawPieChart(filteredData);
                    redrawGenderPieChart(filteredData);
                    redrawAgeHistogram(filteredData);
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

    // Function to format numbers to millions or thousands
    function formatNumber(num) {
        if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    // Function to update the dashboard with filtered data
    function updateDashboard(data) {
        const totalProfit = data.reduce((sum, item) => sum + item.Profit, 0);
        const totalRevenue = data.reduce((sum, item) => sum + item.Revenue, 0);
        const totalCost = data.reduce((sum, item) => sum + item.Cost, 0);
        const totalOrders = data.reduce((sum, item) => sum + item.Order_Quantity, 0);

        netProfitElement.textContent = formatNumber(totalProfit);
        revenueElement.textContent = formatNumber(totalRevenue);
        costElement.textContent = formatNumber(totalCost);
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
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 0.6)',
                    ],
                    borderWidth: 3,
                    tension: 0.1,
                    pointRadius: 6,
                    pointHoverRadius: 8
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

    // Function to draw the initial age histogram
    function drawAgeHistogram(data) {
        const ageData = getAgeData(data);
        const labels = Object.keys(ageData);
        const ageValues = Object.values(ageData);

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Customers'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Number of Customers by Age',
                    font: {
                        size: 24
                    },
                    color: '#153448'
                }
            }
        };
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Customers',
                    data: ageValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 0.7)',
                    borderWidth: 1
                }]
            },
            options: options
        };
        if (ageHistogram) {
            ageHistogram.destroy();
        }
        ageHistogram = new Chart(ageHistogramCtx, config);
    }

    // Function to redraw the age histogram with filtered data
    function redrawAgeHistogram(data) {
        const ageData = getAgeData(data);
        const labels = Object.keys(ageData);
        const ageValues = Object.values(ageData);

        if (ageHistogram) {
            ageHistogram.data.labels = labels;
            ageHistogram.data.datasets[0].data = ageValues;
            ageHistogram.update();
        } else {
            drawAgeHistogram(data);
        }
    }

    // Function to draw the initial gender pie chart
    function drawGenderPieChart(data) {
        const genderProfitData = getGenderProfitData(data);
        console.log('Gender Profit Data:', genderProfitData); // Debugging log
        const labels = Object.keys(genderProfitData);
        const profitValues = Object.values(genderProfitData);

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Profit by Gender',
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
                labels: labels,
                datasets: [{
                    data: profitValues,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: options
        };
        if (genderPieChart) {
            genderPieChart.destroy();
        }
        genderPieChart = new Chart(genderPieCtx, config);
    }

    // Function to redraw the gender pie chart with filtered data
    function redrawGenderPieChart(data) {
        const genderProfitData = getGenderProfitData(data);
        console.log('Redrawing Gender Profit Data:', genderProfitData); // Debugging log
        const labels = Object.keys(genderProfitData);
        const profitValues = Object.values(genderProfitData);

        if (genderPieChart) {
            genderPieChart.data.labels = labels;
            genderPieChart.data.datasets[0].data = profitValues;
            genderPieChart.update();
        } else {
            drawGenderPieChart(data);
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

    // Function to get age data based on filtered data
    function getAgeData(data) {
        const ageData = {};
        data.forEach(item => {
            const age = item.Customer_Age;
            if (!ageData[age]) {
                ageData[age] = 0;
            }
            ageData[age] += 1;
        });
        return ageData;
    }
    
    // Function to get gender profit data based on filtered data
    function getGenderProfitData(data) {
        const genderProfitData = {};
        data.forEach(item => {
            const gender = item.Customer_Gender;
            const genderLabel = gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender;
            if (!genderProfitData[genderLabel]) {
                genderProfitData[genderLabel] = 0;
            }
            genderProfitData[genderLabel] += item.Profit;
        });
        console.log('Processed Gender Profit Data:', genderProfitData); // Debugging log
        return genderProfitData;
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
            const month = date.getMonth();
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

