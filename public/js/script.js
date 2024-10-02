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
            volumeProductionPerHectare: totalArea > 0 
                ? parseFloat((totalVolume / totalArea).toFixed(2)) 
                : 0,
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
