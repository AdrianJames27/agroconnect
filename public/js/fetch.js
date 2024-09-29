
async function getCrop(type = '') {
    try {
        const response = await $.ajax({
            url: 'api/crops', // Adjust if needed
            type: 'GET',
            dataType: 'json'
        });
        return response.filter(crop => !type || crop.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
        console.error('An error occurred while fetching the crop data:', error);
        throw error;
    }
}

// Function to determine year range from data
async function getYearRange() {
    try {
        let data = await getProductions();
        if (data.length === 0) return 'N/A';

        // Extract years from monthYear
        let years = data.map(record => {
            let yearMatch = record.monthPlanted.match(/\d{4}$/);
            return yearMatch ? parseInt(yearMatch[0], 10) : null;
        }).filter(year => year !== null);

        if (years.length === 0) return 'N/A';

        let minYear = Math.min(...years);
        let maxYear = Math.max(...years);

        // Return year range as a string
        return minYear === maxYear ? `${minYear}` : `${minYear} to ${maxYear}`;
    } catch (error) {
        console.error('Error fetching or processing production data:', error);
        return 'N/A';
    }
}

function getProductions() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api/productions', // Adjust URL as necessary
            method: 'GET',
            dataType: 'json',
            success: function(data) {
            
                                                       resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch production data:', textStatus, errorThrown);
                reject([]);
            }
        });
    });
}

function getDownloadCount() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api/downloads/count', // Adjust the URL as necessary
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                resolve(data.download_count); // Resolve the download count
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch download count:', textStatus, errorThrown);
                reject(0); // Reject with 0 or handle as necessary
            }
        });
    });
}


async function getBarangay() {
    try {
        const response = await $.ajax({
            url: 'api/barangays', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getFarmer() {
    try {
        const response = await $.ajax({
            url: 'api/farmers', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getRecord() {
    try {
        const response = await $.ajax({
            url: 'api/records', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getSoilHealth() {
    try {
        const response = await $.ajax({
            url: 'api/soilhealths', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getUsers() {
    try {
        const response = await $.ajax({
            url: 'api/users', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getConcerns() {
    try {
        const response = await $.ajax({
            url: 'api/concerns', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getDataEntries() {
    try {
        // Fetch data asynchronously
        let [production, price, pest, disease, soilHealth] = await Promise.all([
            getProductions(),
            getPrice(),
            getPest(), 
            getDisease(),
            getSoilHealth()
        ]);

        // Calculate the sum of lengths of all data entries
        let totalLength = production.length + price.length + pest.length + disease.length + soilHealth.length;

        return totalLength;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}


async function getProduction(cropName = '', season = '') {
    try {
        const response = await $.ajax({
            url: 'api/productions', // Update this path to the location of your production.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the production data:', error);
        throw error;
    }
}

async function getPrice(cropName = '', season = '') {
    try {
        const response = await $.ajax({
            url: 'api/prices', // Update this path to the location of your price.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the price data:', error);
        throw error;
    }
}

async function getPest(cropName = '', season = '') {
    try {
        const response = await $.ajax({
            url: 'api/pests', // Update this path to the location of your pest.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the pest data:', error);
        throw error;
    }
}

async function getDisease(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/diseases', // Update this path to the location of your disease.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the disease data:', error);
        throw error;
    }
}

function addDownload(name, type) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api/downloads/add', // Adjust the URL as necessary
            method: 'POST',
            dataType: 'json',
            data: {
                name: name,
                type: type,
            },
            success: function(data) {
                resolve(data); // Resolve with the server response (e.g., success message)
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to add download:', textStatus, errorThrown);
                reject(jqXHR.responseJSON || 'An error occurred'); // Reject with error message
            }
        });
    });
}

async function getUniqueCropNames(season, type) {
    try {
        const response = await fetch(`/api/unique-crop-names?season=${encodeURIComponent(season)}&type=${encodeURIComponent(type)}`);
        const uniqueCropNames = await response.json();
        return uniqueCropNames.map(name => name.toLowerCase());
    } catch (error) {
        console.error('Failed to fetch unique crop names:', error);
        return [];
    }
}

export { getCrop, getBarangay, getProduction, getProductions, getPrice, getPest, 
    getDisease, getFarmer, getDataEntries, getRecord, getUsers, getConcerns, 
    getYearRange, getDownloadCount, getUniqueCropNames, addDownload };
