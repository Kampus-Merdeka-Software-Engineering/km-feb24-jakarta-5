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
    const exploreButton = document.querySelector('.button');
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
        const barStackCanvas = document.getElementById('bar-stack');
        const scatterChartCanvas = document.getElementById('scatter-chart');
        const dataTable = document.getElementById('dataTable');
        const paginationContainer = document.getElementById('pagination');
        const entriesSelect = document.getElementById('entriesSelect');
        const searchInput = document.getElementById('searchInput');

        const ctx = chartCanvas.getContext('2d');
        const pieCtx = pieChartCanvas.getContext('2d');
        const genderPieCtx = genderPieChartCanvas.getContext('2d');
        const ageHistogramCtx = ageHistogramCanvas.getContext('2d');
        const barStackCtx = barStackCanvas.getContext('2d');
        const scatterCtx = scatterChartCanvas.getContext('2d');

        let chart;
        let pieChart;
        let genderPieChart;
        let ageHistogram;
        let barStackChart;
        let scatterChart;
        let originalData = [];
        let filteredData = [];

        // Fetch the JSON data
        fetch('dataset.json')
        .then(response => response.json())
        .then(data => {
            originalData = data;
            filteredData = filterData(data);

            updateDashboard(filteredData);
            drawChart(filteredData);
            drawPieChart(filteredData);
            drawGenderPieChart(filteredData);
            drawAgeHistogram(filteredData);
            drawBarStackChart(filteredData);
            drawScatterChart(filteredData); 
            updateTable(filteredData);

            // Add event listeners for each filter
            filterForm.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', function() {
                    filteredData = filterData(originalData);
                    updateDashboard(filteredData);
                    redrawChart(filteredData);
                    redrawPieChart(filteredData);
                    redrawGenderPieChart(filteredData);
                    redrawAgeHistogram(filteredData);
                    redrawBarStackChart(filteredData);
                    redrawScatterChart(filteredData);
                    updateTable(filteredData);
                });
            });

            // Event listener for entries selection
            entriesSelect.addEventListener('change', function() {
                updateTable(filteredData);
            });

            // Event listener for search input
            searchInput.addEventListener('input', function() {
                filteredData = filterData(originalData);
                updateDashboard(filteredData);
                updateTable(filteredData, searchInput.value.toLowerCase()); // Menyediakan nilai searchTerm
            })
        })
        .catch(error => console.error('Error loading the dataset:', error));
        
        // Function to filter data based on selected criteria
        function filterData(data) {
            const year = document.getElementById('year').value;
            const country = document.getElementById('countryType').value;
            const subcategory = document.getElementById('subcategory-filter').value;
            const gender = document.getElementById('gender').value;
            const searchTerm = searchInput.value.toLowerCase();

            return data.filter(item => {
                const combinedString = `${item.Product} ${item.Product_Category} ${item.Sub_Category} ${item.Country}`.toLowerCase();
                return (year === "" || item.Year.toString() === year) &&
                    (!country || item.Country === country) &&
                    (!subcategory || item.Sub_Category === subcategory) &&
                    (!gender || item.Customer_Gender === gender) &&
                    combinedString.includes(searchTerm);
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
                            'rgba(54, 162, 235, 0.4)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 0.8)',
                        ],
                        borderWidth: 4,
                        tension: 0,
                        pointRadius: 6,
                        pointHoverRadius: 20
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
                        text: 'Histogram of Age Customers',
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
                type: 'doughnut',
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
            const genderProfitData = getGenderProfitData(data)
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

        // Function to draw the initial bar stack chart
        function drawBarStackChart(data) {
            const barStackData = getBarStackData(data);

            const options = {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Order Quantity'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Country'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Order Quantity by Country and Category',
                        font: {
                            size: 24
                        },
                        color: '#153448'
                    }
                }
            };

            const config = {
                type: 'bar',
                data: barStackData,
                options: options
            };

            if (barStackChart) {
                barStackChart.destroy();
            }
            barStackChart = new Chart(barStackCtx, config);
        }

        // Function to redraw the bar stack chart with filtered data
        function redrawBarStackChart(data) {
            const barStackData = getBarStackData(data);
            if (barStackChart) {
                barStackChart.data = barStackData;
                barStackChart.update();
            } else {
                drawBarStackChart(data);
            }
        }

        // Function to extract bar stack data
        function getBarStackData(data) {
            const subCategories = [...new Set(data.map(item => item.Sub_Category))];
            const countries = [...new Set(data.map(item => item.Country))];

            // Calculate total order quantity for each country and sub-category
            const totalOrderQuantities = {};
            subCategories.forEach(subCategory => {
                totalOrderQuantities[subCategory] = {};
                countries.forEach(country => {
                    const filteredData = data.filter(item => item.Country === country && item.Sub_Category === subCategory);
                    totalOrderQuantities[subCategory][country] = filteredData.reduce((sum, item) => sum + item.Order_Quantity, 0);
                });
            });

            // Sort total order quantity in descending order
            const sortedOrderQuantities = {};
            for (const subCategory in totalOrderQuantities) {
                sortedOrderQuantities[subCategory] = Object.entries(totalOrderQuantities[subCategory])
                    .sort(([, a], [, b]) => b - a)
                    .map(([country]) => country);
            }

            // Define predefined colors for each sub-category
            const colorPalette = {
                'Road Bikes': {
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)'
                },
                'Touring Bikes': {
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)'
                },
                'Mountain Bikes': {
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)'
                },
            };

            const datasets = subCategories.map(subCategory => {
                const color = colorPalette[subCategory] || { backgroundColor: getRandomColor(), borderColor: getRandomColor() }; // Fallback to random color if not predefined

                return {
                    label: subCategory,
                    data: sortedOrderQuantities[subCategory].map(country => {
                        const filteredData = data.filter(item => item.Country === country && item.Sub_Category === subCategory);
                        return filteredData.reduce((sum, item) => sum + item.Order_Quantity, 0);
                    }),
                    backgroundColor: color.backgroundColor, 
                    borderColor: color.borderColor, 
                    borderWidth: 1 
                };
            });

            return {
                labels: sortedOrderQuantities['Road Bikes'], 
                datasets: datasets
            };
        }

        // Function to draw the initial scatter chart
        function drawScatterChart(data) {
            const scatterData = getScatterChartData(data);
            const options = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Profit'
                        },
                        ticks: {
                            stepSize: 50, 
                            callback: function(value) {
                                return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total Order Quantity'
                        },
                        ticks: {
                            stepSize: 10
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Profit vs Total Order Quantity',
                        font: {
                            size: 24
                        },
                        color: '#153448'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = context.raw;
                                return `Profit: ${item.x.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}, Total Order Quantity: ${item.y}, Profit per Quantity: ${item.r.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
                            }
                        }
                    }
                }
            };

            const config = {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Scatter Dataset',
                        data: scatterData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 1
                    }]
                },
                options: options
            };

            if (scatterChart) {
                scatterChart.destroy();
            }
            scatterChart = new Chart(scatterCtx, config);
        }

        // Function to prepare scatter chart data including profit per quantity for bubble size
        function getScatterChartData(data) {
            const aggregatedData = {};
            data.forEach(item => {
                if (aggregatedData[item.Profit]) {
                    aggregatedData[item.Profit] += item.Order_Quantity;
                } else {
                    aggregatedData[item.Profit] = item.Order_Quantity;
                }
            });

            const scatterData = Object.keys(aggregatedData).map(profit => ({
                x: parseFloat(profit), 
                y: aggregatedData[profit],
                r: 10 
            }));

            return scatterData;
        }

        // Function to redraw the scatter chart with filtered data
        function redrawScatterChart(data) {
            const scatterData = getScatterChartData(data);
            if (scatterChart) {
                scatterChart.data.datasets[0].data = scatterData;
                scatterChart.update();
            } else {
                drawScatterChart(data);
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

            const chartData = [];
            for (let i = 0; i < 12; i++) {
                chartData.push({
                    x: new Date(year, i),
                    y: monthlyData[i] ? (monthlyData[i].sum / monthlyData[i].count) : 0
                });
            }

            return chartData;
        }

       // Function to update the table with the provided data
        function updateTable(data, searchTerm) {
            const rowsPerPage = parseInt(entriesSelect.value, 10);
            const productProfits = {};
            data.forEach(item => {
                const key = `${item.Product}_${item.Product_Category}_${item.Sub_Category}_${item.Country}`;
                if (!productProfits[key]) {
                    productProfits[key] = 0;
                }
                productProfits[key] += item.Profit;
            });

            const sortedProducts = Object.keys(productProfits)
                .map(key => ({
                    product: key.split('_')[0],
                    category: key.split('_')[1],
                    subCategory: key.split('_')[2],
                    country: key.split('_')[3],
                    totalProfit: productProfits[key]
                }))
                .sort((a, b) => b.totalProfit - a.totalProfit)
                .slice(0, 100);

            renderTable(sortedProducts, rowsPerPage, searchTerm);
        }

        // Function to render a paginated HTML table with search term highlighting
        function renderTable(data, rowsPerPage, searchTerm) {
            const pageCount = Math.ceil(data.length / rowsPerPage);

            function renderPage(page) {
                const start = (page - 1) * rowsPerPage;
                const end = start + rowsPerPage;
                const pageData = data.slice(start, end);

                dataTable.innerHTML = '';
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = '<th>No.</th><th>Product</th><th>Category</th><th>Sub Category</th><th>Country</th><th>Total Profit</th>';
                dataTable.appendChild(headerRow);

                pageData.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${start + index + 1}</td><td>${highlightSearchTerm(item.product, searchTerm)}</td><td>${highlightSearchTerm(item.category, searchTerm)}</td><td>${highlightSearchTerm(item.subCategory, searchTerm)}</td><td>${highlightSearchTerm(item.country, searchTerm)}</td><td>${formatCurrency(item.totalProfit, 'EUR')}</td>`;
                    dataTable.appendChild(row);
                });

                const allPageLinks = paginationContainer.querySelectorAll('.pagination-button');
                allPageLinks.forEach(link => link.classList.remove('active'));
                const currentPageLink = paginationContainer.querySelector(`.pagination-button[data-page="${page}"]`);
                if (currentPageLink) {
                    currentPageLink.classList.add('active');
                }
            }

            paginationContainer.innerHTML = '';
            for (let i = 1; i <= pageCount; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = '#';
                pageLink.textContent = i;
                pageLink.classList.add('pagination-button');
                pageLink.setAttribute('data-page', i);
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    renderPage(i);
                });
                paginationContainer.appendChild(pageLink);
            }

            renderPage(1);
        }
    
        // Function to format a number as a currency string
        function formatCurrency(num, currency) {
            return num.toLocaleString('de-DE', { style: 'currency', currency: currency });
        }

        // Function to highlight search keywords in table rows
        function highlightSearchTerm(text, searchTerm) {
            if (!searchTerm || searchTerm.trim() === '') {
                return text;
            }
            // Highlight search keywords in text with span tags
            const regex = new RegExp(searchTerm, 'gi');
            return text.replace(regex, `<span class="highlight">${searchTerm}</span>`);
        }
    });

// Function to change business insight per country
    function removeActive(){
        let buttonActive = document.querySelector('.button-ci-active');
        if (buttonActive){
            if (buttonActive.classList.contains('button-ci-active')){
                buttonActive.classList.remove('button-ci-active');
            }
        }  
        let visibleContent = document.querySelectorAll('.visible');
        if (visibleContent[0]){
            if (visibleContent[0].classList.contains('visible')){
                visibleContent[0].classList.add('hide');
                visibleContent[0].classList.remove('visible');
            }
        }
        if (visibleContent[1]){
            if (visibleContent[1].classList.contains('visible')){
                visibleContent[1].classList.add('hide');
                visibleContent[1].classList.remove('visible');
            }
        }  
    }

    function showOvr(){
        removeActive()
        const concOvr = document.querySelector('#conclusion-ovr');
        const recOvr = document.querySelector('#recommendations-ovr');
        buttonOvr.classList.add('button-ci-active')
        concOvr.classList.add('visible')
        recOvr.classList.add('visible')
        if (concOvr.classList.contains('hide')){
            concOvr.classList.remove('hide')
        }
        if (recOvr.classList.contains('hide')){
            recOvr.classList.remove('hide')
        }
    }

    function showUs(){
        removeActive()
        const concUs = document.querySelector('#conclusion-us');
        const recUs = document.querySelector('#recommendations-us');
        buttonUs.classList.add('button-ci-active')
        concUs.classList.add('visible')
        recUs.classList.add('visible')
        if (concUs.classList.contains('hide')){
            concUs.classList.remove('hide')
        }
        if (recUs.classList.contains('hide')){
            recUs.classList.remove('hide')
        }
    }

    function showUk(){
        removeActive()
        const concUk = document.querySelector('#conclusion-uk');
        const recUk = document.querySelector('#recommendations-uk');
        buttonUk.classList.add('button-ci-active')
        concUk.classList.add('visible')
        recUk.classList.add('visible')
        if (concUk.classList.contains('hide')){
            concUk.classList.remove('hide')
        }
        if (recUk.classList.contains('hide')){
            recUk.classList.remove('hide')
        }
    }

    function showAus(){
        removeActive()
        const concAus = document.querySelector('#conclusion-aus');
        const recAus = document.querySelector('#recommendations-aus');
        buttonAus.classList.add('button-ci-active')
        concAus.classList.add('visible')
        recAus.classList.add('visible')
        if (concAus.classList.contains('hide')){
            concAus.classList.remove('hide')
        }
        if (recAus.classList.contains('hide')){
            recAus.classList.remove('hide')
        }
    }

    function showGer(){
        removeActive()
        const concGer = document.querySelector('#conclusion-ger');
        const recGer = document.querySelector('#recommendations-ger');
        buttonGer.classList.add('button-ci-active')
        concGer.classList.add('visible')
        recGer.classList.add('visible')
        if (concGer.classList.contains('hide')){
            concGer.classList.remove('hide')
        }
        if (recGer.classList.contains('hide')){
            recGer.classList.remove('hide')
        }
    }

    function showFr(){
        removeActive()
        const concFr = document.querySelector('#conclusion-fr');
        const recFr = document.querySelector('#recommendations-fr');
        buttonFr.classList.add('button-ci-active')
        concFr.classList.add('visible')
        recFr.classList.add('visible')
        if (concFr.classList.contains('hide')){
            concFr.classList.remove('hide')
        }
        if (recFr.classList.contains('hide')){
            recFr.classList.remove('hide')
        }
    }

    function showCd(){
        removeActive()
        const concCd = document.querySelector('#conclusion-cd');
        const recCd = document.querySelector('#recommendations-cd');
        buttonCd.classList.add('button-ci-active')
        concCd.classList.add('visible')
        recCd.classList.add('visible')
        if (concCd.classList.contains('hide')){
            concCd.classList.remove('hide')
        }
        if (recCd.classList.contains('hide')){
            recCd.classList.remove('hide')
        }
    }

    const buttonOvr = document.querySelector('#button-ci-ovr');
    const buttonUs = document.querySelector('#button-ci-us');
    const buttonUk = document.querySelector('#button-ci-uk');
    const buttonAus = document.querySelector('#button-ci-aus');
    const buttonGer = document.querySelector('#button-ci-ger');
    const buttonFr = document.querySelector('#button-ci-fr');
    const buttonCd = document.querySelector('#button-ci-cd');

    buttonOvr.addEventListener('click',showOvr);
    buttonUs.addEventListener('click',showUs);
    buttonUk.addEventListener('click',showUk);
    buttonAus.addEventListener('click',showAus);
    buttonGer.addEventListener('click',showGer);
    buttonFr.addEventListener('click',showFr);
    buttonCd.addEventListener('click',showCd);
