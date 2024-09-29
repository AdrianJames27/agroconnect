import { getCrop, getProduction, getPrice, getPest, getDisease, getProductions, addDownload, getUniqueCropNames} from './fetch.js';
import * as stats from './statistics.js';
import Dialog from '../management/components/helpers/Dialog.js';

$(document).ready(function() {
    $('#infoBtn').click(function() {
        let htmlScript = `
        <p>Welcome to our Seasonal Trends page. To effectively use this tool, follow these instructions:</p>

        <ol>
          <li><strong>Select Your Parameters:</strong><br>
          Use the dropdown menus and filters to choose the crops, seasons, or other criteria you wish to analyze.</li>

          <li><strong>View Trends:</strong><br>
          Explore the displayed charts and tables to see trends in crop production volumes, prices, income, and pest/disease occurrences etc.</li>

          <li><strong>Analyze Data:</strong><br>
          Utilize the provided data to observe patterns, compare different crops, and make strategic decisions for crop management.</li>

          <li><strong>Monitor Growth:</strong><br>
          Track the growth of selected crops and assess their performance over time to improve agricultural practices.</li>

          <li><strong>Download Data:</strong><br>
          You can download the data in various formats for further analysis:
            <ul>
              <li><strong>CSV:</strong> Download raw data in CSV format for use in spreadsheet applications or data analysis tools.</li>
              <li><strong>Excel:</strong> Download the data in Excel format, which includes formatted tables for easy review and manipulation.</li>
              <li><strong>PDF:</strong> Download charts and visualizations in PDF format for easy sharing and reporting.</li>
            </ul>
          </li>
        </ol>

        <p>This tool is designed to help you identify and monitor key agricultural trends, offering valuable insights into crop performance and market dynamics.</p>
        `;

        Dialog.showInfoModal(htmlScript);
    });

});

let downloadYR;

class SeasonalTrends {
    constructor(season, type, crops, category) {
        this.season = season;
        this.type = type;
        this.crops = crops; 
        this.category = category;        
    }

    generateTrends(dataset, label, keys) {
    if (!dataset.length) {
        return { lineChartConfig: null, barChartConfig: null }; // Return null configurations if the dataset is empty
    }

    // Extract unique seasons and years
    const uniqueSeasons = Array.from(new Set(dataset.map(entry => entry.season)));
    const season = uniqueSeasons[0] || 'Unknown'; // Use the first season from the dataset
    const uniqueYears = Array.from(new Set(dataset.map(entry => entry.monthYear.split(' ')[1]))).sort((a, b) => a - b);

    // Calculate year range
    const yearRange = uniqueYears.length === 1
        ? uniqueYears[0]
        : `${Math.min(...uniqueYears)}-${Math.max(...uniqueYears)}`;

    downloadYR = yearRange;

    const monthToNumber = {
        'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12
    };
    

    // Prepare data for line chart
    const monthlyLabels = Array.from(new Set(dataset.map(entry => entry.monthYear)))
    .sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        return yearA - yearB || monthToNumber[monthA] - monthToNumber[monthB];
    });

    const crops = Array.from(new Set(dataset.map(entry => entry.cropName)));

    const dataValues = crops.map(crop => {
        return {
            label: crop,
            data: monthlyLabels.map(monthYear => {
                const entry = dataset.find(e => e.cropName === crop && e.monthYear === monthYear);
                return entry ? entry[keys[0]] : 0;
            })
        };
    });

    const lineChartData = {
        datasets: dataValues
            .filter(dataset => dataset.data.some(value => value !== 0)) // Filter out datasets with only zero values
            .map(dataset => ({
                label: dataset.label,
                data: dataset.data.map((value, index) => ({
                    x: monthlyLabels[index], // Use the string labels as x values
                    y: value
                })),
                borderColor: '#007bff', // Color for the scatter points
                backgroundColor: 'rgba(72, 202, 228, 0.5)',
                pointRadius: 5, // Size of the points
            }))
    };
    const chartType = keys[0] === 'totalOccurrence' ? 'scatter' : 'line';
    
    const lineChartConfig = {
        type: chartType,
        data: lineChartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `${label} Trends (${season} Season)`
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const monthYear = lineChartData.datasets[tooltipItem.datasetIndex].data[index].x;
                            const monthlyData = dataset.filter(entry => entry.monthYear === monthYear);

                            return [
                                `${keys[0]}: ${lineChartData.datasets[tooltipItem.datasetIndex].data[index].y}`,
                                ...keys.slice(1).map(key => {
                                    if (["pestOccurrences", "diseaseOccurrences"].includes(key)) {
                                        let result = monthlyData.map((entry) => {
                                            return entry[key].map((item) => {
                                                // Use dynamic property name based on the key
                                                let name = key === "pestOccurrences" ? item.pestName : item.diseaseName;
                                                return `${name} : ${item.occurrence}`;
                                            }).join(', '); // Use comma and space for separation
                                        }).join(' | '); // Join entries with a separator for the tooltip
                                        
                                        return result;
                                    } else {
                                        const total = monthlyData.reduce((acc, entry) => acc + (entry[key] || 0), 0);
                                        return `${key}: ${total.toFixed(2)}`;
                                    }
                                })
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month Year'
                    },
                    type: 'category', // Change to 'category' for string labels
                },
                y: {
                    title: {
                        display: true,
                        text: label
                    }
                }
            }
        }
    };
    
    // Calculate averages per year for bar chart for a single crop
    const totalsPerYear = uniqueYears.map(year => {
        // Filter entries for the current year
        const filteredEntries = dataset.filter(entry => 
            entry.monthYear.endsWith(year) // No need to check cropName
        );


        // Calculate the sum and count of entries for each key
        const averages = keys.map(key => {
            if (["pestOccurrences", "diseaseOccurrences"].includes(key)) {
                let result = filteredEntries.map((entry) => {
                    return entry[key].map((item) => {
                        // Use dynamic property name based on the key
                        let name = key === "pestOccurrences" ? item.pestName : item.diseaseName;
                        return `${name} : ${item.occurrence}`;
                    }).join(', '); // Use comma and space for separation
                }).join(' | '); // Join entries with a separator for the tooltip
                
                return result;
            }            
            const { sum, count } = filteredEntries.reduce((acc, entry) => {
                acc.sum += entry[key];
                acc.count += 1;
                return acc;
            }, { sum: 0, count: 0 });

            // Return the average for the current key
            return count > 0 ? sum / count : 0;
        });

        return averages; // Returns an array of averages for each key
    });

    console.log(totalsPerYear);


    const barChartData = {
        labels: uniqueYears,
        datasets: crops.map((crop, index) => ({
            label: crop,
            data: totalsPerYear.map(yearTotals => yearTotals[index] || 0),
            backgroundColor:'#007bff',
            borderColor: '#007bff',
            borderWidth: 1
        }))
    };

    const barChartConfig = {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `${label} Per Year (${season} Season)`
                },
               tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const year = uniqueYears[index];
                            const averages = totalsPerYear[index];

                            return averages.map((average, avgIndex) => {
                                if (["pestOccurrences", "diseaseOccurrences", "totalOccurrence"].includes(keys[avgIndex])) {
                                    return `Average ${keys[avgIndex]} for ${year}: ${average}`;
                                }
                                return `Average ${keys[avgIndex]} for ${year}: ${average.toFixed(2)}`;
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: label
                    }
                }
            }
        }
    };
    
    return {
        lineChartConfig,
        barChartConfig
    };
}

 displayTrends(chartConfigs, interpretation) {
    // Check if a chart instance already exists and destroy it
    const line = Chart.getChart('seasonalTrendChart'); // Retrieve the existing chart instance
    const bar = Chart.getChart('totalPerYearChart');
    if (line) {
        line.destroy(); // Destroy the existing chart instance
        bar.destroy();
        $('#interpretation').empty();
    }

    // Create the line chart
    const lineChart = new Chart(
        document.getElementById('seasonalTrendChart'),
        {
            ...chartConfigs.lineChartConfig,
            options: {
                ...chartConfigs.lineChartConfig.options,
                responsive: true, // Ensure responsiveness
                maintainAspectRatio: false, // Allows better control of chart sizing
            },
        }
    );

    // Create the bar chart
    const barChart = new Chart(
        document.getElementById('totalPerYearChart'),
        {
            ...chartConfigs.barChartConfig,
            options: {
                ...chartConfigs.barChartConfig.options,
                responsive: true, // Ensure responsiveness
                maintainAspectRatio: false, // Allows better control of chart sizing
            },
        }
    );

    // Set interpretation text
    $('#interpretation').html(interpretation);

    // Handle window resize to re-render charts if necessary
    window.addEventListener('resize', function () {
        lineChart.resize();
        barChart.resize();
    });
}

}

let downloadData;
let printData;
let currentType;


// Function to update crop options based on type and season
async function updateCropOptions() {
    const type = $('#type').val().toLowerCase();
    const season = $('#season').val().toLowerCase();
    let options = '';

    try {
        const uniqueCropNames = await getUniqueCropNames(season, type);

        if (uniqueCropNames.length > 0) {
            options = uniqueCropNames.length > 0 
                ? uniqueCropNames.map(cropName => `<option value="${cropName}">${cropName.charAt(0).toUpperCase() + cropName.slice(1)}</option>`).join('')
                : '<option value="">No crops available</option>';
        } else {
            options = '<option value="">No crops available</option>';
        }
    } catch (error) {
        console.error('Failed to update crop options:', error);
        options = '<option value="">Error loading crops</option>';
    }

    $('#crop').html(options);
}


// Function to handle category change and display results
async function handleCategoryChange() {
    const season = $('#season').val();
    const type = $('#type').val();
    const crop = $('#crop').val(); // This will be a single selected crop
    const category = $('#category').val();

    // Check if any crop is selected
    if (!crop) {
        $('#available').hide();
        $('#unavailable').hide();
        $('#selectFirst').show();
        return; // Exit the function if no crop is selected
    }

    let categoryText;
    let dataset = [];
    let key = [];

    let data = [];
    switch (category) {
        case 'usage_level':
            categoryText = 'Production Usage Level (%)';
            key = ["usageLevel", "totalProduction", "totalSold"];
            data = await getProduction(crop, season);
            dataset = stats.UsageLevelFrequency(data);
            break;
        case 'area_planted':
            categoryText = 'Area Planted (Hectare)';
            key = ["areaPlanted"];
            data = await getProduction(crop, season);
            dataset = stats.countAverageAreaPlanted(data);
            break;
        case 'production_volume':
            categoryText = 'Production Volume Per Hectare';
            key = ["volumeProductionPerHectare", "totalVolume", "totalArea"];
            data = await getProduction(crop, season);
            dataset = stats.averageVolumeProduction(data);
            console.log(dataset);
            break;
        case 'price':
            categoryText = 'Price';
            key = ["price"];
            data = await getPrice(crop, season);
            dataset = stats.averagePrice(data);
            break;
        case 'pest_occurrence':
            categoryText = 'Pest Occurrence';
            key = ["totalOccurrence", "pestOccurrences"];
            data = await getPest(crop, season);
            dataset = stats.countPestOccurrence(data);
            console.log(dataset);
            break;
        case 'disease_occurrence':
            categoryText = 'Disease Occurrence';
            key = ["totalOccurrence", "diseaseOccurrences"];
            data = await getDisease(crop, season);
            dataset = stats.countDiseaseOccurrence(data);
            break;
        case 'price_income_per_hectare':
            categoryText = 'Price Income per Hectare';
            key = ["incomePerHectare", "totalArea", "totalIncome"];
            data = await getProduction(crop, season);
            dataset = stats.priceIncomePerHectare(data);
            console.log(dataset);
            break;
        case 'profit_per_hectare':
            categoryText = 'Profit per Hectare';
            key = ["profitPerHectare", "totalArea", "totalIncome", "totalProductionCost"];
            data = await getProduction(crop, season);
            dataset = stats.profitPerHectare(data);
            break;
        default:
            categoryText = 'Category not recognized';
    }

    if (dataset.length !== 0) {
        $('#unavailable').hide();
        $('#selectFirst').hide();
        $('#available').show();
        $('#downloadBtn').show();
        const st = new SeasonalTrends(season, type, crop, categoryText);
        const interpretation = interpretData(dataset, key[0]);
        
        const charts = st.generateTrends(dataset, categoryText, key);
        st.displayTrends(charts, interpretation);
        printData = {
            charts,
            interpretation,
            categoryText
        }        
        currentType = key[0];
        downloadData = dataset;
    } else {
        $('#available').hide();
        $('#selectFirst').hide();
        $('#unavailable').show();
        $('#downloadBtn').hide();
    }

    console.log(dataset);
}


// Document ready function
$(document).ready(async function() {
    updateCropOptions().then(() =>  handleCategoryChange());


    // Attach event listener to #type element
    $('#type').on('change', function() {
        updateCropOptions().then(() => handleCategoryChange());

    });

    // Attach event listener to #season element
    $('#season').on('change', function() {
        updateCropOptions().then(() => handleCategoryChange());
    
    });

    $('#category, #crop').on('change', function() {
        handleCategoryChange();
    });
});

function interpretData(data) {
    const cropData = { total: {}, monthlyData: {}, months: [], pestOccurrences: {}, diseaseOccurrences: {} };
    const cropName = data[0]?.cropName || 'Unknown Crop';
    const numericFields = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    
    // Initialize structure for all numeric fields
    numericFields.forEach((field) => {
        cropData.total[field] = 0;
        cropData.monthlyData[field] = {};
    });
    
    // Group data by monthYear and calculate totals
    data.forEach((item) => {
        const { monthYear } = item;
    
        // Aggregate numeric fields
        numericFields.forEach((field) => {
            const value = item[field] || 0; // Default to 0 if undefined
            cropData.total[field] += value;
    
            if (!cropData.monthlyData[field][monthYear]) {
                cropData.monthlyData[field][monthYear] = [];
            }
            cropData.monthlyData[field][monthYear].push(value);
        });
    
        // Handle pestOccurrences if they exist
        if (item.pestOccurrences && Array.isArray(item.pestOccurrences)) {
            item.pestOccurrences.forEach(({ pestName, occurrence }) => {
                cropData.pestOccurrences[pestName] = (cropData.pestOccurrences[pestName] || 0) + occurrence;
            });
        }
    
        // Handle diseaseOccurrences if they exist
        if (item.diseaseOccurrences && Array.isArray(item.diseaseOccurrences)) {
            item.diseaseOccurrences.forEach(({ diseaseName, occurrence }) => {
                cropData.diseaseOccurrences[diseaseName] = (cropData.diseaseOccurrences[diseaseName] || 0) + occurrence;
            });
        }
    
        if (!cropData.months.includes(monthYear)) {
            cropData.months.push(monthYear);
        }
    });
    
    // Sort months for proper comparison
    cropData.months.sort((a, b) => new Date(a) - new Date(b));
    
    // Extract the latest year from the months array
    const latestMonthString = cropData.months[cropData.months.length - 1]; // Get the last month string
    const latestYear = latestMonthString.split(' ')[1]; // Split by space and take the second element, which is the year

    // Filter months to include only those from the latest year
    let latestYearMonths = cropData.months.filter(month => month.endsWith(latestYear)); // Check if the month ends with the latestYear

    // If not enough data for the latest year, fallback to the previous year
    if (latestYearMonths.length < 2) {
        const previousYear = (parseInt(latestYear) - 1).toString(); // Get the previous year as a string
        latestYearMonths = cropData.months.filter(month => month.endsWith(previousYear)); // Filter for the previous year
    }

console.log(latestMonthString, latestYear, latestYearMonths);

    // Calculate monthly averages for each numeric field for the latest year
    const monthlyAverages = {};
    numericFields.forEach((field) => {
        const totalMonths = latestYearMonths.length;
        monthlyAverages[field] = Array(totalMonths).fill(0);
        latestYearMonths.forEach((month, index) => {
            monthlyAverages[field][index] = cropData.monthlyData[field][month].reduce((a, b) => a + b, 0) / (cropData.monthlyData[field][month].length || 1);
        });
    });

    // Calculate month-to-month growth rates for each field for the latest year
    const growthRates = {};
    numericFields.forEach((field) => {
        growthRates[field] = [];
        if (latestYearMonths.length >= 2) {
            for (let i = 1; i < latestYearMonths.length; i++) {
                const previousMonthAvg = monthlyAverages[field][i - 1];
                const currentMonthAvg = monthlyAverages[field][i];
                const growthRate = Math.round(((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100);
                growthRates[field].push(growthRate);
            }
        }
    });

    // Handle edge cases for overall growth rates for the latest year
    const overallGrowthRates = {};
    numericFields.forEach((field) => {
        overallGrowthRates[field] = latestYearMonths.length >= 2
            ? Math.round(((monthlyAverages[field][monthlyAverages[field].length - 1] - monthlyAverages[field][0]) / monthlyAverages[field][0]) * 100)
            : null; // Use null or a meaningful value
    });
    
    // Calculate results
    const results = {};
    numericFields.forEach((field) => {
        const latestGrowthRate = growthRates[field][growthRates[field].length - 1] || 0; // Get the latest growth rate

        results[field] = {
            average: cropData.total[field] / (data.length || 1), // Avoid division by zero
            growthRateOverall: overallGrowthRates[field],
            growthRateLatestMonth: latestGrowthRate,
            performance: latestGrowthRate > 0 
                ? 'Increase' 
                : latestGrowthRate < 0 
                ? 'Decrease' 
                : 'Stable', // Performance based on latest growth rate
        };
    });
 

    // Construct interpretation text
    const uniqueMonths = Array.from(new Set(data.map(entry => entry.monthYear))).sort((a, b) => new Date(a) - new Date(b));
    const monthRange = uniqueMonths.length === 1
        ? uniqueMonths[0]
        : `${uniqueMonths[0]} - ${uniqueMonths[uniqueMonths.length - 1]}`;
    
        let interpretation = `
        <h3 class="text-primary" style="font-size: 2rem; font-weight: bold;">Crop Performance Analysis for <strong>${cropName}</strong></h3>
        <p style="font-size: 1.1rem; color: #333;">Period: <span class="text-success">${monthRange}</span>. Below is a detailed breakdown of the crop's performance during the specified period, focusing on the latest years with sufficient records:</p>
    `;
    
    interpretation += `<div class="row" style="margin-bottom: 20px;">`;
    
    numericFields.forEach((field) => {
        const formattedFieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        const growthRateOverall = results[field].growthRateOverall;
        const growthRateLatestMonth = results[field].growthRateLatestMonth;
    
        // Determine card color based on performance
        const cardClass = results[field].performance === 'Increase' ? 'bg-success' :
                          results[field].performance === 'Decrease' ? 'bg-danger' : 'bg-warning';
    
        interpretation += `
            <div class="col-md-4 mb-4"> <!-- Adjust the number of columns here -->
                <div class="card ${cardClass}" style="border-radius: 15px; color: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
                    <div class="card-body">
                        <h5 class="card-title" style="font-size: 1.25rem;"><strong>${formattedFieldName.charAt(0).toUpperCase() + formattedFieldName.slice(1)}</strong></h5>
                        <ul class="text-center" style="list-style-type: none; padding: 0; color: white;">
                            <li style="margin: 5px 0;">Average: <strong>${results[field].average.toFixed(2)}</strong></li>
                            <li style="margin: 5px 0;">Overall Growth Rate: <strong>${growthRateOverall}%</strong></li>
                            <li style="margin: 5px 0;">Growth Rate in Latest Month: <strong>${growthRateLatestMonth}%</strong></li>
                            <li style="margin: 5px 0;">Performance: <strong>${results[field].performance}</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
    
    interpretation += `</div>`; // Closing the row
    
    // Conditionally display pest occurrences
    if (Object.keys(cropData.pestOccurrences).length > 0) {
        const pestItems = Object.entries(cropData.pestOccurrences)
            .map(([name, occurrence]) => `
                <li style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9;">
                    ${name}: <strong>${occurrence}</strong>
                </li>
            `).join('');
    
        interpretation += `
            <div style="margin-top: 20px;">
                <h5 style="color: #d9534f;">Pest Occurrences:</h5>
                <ul style="list-style-type: none; padding: 0; border: 1px solid #ccc; border-radius: 5px; background-color: #fff;">
                    ${pestItems}
                </ul>
            </div>
        `;
    }
    
    // Conditionally display disease occurrences
    if (Object.keys(cropData.diseaseOccurrences).length > 0) {
        const diseaseItems = Object.entries(cropData.diseaseOccurrences)
            .map(([name, occurrence]) => `
                <li style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9;">
                    ${name}: <strong>${occurrence}</strong>
                </li>
            `).join('');
    
        interpretation += `
            <div style="margin-top: 20px;">
                <h5 style="color: #d9534f;">Disease Occurrences:</h5>
                <ul style="list-style-type: none; padding: 0; border: 1px solid #ccc; border-radius: 5px; background-color: #fff;">
                    ${diseaseItems}
                </ul>
            </div>
        `;
    }
    
    interpretation += `<p style="margin-top: 20px; font-size: 1rem; color: #333;">This analysis provides a detailed breakdown of the crop's performance over time, highlighting trends, growth rates, and performance levels to support informed decision-making.</p>`;
    interpretation += `<small class="text-muted">Note: Findings are based on available data only.</small>`;
    
        return interpretation;
                           
}


$(document).ready(function() {
    $('.download-btn').click(function() {
        // Call the downloadDialog method and handle the promise
        Dialog.downloadDialog().then(format => {
            console.log(format);  // This will log the format (e.g., 'csv', 'xlsx', or 'pdf')
            download(format, currentType, downloadData);
        }).catch(error => {
            console.error('Error:', error);  // Handle any errors that occur
        });
    });
});


function download(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'xlsx') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      downloadPDF(filename);
    }
  }

function formatHeader(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeCSVValue(value) {
  if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  return `"${value}"`; // Enclose each value in double quotes
}

function downloadCSV(filename, data) {
    // Define the header mapping
    const headerMap = {
        cropName: 'Crop Name',
        season: 'Season',
        monthYear: 'Month-Year',
        volumeProductionPerHectare: 'Average Volume Production (mt/ha)',
        incomePerHectare: 'Average Income / ha',
        profitPerHectare: 'Average Profit / ha',
        price: 'Price (kg)',
        pestOccurrence: 'Pest Observed',
        diseaseOccurrence: 'Disease Observed',
        totalPlanted: 'Total Planted',
        totalVolume: 'Total Volume (mt)'
    };

    // Always include these headers for both monthly and yearly data
    const alwaysIncludedHeaders = ['cropName', 'season', 'monthYear'];

    // Dynamically include other headers based on filename
    const additionalHeaders = [];
    const filenameLower = filename.toLowerCase();

    if (filenameLower.includes('volumeproductionperhectare')) {
        additionalHeaders.push('volumeProductionPerHectare');
    }
    if (filenameLower.includes('totalvolume')) {
        additionalHeaders.push('totalVolume');
    }
    if (filenameLower.includes('incomeperhectare')) {
        additionalHeaders.push('incomePerHectare');
    }
    if (filenameLower.includes('profitperhectare')) {
        additionalHeaders.push('profitPerHectare');
    }
    if (filenameLower.includes('price')) {
        additionalHeaders.push('price');
    }
    if (filenameLower.includes('pestoccurrence')) {
        additionalHeaders.push('pestOccurrence');
    }
    if (filenameLower.includes('diseaseoccurrence')) {
        additionalHeaders.push('diseaseOccurrence');
    }
    if (filenameLower.includes('totalplanted')) {
        additionalHeaders.push('totalPlanted');
    }

    // ======= MONTHLY DATA SECTION =======
    const headersToInclude = [...alwaysIncludedHeaders, ...additionalHeaders];
    const mappedHeaders = headersToInclude.map(key => headerMap[key]);

    const monthlyCSVData = [
        'Monthly Data',
        mappedHeaders.join(','),
        ...data.map(row => headersToInclude.map(key => {
            const value = row[key];
            // Format specific columns with peso sign
            if (key === 'incomePerHectare' || key === 'profitPerHectare' || key === 'price') {
                return value ? `"₱${parseFloat(value).toFixed(2)}"` : '';
            }
            return escapeCSVValue(value);
        }).join(','))
    ].join('\n');

    // ======= YEARLY DATA SECTION =======
    const yearlyData = {};
    data.forEach(row => {
        const year = new Date(row.monthYear).getFullYear();
        const cropSeasonKey = `${row.cropName}-${row.season}`;

        if (!yearlyData[year]) {
            yearlyData[year] = {};
        }

        if (!yearlyData[year][cropSeasonKey]) {
            yearlyData[year][cropSeasonKey] = {
                cropName: row.cropName,
                season: row.season,
                count: 0,
                sums: {}
            };
            additionalHeaders.forEach(header => {
                yearlyData[year][cropSeasonKey].sums[header] = 0;
            });
        }

        yearlyData[year][cropSeasonKey].count++;
        additionalHeaders.forEach(header => {
            yearlyData[year][cropSeasonKey].sums[header] += parseFloat(row[header]) || 0;
        });
    });

    const yearlyHeaders = ['Year', 'Crop Name', 'Season', ...additionalHeaders.map(header => headerMap[header])];
    const yearlyCSVData = [
        '\nYearly Data',
        yearlyHeaders.join(','),
        ...Object.entries(yearlyData).flatMap(([year, cropSeasons]) =>
            Object.values(cropSeasons).map(cropSeason => {
                const row = [year, cropSeason.cropName, cropSeason.season];
                additionalHeaders.forEach(header => {
                    const average = (cropSeason.sums[header] / cropSeason.count).toFixed(2);
                    row.push(average);
                });
                return row.join(',');
            })
        )
    ].join('\n');

    // Combine monthly and yearly data into a single CSV
    const completeCSVData = [monthlyCSVData, yearlyCSVData].join('\n');

    // Create CSV download
    const blob = new Blob([completeCSVData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let season = $("#season").val();
    let crop = $("#crop").val();
    crop = crop.charAt(0).toUpperCase() + crop.slice(1);
    season = season.charAt(0).toUpperCase() + season.slice(1);
    filename = crop + "_" + season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addDownload(filename, 'CSV');
}

function downloadExcel(filename, data) {
    // Define the header mapping
    const headerMap = {
        monthYear: 'Month Year',
        cropName: 'Crop Name',
        season: 'Season',
        volumeProductionPerHectare: 'Average Volume Production (mt/ha)',
        incomePerHectare: 'Average Income / ha',
        profitPerHectare: 'Average Profit / ha',
        price: 'Price (kg)',
        pestOccurrence: 'Pest Observed',
        diseaseOccurrence: 'Disease Observed',
        totalPlanted: 'Total Planted',
        totalVolume: 'Total Volume (mt)'
    };

    console.log(data);

    // Always include these three headers
    const alwaysIncludedHeaders = ['monthYear', 'cropName', 'season'];

    // Dynamically include other headers based on filename
    const additionalHeaders = [];

    const filenameLower = filename.toLowerCase();

    if (filenameLower.includes('volumeproductionperhectare')) {
        additionalHeaders.push('volumeProductionPerHectare');
    }
    if (filenameLower.includes('totalvolume')) {
        additionalHeaders.push('totalVolume');
    }
    if (filenameLower.includes('incomeperhectare')) {
        additionalHeaders.push('incomePerHectare');
    }
    if (filenameLower.includes('profitperhectare')) {
        additionalHeaders.push('profitPerHectare');
    }
    if (filenameLower.includes('price')) {
        additionalHeaders.push('price');
    }
    if (filenameLower.includes('pestoccurrence')) {
        additionalHeaders.push('pestOccurrence');
    }
    if (filenameLower.includes('diseaseoccurrence')) {
        additionalHeaders.push('diseaseOccurrence');
    }
    if (filenameLower.includes('totalplanted')) {
        additionalHeaders.push('totalPlanted');
    }

    // Define the order of headers to include (first three + dynamically added)
    const headersToInclude = [...alwaysIncludedHeaders, ...additionalHeaders];

    // Map headers to the desired names
    const mappedHeaders = headersToInclude.map(key => headerMap[key]);

    // Filter data to match the new headers
    const filteredData = data.map(row => {
        const filteredRow = {};
        headersToInclude.forEach(key => {
            filteredRow[headerMap[key]] = row[key];
        });
        return filteredRow;
    });

    // Create a new workbook and add the main worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly');

    // Add filtered data to the worksheet
    worksheet.addRow(mappedHeaders);
    filteredData.forEach(row => {
        worksheet.addRow(headersToInclude.map(header => {
            let value = row[headerMap[header]];
            
            // Format specific columns with decimal places (e.g., income, profit, price)
            if (header === 'incomePerHectare' || header === 'profitPerHectare' || header === 'price') {
                value = value ? `₱${parseFloat(value).toFixed(2)}` : ''; // Add decimal formatting and peso sign
            } else if (typeof value === 'number') {
                value = value.toFixed(2); // Add decimal formatting for other numeric columns
            }
            
            return value;
        }));
    });    

    // Define header and data style (same as before)
    const headerStyle = {
        font: {
            name: "Calibri",
            size: 12,
            bold: true,
            color: { argb: "FFFFFFFF" } // White color
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: "B1BA4D" } // Green fill color
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
            top: { style: 'thin', color: { argb: "FF000000" } }, // Black border
            right: { style: 'thin', color: { argb: "FF000000" } },
            bottom: { style: 'thin', color: { argb: "FF000000" } },
            left: { style: 'thin', color: { argb: "FF000000" } }
        }
    };

    const dataStyle = {
        font: {
            name: "Calibri",
            size: 11
        },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
            top: { style: 'thin', color: { argb: "FF000000" } }, // Black border
            right: { style: 'thin', color: { argb: "FF000000" } },
            bottom: { style: 'thin', color: { argb: "FF000000" } },
            left: { style: 'thin', color: { argb: "FF000000" } }
        }
    };

    // Apply style to header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = headerStyle;
    });
    headerRow.height = 20; // Set header row height

    // Apply style to data rows
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.style = dataStyle;
            });
        }
    });

    // Set column widths with padding to prevent overflow
    worksheet.columns = mappedHeaders.map(header => ({
        width: Math.max(header.length, 10) + 5
    }));

    // ======= Add Yearly Averages Sheet =======
    const yearlyData = {};
    data.forEach(row => {
        const year = new Date(row.monthYear).getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = {
                count: 0,
                sums: {}
            };
            additionalHeaders.forEach(header => {
                yearlyData[year].sums[header] = 0;
            });
        }
        yearlyData[year].count++;
        additionalHeaders.forEach(header => {
            yearlyData[year].sums[header] += parseFloat(row[header]) || 0;
        });
    });

    // Extract cropName and season from the first row of data (assuming they are consistent across all rows)
    const cropName = data[0].cropName;
    const season = data[0].season;

    // Calculate the averages
    const yearlyAverages = Object.keys(yearlyData).map(year => {
        const averages = { Year: year, CropName: cropName, Season: season };
        additionalHeaders.forEach(header => {
            averages[headerMap[header]] = (yearlyData[year].sums[header] / yearlyData[year].count).toFixed(2);
        });
        return averages;
    });

    // Add the yearly averages to a new worksheet
    const yearlyWorksheet = workbook.addWorksheet('Yearly');

    // Define headers for the yearly sheet, including Crop Name and Season
    const yearlyHeaders = ['Year', 'Crop Name', 'Season', ...additionalHeaders.map(header => headerMap[header])];
    yearlyWorksheet.addRow(yearlyHeaders);

    // Add the calculated yearly averages to the worksheet
    yearlyAverages.forEach(row => {
        yearlyWorksheet.addRow(Object.values(row));
    });

    // Apply styles to the new sheet
    const yearlyHeaderRow = yearlyWorksheet.getRow(1);
    yearlyHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = headerStyle;
    });
    yearlyHeaderRow.height = 20;

    yearlyWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.style = dataStyle;
            });
        }
    });

    // Set column widths
    yearlyWorksheet.columns = yearlyHeaders.map(header => ({
        width: Math.max(header.length, 10) + 5
    }));


    // Write workbook to browser
    workbook.xlsx.writeBuffer().then(function(buffer) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let season = $("#season").val();
        let crop = $("#crop").val();
        crop = crop.charAt(0).toUpperCase() + crop.slice(1);
        season = season.charAt(0).toUpperCase() + season.slice(1);
        filename = crop + "_" + season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
    addDownload(filename, 'XLSX');
}

function downloadPDF(filename) {
    console.log(printData);

    // Store data in sessionStorage
    sessionStorage.setItem('printData', JSON.stringify(printData));

    // Open print page
    const printWindow = window.open('/print-seasonal-trends', '_blank');
    printWindow.onload = function() {
        printWindow.print();
    };
}