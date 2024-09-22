// Helper function to parse date
function parseDate(dateString) {
    return new Date(dateString).getFullYear();
}

function calculateYearlyAverages(yearlyData) {
    return Object.keys(yearlyData).map(year => {
        const sum = yearlyData[year].reduce((a, b) => a + b, 0);
        return sum / yearlyData[year].length;
    });
}

function calculateMonthlyAverages (monthlyData) {
    const monthlyAverages = [];

    // Iterate over each month and calculate the average value
    Object.keys(monthlyData).forEach((monthYear) => {
        const values = monthlyData[monthYear];
        const total = values.reduce((sum, value) => sum + value, 0);
        const average = total / values.length;
        monthlyAverages.push(average);
    });

    return monthlyAverages;
}

function calculateZScoresForGrowthRates(yearlyAverages, growthRates) {
    const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    
    const stdDev = Math.sqrt(growthRates.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / growthRates.length);
    const zScores = growthRates.map(rate => (rate - mean) / stdDev);
    const meanZScore = zScores.reduce((a, b) => a + b, 0) / zScores.length;
    
    return { growthRateZScores: zScores, meanGrowthRateZScore: meanZScore };
}

// Interpret performance
function interpretPerformance(zScore) {
    
    if (zScore > 2) return 'Excellent';
    if (zScore > 1) return 'Good';
    if (zScore > 0) return 'Average';
    if (zScore > -1) return 'Below Average';
    return 'Poor';
}

function interpretPerformanceScore(growthRate) {
    // Define a scoring system based on growth rate percentage
    let score = 0;

    if (growthRate >= 30) {
        score = 100; // Excellent
    } else if (growthRate >= 10) {
        score = 80; // Good
    } else if (growthRate >= 0) {
        score = 60; // Average
    } else if (growthRate >= -20) {
        score = 40; // Below Average
    } else {
        score = 20; // Poor
    }

    return score;
}

   // Function to extract numeric value from price string
   function parsePrice(priceString) {
    // Regular expressions for different formats
    const matchPiece = priceString.match(/^(\d+(\.\d+)?)\/pc$/); // Matches price/pc
    const matchBundle = priceString.match(/^(\d+(\.\d+)?)\/bundle$/); // Matches price/bundle

    // Check if priceString is a range (e.g., "10-15")
    if (typeof priceString === 'string' && priceString.includes('-')) {
        const [min, max] = priceString.split('-').map(parseFloat);
        return (min + max) / 2; // Return the average of the range
    }

    // Extract price based on format
    if (matchPiece) {
        // Extract price per piece and convert to price per kilogram
        const pricePerPiece = parseFloat(matchPiece[1]);
        const weightPerPiece = 0.2; // Define this based on your needs
        return pricePerPiece / weightPerPiece;
    } else if (matchBundle) {
        // Extract price per bundle and convert to price per kilogram
        const pricePerBundle = parseFloat(matchBundle[1]);
        const weightPerBundle = 1; // Define this based on your needs
        return pricePerBundle / weightPerBundle;
    } else {
        // If the price string is numeric or a range without a unit, assume it is per kilogram
        return parseFloat(priceString);
    }
}

function UsageLevelFrequency(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    // Aggregate data
    const monthCropUsage = data.reduce((acc, item) => {
        let { monthHarvested, cropName, volumeSold, volumeProduction, season } = item;

        // Handle months in the format "March-April 2021"
        if (monthHarvested.includes('-')) {
            const months = monthHarvested.split('-');
            monthHarvested = months[1].trim(); // Take the last month in the range
        }

        // Initialize the accumulator for month, season, and crop
        if (!acc[monthHarvested]) {
            acc[monthHarvested] = {};
        }
        
        if (!acc[monthHarvested][season]) {
            acc[monthHarvested][season] = {};
        }
        
        if (!acc[monthHarvested][season][cropName]) {
            acc[monthHarvested][season][cropName] = { totalProduction: 0, totalSold: 0, usageLevel: 0 };
        }

        acc[monthHarvested][season][cropName].totalProduction += volumeProduction;
        acc[monthHarvested][season][cropName].totalSold += volumeSold;

        return acc;
    }, {});

    // Calculate usage level frequency and prepare final output
    return Object.entries(monthCropUsage).flatMap(([month, seasons]) =>
        Object.entries(seasons).flatMap(([season, crops]) =>
            Object.entries(crops).map(([cropName, { totalProduction, totalSold }]) => ({
                monthYear: month,
                season,
                cropName,
                totalProduction,
                totalSold,
                usageLevel: parseFloat((totalSold / totalProduction).toFixed(2)) // Compute usageLevel as volumeSold / volumeProduction
            }))
        )
    );
}


function countAverageAreaPlanted(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    console.log(data);

    // Aggregate data
    const monthCropCounts = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, areaPlanted } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalPlanted: 0, areaPlanted: 0 };
        }

        acc[monthPlanted][cropName].totalPlanted++;
        acc[monthPlanted][cropName].areaPlanted += areaPlanted;
        
        return acc;
    }, {});

    // Calculate averageAreaPlanted and prepare final output
    return Object.entries(monthCropCounts).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted, areaPlanted }]) => ({
            monthYear: month,
            cropName,
            season,
            totalPlanted,
            areaPlanted: parseFloat((areaPlanted / totalPlanted).toFixed(2)) // Compute averageAreaPlanted as totalArea / totalPlanted
        }))
    );
}

function countAverageAreaPlantedBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season, areaPlanted } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { season, totalPlanted: 0, areaPlanted: 0 };
        }

        acc[barangay][cropName].totalPlanted++;
        acc[barangay][cropName].areaPlanted += areaPlanted;
        return acc;
    }, {});

    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted, areaPlanted }]) => ({
            barangay,
            cropName,
            season,
            totalPlanted,
            areaPlanted: parseFloat((areaPlanted / totalPlanted).toFixed(2)) // Compute averageAreaPlanted as totalArea / totalPlanted
        }))
    );
}


function averageVolumeProduction(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    console.log(data);

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeProduction, areaPlanted } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalVolume: 0, totalArea: 0 };
        }

        acc[monthPlanted][cropName].totalVolume += volumeProduction;
        acc[monthPlanted][cropName].totalArea += areaPlanted;

        return acc;
    }, {});

    let dataset = Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalVolume, totalArea }]) => ({
            monthYear: month,
            cropName,
            season,  
            totalVolume: parseFloat(totalVolume.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),          
            volumeProductionPerHectare: parseFloat((totalVolume / totalArea).toFixed(2)),
        }))
    );
    return dataset;
}

function averageVolumeProductionBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    // Aggregate total volume, area, count records, and track season per barangay and crop
    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeProduction, areaPlanted, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalVolume: 0, totalArea: 0, count: 0, season: '' };
        }

        acc[barangay][cropName].totalVolume += volumeProduction;
        acc[barangay][cropName].totalArea += areaPlanted;
        acc[barangay][cropName].count++;

        // Assume the season is consistent across records for the same barangay and crop
        acc[barangay][cropName].season = season;

        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalVolume, totalArea, count }]) => ({
            barangay,
            cropName,
            season,
            totalVolume: totalVolume.toFixed(2),
            totalArea: totalArea.toFixed(2),
            volumeProduction: totalArea > 0 
                ? parseFloat((totalVolume / totalArea).toFixed(2)) 
                : 0,
        }))
    );
}


function averagePrice(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthYear, cropName, season, price } = item;
        let numericalPrice = 0;

        numericalPrice = parsePrice(price);

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, price: 0, count: 0 };
        }

        acc[monthYear][cropName].price += numericalPrice;
        acc[monthYear][cropName].count += 1;

        return acc;
    }, {});

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, price, count }]) => ({
            monthYear: month,
            cropName,
            season,
            price: parseFloat((price / count).toFixed(2))
        }))
    );
}

function countPestOccurrence(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropCounts = data.reduce((acc, item) => {
        const { monthYear, cropName, season, pestName } = item;

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, pestOccurrences: {}, totalOccurrence: 0 };
        }

        if (!acc[monthYear][cropName].pestOccurrences[pestName]) {
            acc[monthYear][cropName].pestOccurrences[pestName] = 0;
        }

        acc[monthYear][cropName].pestOccurrences[pestName]++;
        acc[monthYear][cropName].totalOccurrence++;

        return acc;
    }, {});

    return Object.entries(monthCropCounts).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, pestOccurrences, totalOccurrence }]) => ({
            monthYear: month,
            cropName,
            season,
            totalOccurrence,
            pestOccurrences: Object.entries(pestOccurrences).map(([pestName, occurrence]) => ({
                pestName,
                occurrence
            }))
        }))
    );
}

function countPestOccurrenceBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    // Aggregate pest occurrences per barangay, crop, and season
    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = {};
        }

        if (!acc[barangay][cropName][season]) {
            acc[barangay][cropName][season] = 0;
        }

        acc[barangay][cropName][season]++;
        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).flatMap(([cropName, seasons]) =>
            Object.entries(seasons).map(([season, count]) => ({
                barangay,
                cropName,
                season,
                pestOccurrence: count
            }))
        )
    );
}

function countDiseaseOccurrence(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropCounts = data.reduce((acc, item) => {
        const { monthYear, cropName, season, diseaseName } = item;

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, diseaseOccurrences: {}, totalOccurrence: 0 };
        }

        if (!acc[monthYear][cropName].diseaseOccurrences[diseaseName]) {
            acc[monthYear][cropName].diseaseOccurrences[diseaseName] = 0;
        }

        acc[monthYear][cropName].diseaseOccurrences[diseaseName]++;
        acc[monthYear][cropName].totalOccurrence++;

        return acc;
    }, {});

    return Object.entries(monthCropCounts).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, diseaseOccurrences, totalOccurrence }]) => ({
            monthYear: month,
            cropName,
            season,
            totalOccurrence,
            diseaseOccurrences: Object.entries(diseaseOccurrences).map(([diseaseName, occurrence]) => ({
                diseaseName,
                occurrence
            }))
        }))
    );
}

function countDiseaseOccurrenceBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    // Aggregate disease occurrences per barangay, crop, and season
    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = {};
        }

        if (!acc[barangay][cropName][season]) {
            acc[barangay][cropName][season] = 0;
        }

        acc[barangay][cropName][season]++;
        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).flatMap(([cropName, seasons]) =>
            Object.entries(seasons).map(([season, count]) => ({
                barangay,
                cropName,
                season,
                diseaseOccurrence: count
            }))
        )
    );
}

function priceIncomePerHectare(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, areaPlanted, price } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalIncome: 0, totalArea: 0 };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        

        acc[monthPlanted][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[monthPlanted][cropName].totalArea += areaPlanted;

        return acc;
    }, {});

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea }]) => ({
            monthYear: month,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            incomePerHectare: totalArea > 0 ? parseFloat((totalIncome / totalArea).toFixed(2)) : 0 // Avoid division by zero
        }))
    );
}

function priceIncomePerHectareBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }


    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeSold, areaPlanted, price, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalIncome: 0, totalArea: 0, season: '' };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms

        acc[barangay][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[barangay][cropName].totalArea += areaPlanted;

        // Store the season, assuming it's consistent for each barangay-crop pair
        acc[barangay][cropName].season = season;

        return acc;
    }, {});

    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea }]) => ({
            barangay,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            incomePerHectare: totalArea > 0 ? parseFloat((totalIncome / totalArea).toFixed(2)) : 0
        }))
    );
}


function profitPerHectare(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, areaPlanted, price, productionCost } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalIncome: 0, totalArea: 0, totalProductionCost: 0, count: 0  };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms

        acc[monthPlanted][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[monthPlanted][cropName].totalArea += areaPlanted;
        acc[monthPlanted][cropName].totalProductionCost += productionCost;
        acc[monthPlanted][cropName].count += 1; 

        return acc;
    }, {});
    

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea, totalProductionCost, count }]) => ({

            monthYear: month,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            totalProductionCost: parseFloat(totalProductionCost.toFixed(2)),
            totalProfit: totalArea > 0 ? parseFloat(((totalIncome - totalProductionCost)).toFixed(2)) : 0,
            profitPerHectare: totalArea > 0 ? parseFloat(((totalIncome - totalProductionCost) / totalArea).toFixed(2)) : 0

        }))
    );
}


function profitPerHectareBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeSold, areaPlanted, price, productionCost, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalIncome: 0, totalArea: 0, totalProductionCost: 0, season: '' };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms


        acc[barangay][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[barangay][cropName].totalArea += areaPlanted;
        acc[barangay][cropName].totalProductionCost += productionCost;

        // Store the season, assuming it's consistent for each barangay-crop pair
        acc[barangay][cropName].season = season;

        return acc;
    }, {});

    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea, totalProductionCost }]) => ({
            barangay,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            totalProductionCost: parseFloat(totalProductionCost.toFixed(2)),
            profitPerHectare: totalArea > 0 ? parseFloat(((totalIncome - totalProductionCost) / totalArea).toFixed(2)) : 0 
        }))
    );
}

function calculateProfitMargin(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropMargins = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, price, productionCost } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalProfit: 0, totalRevenue: 0 };
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const totalRevenue = calculatedVolume * calculatedPrice;
        const totalCost = productionCost * calculatedVolume;

        acc[monthPlanted][cropName].totalRevenue += totalRevenue;
        acc[monthPlanted][cropName].totalProfit += totalRevenue - totalCost;

        return acc;
    }, {});

    return Object.entries(monthCropMargins).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalProfit, totalRevenue }]) => {
            const profitMargin = totalRevenue > 0 ? parseFloat((totalProfit / totalRevenue).toFixed(2)) : 0; // Avoid division by zero
            return {
                monthYear: month,
                cropName,
                season,
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                profitMargin
            };
        })
    );
}

function calculateCostEfficiency(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropEfficiencies = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, productionCost } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalCost: 0, totalVolume: 0 };
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const totalCost = productionCost * calculatedVolume;

        acc[monthPlanted][cropName].totalCost += totalCost;
        acc[monthPlanted][cropName].totalVolume += calculatedVolume;

        return acc;
    }, {});

    return Object.entries(monthCropEfficiencies).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalCost, totalVolume }]) => {
            const costEfficiency = totalVolume > 0 ? parseFloat((totalCost / totalVolume).toFixed(2)) : 0; // Avoid division by zero
            return {
                monthYear: month,
                cropName,
                season,
                totalCost: parseFloat(totalCost.toFixed(2)),
                totalVolume: parseFloat(totalVolume.toFixed(2)),
                costEfficiency
            };
        })
    );
}


function calculateGrossProfitPerHectare(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropProfits = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, price, productionCost, areaPlanted } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalRevenue: 0, totalCost: 0, totalArea: 0 };
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const totalRevenue = calculatedVolume * calculatedPrice;
        const totalCost = productionCost * calculatedVolume;

        acc[monthPlanted][cropName].totalRevenue += totalRevenue;
        acc[monthPlanted][cropName].totalCost += totalCost;
        acc[monthPlanted][cropName].totalArea += areaPlanted;

        return acc;
    }, {});

    return Object.entries(monthCropProfits).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalRevenue, totalCost, totalArea }]) => {
            const revenuePerHectare = totalArea > 0 ? parseFloat((totalRevenue / totalArea).toFixed(2)) : 0; // Avoid division by zero
            const costPerHectare = totalArea > 0 ? parseFloat((totalCost / totalArea).toFixed(2)) : 0; // Avoid division by zero
            const grossProfitPerHectare = revenuePerHectare - costPerHectare;

            return {
                monthYear: month,
                cropName,
                season,
                revenuePerHectare,
                costPerHectare,
                grossProfitPerHectare: parseFloat(grossProfitPerHectare.toFixed(2))
            };
        })
    );
}

function calculatePriceFluctuationRate(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropPrices = {};

    // Collect prices by month and crop
    data.forEach(item => {
        const { monthPlanted, cropName, price } = item;

        if (!monthCropPrices[monthPlanted]) {
            monthCropPrices[monthPlanted] = {};
        }

        monthCropPrices[monthPlanted][cropName] = parsePrice(price);
    });

    const priceFluctuationRates = [];

    // Calculate price fluctuation rates
    const months = Object.keys(monthCropPrices);
    for (let i = 1; i < months.length; i++) {
        const currentMonth = months[i];
        const previousMonth = months[i - 1];

        for (const cropName in monthCropPrices[currentMonth]) {
            const currentPrice = monthCropPrices[currentMonth][cropName];
            const previousPrice = monthCropPrices[previousMonth][cropName];

            if (previousPrice) { // Ensure previous price exists
                const fluctuationRate = ((currentPrice - previousPrice) / previousPrice) * 100;
                priceFluctuationRates.push({
                    monthYear: currentMonth,
                    cropName,
                    priceFluctuationRate: parseFloat(fluctuationRate.toFixed(2))
                });
            }
        }
    }

    return priceFluctuationRates;
}

function calculateRevenueGrowthRate(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropRevenues = {};

    // Collect revenues by month and crop
    data.forEach(item => {
        const { monthPlanted, cropName, volumeSold, price } = item;

        if (!monthCropRevenues[monthPlanted]) {
            monthCropRevenues[monthPlanted] = {};
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const revenue = calculatedVolume * calculatedPrice;

        if (!monthCropRevenues[monthPlanted][cropName]) {
            monthCropRevenues[monthPlanted][cropName] = 0;
        }

        monthCropRevenues[monthPlanted][cropName] += revenue;
    });

    const revenueGrowthRates = [];

    // Calculate revenue growth rates
    const months = Object.keys(monthCropRevenues);
    for (let i = 1; i < months.length; i++) {
        const currentMonth = months[i];
        const previousMonth = months[i - 1];

        for (const cropName in monthCropRevenues[currentMonth]) {
            const currentRevenue = monthCropRevenues[currentMonth][cropName];
            const previousRevenue = monthCropRevenues[previousMonth][cropName];

            if (previousRevenue) { // Ensure previous revenue exists
                const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
                revenueGrowthRates.push({
                    monthYear: currentMonth,
                    cropName,
                    revenueGrowthRate: parseFloat(growthRate.toFixed(2))
                });
            }
        }
    }

    return revenueGrowthRates;
}

function calculateNetIncomeGrowthRate(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropNetIncomes = {};

    // Collect net incomes by month and crop
    data.forEach(item => {
        const { monthPlanted, cropName, volumeSold, price, productionCost } = item;

        if (!monthCropNetIncomes[monthPlanted]) {
            monthCropNetIncomes[monthPlanted] = {};
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const income = calculatedVolume * calculatedPrice;
        const totalCost = calculatedVolume * productionCost; // Total cost for the produced volume
        const netIncome = income - totalCost;

        if (!monthCropNetIncomes[monthPlanted][cropName]) {
            monthCropNetIncomes[monthPlanted][cropName] = 0;
        }

        monthCropNetIncomes[monthPlanted][cropName] += netIncome;
    });

    const netIncomeGrowthRates = [];

    // Calculate net income growth rates
    const months = Object.keys(monthCropNetIncomes);
    for (let i = 1; i < months.length; i++) {
        const currentMonth = months[i];
        const previousMonth = months[i - 1];

        for (const cropName in monthCropNetIncomes[currentMonth]) {
            const currentNetIncome = monthCropNetIncomes[currentMonth][cropName];
            const previousNetIncome = monthCropNetIncomes[previousMonth][cropName];

            if (previousNetIncome) { // Ensure previous net income exists
                const growthRate = ((currentNetIncome - previousNetIncome) / previousNetIncome) * 100;
                netIncomeGrowthRates.push({
                    monthYear: currentMonth,
                    cropName,
                    netIncomeGrowthRate: parseFloat(growthRate.toFixed(2))
                });
            }
        }
    }

    return netIncomeGrowthRates;
}


function calculatePestInfestationRate(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropInfestations = data.reduce((acc, item) => {
        const { monthYear, cropName, season, totalPlanted, totalAffected } = item;

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, totalPlanted: 0, totalAffected: 0 };
        }

        acc[monthYear][cropName].totalPlanted += totalPlanted;
        acc[monthYear][cropName].totalAffected += totalAffected;

        return acc;
    }, {});

    return Object.entries(monthCropInfestations).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted, totalAffected }]) => {
            const infestationRate = totalPlanted > 0 ? parseFloat(((totalAffected / totalPlanted) * 100).toFixed(2)) : 0; // Avoid division by zero
            
            return {
                monthYear: month,
                cropName,
                season,
                totalPlanted,
                totalAffected,
                infestationRate
            };
        })
    );
}

function calculateDiseaseIncidenceRate(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropDiseases = data.reduce((acc, item) => {
        const { monthYear, cropName, season, totalPlanted, totalAffected } = item;

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, totalPlanted: 0, totalAffected: 0 };
        }

        acc[monthYear][cropName].totalPlanted += totalPlanted;
        acc[monthYear][cropName].totalAffected += totalAffected;

        return acc;
    }, {});

    return Object.entries(monthCropDiseases).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted, totalAffected }]) => {
            const incidenceRate = totalPlanted > 0 ? parseFloat(((totalAffected / totalPlanted) * 100).toFixed(2)) : 0; // Avoid division by zero
            
            return {
                monthYear: month,
                cropName,
                season,
                totalPlanted,
                totalAffected,
                incidenceRate
            };
        })
    );
}

function calculateDisasterImpactOnYieldLoss(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropLosses = data.reduce((acc, item) => {
        const { monthYear, cropName, season, yieldLoss, numberOfFarmers, areaAffected, grandTotalValue } = item;

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { 
                season, 
                totalYieldLoss: 0, 
                totalFarmers: 0, 
                totalAreaAffected: 0,
                totalGrandValue: 0,
                count: 0 
            };
        }

        acc[monthYear][cropName].totalYieldLoss += yieldLoss;
        acc[monthYear][cropName].totalFarmers += numberOfFarmers;
        acc[monthYear][cropName].totalAreaAffected += areaAffected;
        acc[monthYear][cropName].totalGrandValue += grandTotalValue;
        acc[monthYear][cropName].count++;

        return acc;
    }, {});

    return Object.entries(monthCropLosses).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalYieldLoss, totalFarmers, totalAreaAffected, totalGrandValue, count }]) => {
            const averageYieldLoss = count > 0 ? parseFloat((totalYieldLoss / count).toFixed(2)) : 0; // Avoid division by zero
            
            return {
                monthYear: month,
                cropName,
                season,
                averageYieldLoss,
                totalFarmers,
                totalAreaAffected,
                totalGrandValue
            };
        })
    );
}


// Function to get crop data with price parsing
function getCropData(production, price, pest, disease, crops, type, variety) {
    if (!Array.isArray(production) || !Array.isArray(price) || !Array.isArray(pest) || !Array.isArray(disease)) {
        console.error('Expected all inputs to be arrays');
        return [];
    }

    // Create a map to associate crop names with their types, ensuring unique crop names
    const cropTypeMap = crops.reduce((map, crop) => {
        if (!map[crop.cropName]) {
            map[crop.cropName] = crop.type;
        }
        return map;
    }, {});

    // Filter production data based on the specified type and variety (if available)
    const filteredProduction = production.filter(item => {
        const cropType = cropTypeMap[item.cropName];
        return cropType === type && (!variety || item.variety === variety);
    });

    // Filter price, pest, and disease data based on the specified type only
    const filteredPrice = price.filter(item => cropTypeMap[item.cropName] === type);
    const filteredPest = pest.filter(item => cropTypeMap[item.cropName] === type);
    const filteredDisease = disease.filter(item => cropTypeMap[item.cropName] === type);

    // Initialize variables to hold computed data
    const cropDataMap = new Map();

    filteredProduction.forEach(item => {
        const { cropName, variety, areaPlanted, volumeSold, volumeProduction, price, productionCost } = item;

        // Create a unique key for each crop variety combination
        const key = `${cropName}|${variety || 'default'}`;

        if (!cropDataMap.has(key)) {
            cropDataMap.set(key, {
                cropName,
                variety: variety || '',
                totalPlanted: 0,
                totalArea: 0,
                totalVolume: 0,
                price: 0,
                pestOccurrence: 0,
                diseaseOccurrence: 0,
                totalIncome: 0,
                totalProfit: 0,
                season: '', // Placeholder in case you need it later
            });
        }

        const data = cropDataMap.get(key);
        data.totalPlanted += 1 || 0;
        data.totalVolume += volumeProduction || 0;
        data.totalArea += areaPlanted || 0;
        data.totalIncome += (volumeSold * 1000 || 0) * parsePrice(price);
        data.totalProfit += ((volumeSold * 1000 || 0) * (parsePrice(price) || 0)) - (productionCost || 0);
    });
    // Process filteredPrice to accumulate total prices and counts
    filteredPrice.forEach(item => {
        const { cropName, price } = item;
        const parsedPrice = parsePrice(price);

        cropDataMap.forEach((value, key) => {
            if (key.includes(cropName)) {
                // Initialize the value in cropDataMap if not present
                if (!value.totalPrice) {
                    value.totalPrice = 0;
                    value.count = 0;
                }
                // Accumulate total price and count
                value.totalPrice += parsedPrice;
                value.count += 1;
            }
        });
    });

    // Process filteredPest to accumulate pest occurrences
    filteredPest.forEach(item => {
        const { cropName } = item;

        cropDataMap.forEach((value, mapKey) => {
            if (mapKey.includes(cropName)) {
                // Initialize the pestOccurrence field if not present
                if (!value.pestOccurrence) {
                    value.pestOccurrence = 0;
                }
                // Increment pest occurrences
                value.pestOccurrence += 1;
            }
        });
    });

// Process filteredDisease to accumulate disease occurrences
filteredDisease.forEach(item => {
    const { cropName } = item;

    cropDataMap.forEach((value, mapKey) => {
        if (mapKey.includes(cropName)) {
            // Initialize the diseaseOccurrence field if not present
            if (!value.diseaseOccurrence) {
                value.diseaseOccurrence = 0;
            }
            // Increment disease occurrences
            value.diseaseOccurrence += 1;
        }
    });
});

// Update cropDataMap with average prices
cropDataMap.forEach((value, key) => {
    if (value.count > 0) {
        // Calculate and update the average price
        value.price = value.totalPrice / value.count;
        // Remove temporary properties if needed
        delete value.totalPrice;
        delete value.count;
    }
});


    // Update cropDataMap with average prices
    cropDataMap.forEach((value, key) => {
        if (value.count > 0) {
            value.price = value.totalPrice / value.count; // Calculate average price
            // Remove temporary properties if needed
            delete value.totalPrice;
            delete value.count;
        }
    });


    // Convert the map to an array of results
    return Array.from(cropDataMap.values());
}



export { countAverageAreaPlanted,
    averageVolumeProduction,
    averagePrice,
    UsageLevelFrequency, 
    countPestOccurrence, 
    countDiseaseOccurrence, 
    priceIncomePerHectare, 
    profitPerHectare, 
    getCropData,
    parseDate,
    calculateYearlyAverages, 
    calculateZScoresForGrowthRates, 
    interpretPerformance, 
    interpretPerformanceScore,
    countAverageAreaPlantedBarangay, 
    averageVolumeProductionBarangay, 
    countPestOccurrenceBarangay, 
    countDiseaseOccurrenceBarangay, 
    priceIncomePerHectareBarangay, 
    profitPerHectareBarangay,
    calculateMonthlyAverages
};