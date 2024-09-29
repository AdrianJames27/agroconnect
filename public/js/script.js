function calculateProfitMargin(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropMargins = data.reduce((acc, item) => {
        const { monthHarvested, cropName, season, volumeSold, price, productionCost } = item;

        if (!acc[monthHarvested]) {
            acc[monthHarvested] = {};
        }

        if (!acc[monthHarvested][cropName]) {
            acc[monthHarvested][cropName] = { season, totalProfit: 0, totalRevenue: 0 };
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const totalRevenue = calculatedVolume * calculatedPrice;
        const totalCost = productionCost * calculatedVolume;

        acc[monthHarvested][cropName].totalRevenue += totalRevenue;
        acc[monthHarvested][cropName].totalProfit += totalRevenue - totalCost;

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
        const { monthHarvested, cropName, season, volumeSold, productionCost } = item;

        if (!acc[monthHarvested]) {
            acc[monthHarvested] = {};
        }

        if (!acc[monthHarvested][cropName]) {
            acc[monthHarvested][cropName] = { season, totalCost: 0, totalVolume: 0 };
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const totalCost = productionCost * calculatedVolume;

        acc[monthHarvested][cropName].totalCost += totalCost;
        acc[monthHarvested][cropName].totalVolume += calculatedVolume;

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
        const { monthHarvested, cropName, season, volumeSold, price, productionCost, areaPlanted } = item;

        if (!acc[monthHarvested]) {
            acc[monthHarvested] = {};
        }

        if (!acc[monthHarvested][cropName]) {
            acc[monthHarvested][cropName] = { season, totalRevenue: 0, totalCost: 0, totalArea: 0 };
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const totalRevenue = calculatedVolume * calculatedPrice;
        const totalCost = productionCost * calculatedVolume;

        acc[monthHarvested][cropName].totalRevenue += totalRevenue;
        acc[monthHarvested][cropName].totalCost += totalCost;
        acc[monthHarvested][cropName].totalArea += areaPlanted;

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
        const { monthHarvested, cropName, price } = item;

        if (!monthCropPrices[monthHarvested]) {
            monthCropPrices[monthHarvested] = {};
        }

        monthCropPrices[monthHarvested][cropName] = parsePrice(price);
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
        const { monthHarvested, cropName, volumeSold, price } = item;

        if (!monthCropRevenues[monthHarvested]) {
            monthCropRevenues[monthHarvested] = {};
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const revenue = calculatedVolume * calculatedPrice;

        if (!monthCropRevenues[monthHarvested][cropName]) {
            monthCropRevenues[monthHarvested][cropName] = 0;
        }

        monthCropRevenues[monthHarvested][cropName] += revenue;
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
        const { monthHarvested, cropName, volumeSold, price, productionCost } = item;

        if (!monthCropNetIncomes[monthHarvested]) {
            monthCropNetIncomes[monthHarvested] = {};
        }

        const calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        const calculatedPrice = parsePrice(price);
        const income = calculatedVolume * calculatedPrice;
        const totalCost = calculatedVolume * productionCost; // Total cost for the produced volume
        const netIncome = income - totalCost;

        if (!monthCropNetIncomes[monthHarvested][cropName]) {
            monthCropNetIncomes[monthHarvested][cropName] = 0;
        }

        monthCropNetIncomes[monthHarvested][cropName] += netIncome;
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