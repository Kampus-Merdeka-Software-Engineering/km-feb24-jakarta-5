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

//memanggil data json
async function fetchData(){
    const response = await fetch('data-bersih.json');
    const jsonData = await response.json();
    return jsonData;
}

// Fungsi untuk mengelompokkan profit per quantity berdasarkan country
function aggregateData(data) {
    const aggregatedData = {};
    data.forEach(item => {
        if (aggregatedData[item.Country]) {
            aggregatedData[item.Country] += item.Profit;
        } else {
            aggregatedData[item.Country] = item.Profit;
        }
    });
    
    return aggregatedData;
}

//membuat grafik
async function createChart() {
    const jsonData = await fetchData();
    const aggregatedData = aggregateData(jsonData);

    const countries = Object.keys(aggregatedData);
    const profits = countries.map(country => aggregatedData[country]);

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countries,
            datasets: [{
                label: 'Profit pe Country',
                data: profits,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Memanggil fungsi untuk membuat grafik
createChart();

// Fungsi untuk mengelompokkan profit berdasarkan tahun
function aggregateDataByYear(data) {
    const aggregatedData = {};

    data.forEach(item => {
        if (aggregatedData[item.Year]) {
            aggregatedData[item.Year] += item.Profit;
        } else {
            aggregatedData[item.Year] = item.Profit;
        }
    });

    return aggregatedData;
}

// Fungsi untuk membuat grafik dengan Chart.js
async function createChart2() {
    const jsonData = await fetchData();
    const aggregatedData = aggregateDataByYear(jsonData);

    const years = Object.keys(aggregatedData).sort();
    const profits = years.map(year => aggregatedData[year]);

    const ctx = document.getElementById('myChart2').getContext('2d');
    const myChart2 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Profit per Year',
                data: profits,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Memanggil fungsi untuk membuat grafik
createChart2();

// Fungsi untuk mengelompokkan profit berdasarkan sub-category
function aggregateDataBySubCategory(data) {
    const aggregatedData = {};

    data.forEach(item => {
        if (aggregatedData[item.Sub_Category]) {
            aggregatedData[item.Sub_Category] += item.Profit;
        } else {
            aggregatedData[item.Sub_Category] = item.Profit;
        }
    });

    return aggregatedData;
}

// Fungsi untuk membuat grafik Sub-Category vs Profit
async function createChart3() {
    const jsonData = await fetchData();
    const aggregatedData = aggregateDataBySubCategory(jsonData);

    const subCategories = Object.keys(aggregatedData);
    const profits = subCategories.map(subCategory => aggregatedData[subCategory]);

    const ctx = document.getElementById('myChart3').getContext('2d');
    const myChart3 = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: subCategories,
            datasets: [{
                label: 'Total Profit per Sub-Category',
                data: profits,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

// Memanggil fungsi untuk membuat grafik
createChart3();

// Fungsi untuk mengelompokkan profit berdasarkan age group
function aggregateDataByAgeGroup(data) {
    const aggregatedData = {};

    data.forEach(item => {
        if (aggregatedData[item.Age_Group]) {
            aggregatedData[item.Age_Group] += item.Profit;
        } else {
            aggregatedData[item.Age_Group] = item.Profit;
        }
    });

    return aggregatedData;
}

// Fungsi untuk membuat grafik Age Group vs Profit
async function createChart4() {
    const jsonData = await fetchData();
    const aggregatedData = aggregateDataByAgeGroup(jsonData);

    const ageGroups = Object.keys(aggregatedData);
    const profits = ageGroups.map(ageGroup => aggregatedData[ageGroup]);

    const ctx = document.getElementById('myChart4').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ageGroups,
            datasets: [{
                label: 'Total Profit per Age Group',
                data: profits,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

createChart4();

// Fungsi untuk mengelompokkan profit dan order quantity berdasarkan sub-category
function aggregateDataBySubCategoryWithOrders(data) {
    const aggregatedData = {};

    data.forEach(item => {
        if (!aggregatedData[item.Sub_Category]) {
            aggregatedData[item.Sub_Category] = { Profit: 0, Order_Quantity: 0, Profit_Per_Quantity: 0 };
        }
        aggregatedData[item.Sub_Category].Profit += item.Profit;
        aggregatedData[item.Sub_Category].Order_Quantity += item.Order_Quantity;
    });

    // Hitung profit per quantity
    for (const subCategory in aggregatedData) {
        aggregatedData[subCategory].Profit_Per_Quantity = 
            aggregatedData[subCategory].Profit / aggregatedData[subCategory].Order_Quantity;
    }

    return aggregatedData;
}

// Fungsi untuk membuat grafik Sub Category vs Profit per Quantity and Order Quantity
async function createChart5() {
    const jsonData = await fetchData();
    const aggregatedData = aggregateDataBySubCategoryWithOrders(jsonData);

    console.log("Aggregated Data:", aggregatedData); // Tambahkan ini untuk memastikan data benar

    const subCategories = Object.keys(aggregatedData);
    const profitsPerQuantity = subCategories.map(subCategory => aggregatedData[subCategory].Profit_Per_Quantity);
    const orderQuantities = subCategories.map(subCategory => aggregatedData[subCategory].Order_Quantity);

    console.log("Sub Categories:", subCategories); // Tambahkan ini untuk memastikan data benar
    console.log("Profits Per Quantity:", profitsPerQuantity); // Tambahkan ini untuk memastikan data benar
    console.log("Order Quantities:", orderQuantities); // Tambahkan ini untuk memastikan data benar

    const ctx = document.getElementById('myChart5').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subCategories,
            datasets: [
                {
                    label: 'Profit per Quantity',
                    data: profitsPerQuantity,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Order Quantity',
                    data: orderQuantities,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Memanggil fungsi untuk membuat grafik
createChart5();