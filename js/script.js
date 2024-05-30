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

    const ctx = chartCanvas.getContext('2d');
    const pieCtx = pieChartCanvas.getContext('2d');
    const genderPieCtx = genderPieChartCanvas.getContext('2d');
    const ageHistogramCtx = ageHistogramCanvas.getContext('2d');
    const barStackCtx = barStackCanvas.getContext('2d');

    let chart;
    let pieChart;
    let genderPieChart;
    let ageHistogram;
    let barStackChart;


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
            drawBarStackChart(data);


            // Add event listeners for each filter
            filterForm.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', function() {
                    const filteredData = filterData(data);
                    updateDashboard(filteredData);
                    redrawChart(filteredData);
                    redrawPieChart(filteredData);
                    redrawGenderPieChart(filteredData);
                    redrawAgeHistogram(filteredData);
                    redrawBarStackChart(filteredData);
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
                text: 'Order Quantity by Country and Sub-Category',
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

// Function to extract bar stack data with sorted countries by total order quantity
function getBarStackData(data) {
    // Calculate total order quantity for each country
    const countryOrderQuantities = {};
    data.forEach(item => {
        if (!countryOrderQuantities[item.Country]) {
            countryOrderQuantities[item.Country] = 0;
        }
        countryOrderQuantities[item.Country] += item.Order_Quantity;
    });

    // Sort countries by total order quantity
    const sortedCountries = Object.keys(countryOrderQuantities).sort((a, b) => countryOrderQuantities[b] - countryOrderQuantities[a]);

    // Get unique sub-categories
    const subCategories = [...new Set(data.map(item => item.Sub_Category))];
    
    // Define a fixed color palette
    const colorPalette = {
        'Road Bikes': 'rgba(255, 99, 132, 1)',
        'Mountain Bikes': 'rgba(54, 162, 235, 1)',
        'Touring Bikes': 'rgba(255, 206, 86, 1)',
        // Add more colors as needed for each sub-category
    };

    // Debug: Log the sub-categories and their corresponding colors
    console.log('Sub-Categories:', subCategories);
    console.log('Color Palette:', colorPalette);

    // Create datasets for each sub-category
    const datasets = subCategories.map(subCategory => {
        const color = colorPalette[subCategory] || 'rgba(0, 0, 0, 1)'; // Fallback color for undefined sub-categories
        console.log(`Sub-Category: ${subCategory}, Color: ${color}`); // Debug: Log the assigned color

        return {
            label: subCategory,
            data: sortedCountries.map(country => {
                const filteredData = data.filter(item => item.Country === country && item.Sub_Category === subCategory);
                return filteredData.reduce((sum, item) => sum + item.Order_Quantity, 0);
            }),
            backgroundColor: color // Assign the predefined color
        };
    });

    return {
        labels: sortedCountries,
        datasets: datasets
    };
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

     // Function to extract bar stack data
     function getBarStackData(data) {
        const subCategories = [...new Set(data.map(item => item.Sub_Category))];
        const countries = [...new Set(data.map(item => item.Country))];
        
        const datasets = subCategories.map(subCategory => {
            return {
                label: subCategory,
                data: countries.map(country => {
                    const filteredData = data.filter(item => item.Country === country && item.Sub_Category === subCategory);
                    return filteredData.reduce((sum, item) => sum + item.Order_Quantity, 0);
                }),
                backgroundColor: getRandomColor()
            };
        });

        return {
            labels: countries,
            datasets: datasets
        };
    }

    // Helper function to get random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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

//pagination table
document.addEventListener('DOMContentLoaded', function() {
    // Memanggil elemen-elemen HTML yang diperlukan
    const dataTable = document.getElementById('dataTable');
    const paginationContainer = document.getElementById('pagination');

    // Memanggil dataset dari file JSON
    fetch('dataset.json')
        .then(response => response.json())
        .then(data => {
            // Memperbarui tabel ketika dataset tersedia
            updateTable(data);
        })
        .catch(error => console.error('Error loading the dataset:', error));

    // Fungsi untuk memperbarui tabel dengan data yang diberikan
    function updateTable(data) {
        // Menghitung total profit untuk setiap produk
        const productProfits = {};
        data.forEach(item => {
            const key = `${item.Product}_${item.Product_Category}_${item.Sub_Category}_${item.Country}`;
            if (!productProfits[key]) {
                productProfits[key] = 0;
            }
            productProfits[key] += item.Profit;
        });

        // Mengonversi objek productProfits menjadi array untuk diurutkan
        const sortedProducts = Object.keys(productProfits)
            .map(key => ({ product: key.split('_')[0], category: key.split('_')[1], subCategory: key.split('_')[2], country: key.split('_')[3], totalProfit: productProfits[key] })) // Memformat nominal profit
            .sort((a, b) => b.totalProfit - a.totalProfit)
            .slice(0, 100); // Mengambil 100 produk paling menguntungkan

        // Menampilkan data di dalam tabel
        renderTable(sortedProducts);
    }

    // Fungsi untuk menampilkan data dalam tabel dengan pagination
    function renderTable(data) {
        const rowsPerPage = 10; // Jumlah baris per halaman
        const pageCount = Math.ceil(data.length / rowsPerPage); // Jumlah halaman yang diperlukan

        // Fungsi untuk membuat halaman data
        function renderPage(page) {
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const pageData = data.slice(start, end);

            // Menghapus konten tabel sebelumnya
            dataTable.innerHTML = '';

            // Membuat header tabel
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = '<th>No.</th><th>Product</th><th>Product Category</th><th>Sub Category</th><th>Country</th><th>Total Profit</th>';
            dataTable.appendChild(headerRow);

            // Menambahkan baris untuk setiap produk
            pageData.forEach((product, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${start + index + 1}</td><td>${product.product}</td><td>${product.category}</td><td>${product.subCategory}</td><td>${product.country}</td><td>${formatNumber(product.totalProfit)}</td>`; // Menggunakan fungsi formatNumber untuk memformat nominal profit
                dataTable.appendChild(row);
            });
        }

        // Fungsi untuk membuat tombol halaman
        function renderPaginationButtons() {
            paginationContainer.innerHTML = '';
            for (let i = 1; i <= pageCount; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.addEventListener('click', () => renderPage(i));
                paginationContainer.appendChild(button);
            }
        }

        // Menampilkan halaman pertama saat pertama kali memuat tabel
        renderPage(1);

        // Menampilkan tombol pagination
        renderPaginationButtons();
    }

    // Fungsi untuk memformat nominal profit dengan titik
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
});


