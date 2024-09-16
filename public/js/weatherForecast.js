import Dialog from '../management/components/helpers/Dialog.js';

$(document).ready(function() {
  let apiKey;
  let locationKey;
  let lastFetchTimestamp = 0; // Initialize timestamp in memory
  let cachedWeatherData = null; // Initialize data cache
  const fetchInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  $(document).ready(function() {
    $('#infoBtn').click(function() {
        let htmlScript = `
        <p>Welcome to the Weather Forecast page. This tool provides a 5-day weather forecast to help you plan and prepare for upcoming weather conditions. Follow these instructions to use the tool effectively:</p>

        <ol>
          <li><strong>View the 5-Day Forecast:</strong><br>
          The forecast displays weather information for the next five days. Each day includes detailed data on the following parameters:
            <ul>
              <li><strong>Temperature:</strong> The expected high and low temperatures for each day.</li>
              <li><strong>Humidity:</strong> The forecasted humidity levels, indicating the amount of moisture in the air.</li>
              <li><strong>Precipitation:</strong> The amount of expected precipitation, including rain, snow, or other forms of moisture.</li>
              <li><strong>Rainfall Probability:</strong> The likelihood of rainfall, expressed as a percentage probability.</li>
            </ul>
          </li>

          <li><strong>Understand Weather Parameters:</strong><br>
          Each weather parameter provides insights into the expected conditions:
            <ul>
              <li><strong>Temperature:</strong> Helps you prepare for hot or cold weather.</li>
              <li><strong>Humidity:</strong> Useful for understanding comfort levels and potential impacts on health.</li>
              <li><strong>Precipitation:</strong> Indicates potential for rain or snow, helping you plan outdoor activities.</li>
              <li><strong>Rainfall Probability:</strong> Allows you to gauge the chance of rain and plan accordingly.</li>
            </ul>
          </li>

        <p>This tool provides comprehensive weather forecasting to help you make informed decisions based on expected weather conditions.</p>
        `;

        Dialog.showInfoModal(htmlScript);
    });
});


  async function fetchWeatherData() {
    const url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&details=true&metric=true`;
  
    try {
      // Fetch weather data
      const data = await $.getJSON(url);
      
      // Save data to your API endpoint
      await $.ajax({
        url: 'api/weatherforecasts',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          weather_data: data,
          timestamp: new Date().getTime()
        })
      });
  
      console.log('Data successfully saved to the server.');
  
      // Cache the data in memory
      cachedWeatherData = data;
      lastFetchTimestamp = new Date().getTime(); // Update the timestamp
  
      displayWeatherData(data);
    } catch (error) {
      console.error('Error fetching or saving forecast data:', error);
    }
  }
  

  function setWeatherBackground(weatherCondition) {
    const now = new Date();
    const currentHour = now.getHours();
    const sunriseHour = 6; // Example sunrise hour
    const sunsetHour = 18; // Example sunset hour

    let backgroundImage;

    // Function to get default background image based on day or night
    function getDefaultBackground() {
      if (currentHour >= sunriseHour && currentHour < sunsetHour) {
        // Day time
        return 'url("../img/weather/day.jpeg")'; // Default day image
      } else {
        // Night time
        return 'url("../img/weather/night.jpeg")'; // Default night image
      }
    }

   // Convert weatherCondition to lowercase for case-insensitive comparison
    const lowerCaseWeatherCondition = weatherCondition ? weatherCondition.toLowerCase() : '';

    switch (true) {
      case lowerCaseWeatherCondition.includes('sunny'):
        backgroundImage = 'url("../img/weather/day.jpeg")'; // Daytime background image for sunny weather
        break;
      case lowerCaseWeatherCondition.includes('cloudy'):
        backgroundImage = 'url("../img/weather/cloudy.jpeg")'; // Daytime or nighttime background image for cloudy weather
        break;
      case lowerCaseWeatherCondition.includes('rain') ||
          lowerCaseWeatherCondition.includes('drizzle') ||
          lowerCaseWeatherCondition.includes('shower'):
        backgroundImage = 'url("../img/weather/rain.jpeg")'; // Daytime or nighttime background image for rainy weather
        break;
      case lowerCaseWeatherCondition.includes('storm') ||
          lowerCaseWeatherCondition.includes('thunderstorm'):
        backgroundImage = 'url("../img/weather/storm.jpeg")'; // Nighttime background image for stormy weather
        break;
      default:
        backgroundImage = getDefaultBackground(); // Default to day or night image based on time
    }


    // Apply the background image to the parent card
    $('.bg').css({
      'background-image': backgroundImage,
      'background-size': 'cover',
      'background-position': 'center'
    });
  }

  function displayWeatherData(data) {
    const now = new Date();
    const currentHour = now.getHours();

    // Process today's forecast data
    const todayForecast = data.DailyForecasts[0];
    const todayDate = new Date(todayForecast.Date);
    const todayDayIcon = `https://developer.accuweather.com/sites/default/files/${("0" + todayForecast.Day.Icon).slice(-2)}-s.png`;
    const todayNightIcon = `https://developer.accuweather.com/sites/default/files/${("0" + todayForecast.Night.Icon).slice(-2)}-s.png`;
    const todayDayPhrase = todayForecast.Day.IconPhrase;
    const todayNightPhrase = todayForecast.Night.IconPhrase;
    const todayDayTemperature = todayForecast.Temperature.Maximum.Value;
    const todayNightTemperature = todayForecast.Temperature.Minimum.Value;
    const todayDayHumidity = todayForecast.Day.RelativeHumidity.Maximum || 0;
    const todayNightHumidity = todayForecast.Night.RelativeHumidity.Maximum || 0;
    const todayDayPrecipitation = todayForecast.Day.PrecipitationIntensity || 'None';
    const todayNightPrecipitation = todayForecast.Night.PrecipitationIntensity || 'None';
    const todayDayRainfallProbability = todayForecast.Day.PrecipitationProbability || 0;
    const todayNightRainfallProbability = todayForecast.Night.PrecipitationProbability || 0;

    // Determine if it's day or night
    const sunriseHour = 6; // Example sunrise hour
    const sunsetHour = 18; // Example sunset hour
    let weatherCondition;
    
    if (currentHour >= sunriseHour && currentHour < sunsetHour) {
      // Day time
      weatherCondition = todayDayPhrase;
      $('#today').html(`
        <h4>${todayDayPhrase}</h4>
        <img src="${todayDayIcon}" alt="${todayDayPhrase}" class="weather-icon">
        <p>Temperature: ${todayDayTemperature}°C</p>
        <p>Humidity: ${todayDayHumidity}%</p>
        <p>Precipitation: ${todayDayPrecipitation}</p>
        <p>Rainfall Probability: ${todayDayRainfallProbability}%</p>
      `);
    } else {
      // Night time
      weatherCondition = todayNightPhrase;
      $('#today').html(`
        <h4>${todayNightPhrase}</h4>
        <img src="${todayNightIcon}" alt="${todayNightPhrase}" class="weather-icon">
        <p>Temperature: ${todayNightTemperature}°C</p>
        <p>Humidity: ${todayNightHumidity}%</p>
        <p>Precipitation: ${todayNightPrecipitation}</p>
        <p>Rainfall Probability: ${todayNightRainfallProbability}%</p>
      `);
    }

    // Update background based on weather condition
    setWeatherBackground(weatherCondition);

    // Process the 5-day forecast data
    const forecast = data.DailyForecasts.slice(1);
    const forecastDiv = $('#forecast');

    forecastDiv.empty(); // Clear existing forecast items

    forecast.forEach(day => {
      const date = new Date(day.Date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayTemperature = day.Temperature.Maximum.Value;
      const nightTemperature = day.Temperature.Minimum.Value;
      const dayHumidity = day.Day.RelativeHumidity.Maximum || 0;
      const nightHumidity = day.Night.RelativeHumidity.Maximum || 0;
      const dayPrecipitation = day.Day.PrecipitationIntensity || 'None';
      const nightPrecipitation = day.Night.PrecipitationIntensity || 'None';
      const dayIconPhrase = day.Day.IconPhrase;
      const nightIconPhrase = day.Night.IconPhrase;
      const dayIcon = `https://developer.accuweather.com/sites/default/files/${("0" + day.Day.Icon).slice(-2)}-s.png`;
      const nightIcon = `https://developer.accuweather.com/sites/default/files/${("0" + day.Night.Icon).slice(-2)}-s.png`;
      const dayRainfallProbability = day.Day.PrecipitationProbability || 0;
      const nightRainfallProbability = day.Night.PrecipitationProbability || 0;

      let forecastItem;

      if (currentHour >= sunriseHour && currentHour < sunsetHour) {
        // Day time
        forecastItem = $(`
          <div class="col-md-3 mb-4 forecast-card">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${formattedDate} (${dayOfWeek})</h5>
                <h6 class="card-subtitle mb-2 text-white">Day</h6>
                <img src="${dayIcon}" alt="${dayIconPhrase}" class="weather-icon">
                <p class="card-text">Temperature: ${dayTemperature}°C</p>
                <p class="card-text">Humidity: ${dayHumidity}%</p>
                <p class="card-text">Precipitation: ${dayPrecipitation}</p>
                <p class="card-text">Rainfall Probability: ${dayRainfallProbability}%</p>
              </div>
            </div>
          </div>
        `);
      } else {
        // Night time
        forecastItem = $(`
          <div class="col-md-3 mb-4 forecast-card">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${formattedDate} (${dayOfWeek})</h5>
                <h6 class="card-subtitle mb-2 text-white">Night</h6>
                <img src="${nightIcon}" alt="${nightIconPhrase}" class="weather-icon">
                <p class="card-text">Temperature: ${nightTemperature}°C</p>
                <p class="card-text">Humidity: ${nightHumidity}%</p>
                <p class="card-text">Precipitation: ${nightPrecipitation} </p>
                <p class="card-text">Rainfall Probability: ${nightRainfallProbability}%</p>
              </div>
            </div>
          </div>
        `);
      }

      forecastDiv.append(forecastItem);
    });
  }

  async function loadWeatherData() {
    const now = new Date().getTime();
  
    try {
      // Perform a GET request to check if cached data exists and is valid
      const response = await $.getJSON('api/weatherforecasts');
      const cachedTimestamp = response.timestamp;
      const cachedData = response.weather_data;
  
      if (cachedTimestamp && (now - cachedTimestamp) < fetchInterval) {
        // Use cached data if it's recent enough
        displayWeatherData(cachedData);
        console.log('Displayed cached weather data.');
      } else {
        console.log('Cached weather data is not valid or not available.');
        // Fetch new data if no recent cached data
        await fetchWeatherData();
      }
    } catch (error) {
      console.error('Error fetching cached data from the server:', error);
      // Fetch new data if there was an error fetching the cached data
      await fetchWeatherData();
    }
  }

  async function fetchWeatherKeys() {
    try {
        const response = await fetch('/api/weather-keys');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        apiKey = data.weather_api_key;
        locationKey = data.weather_location_key;

        console.log('Weather API Key:', apiKey);
        console.log('Weather Location Key:', locationKey);

    } catch (error) {
        console.error('Error fetching weather keys:', error);
    }
}

  $(document).ready(async function() {
      // Fetch the API keys before fetching weather data
      await fetchWeatherKeys();
    
      // Fetch and display the weather data after keys are available
      if (apiKey && locationKey) {
          await loadWeatherData();
      } else {
          console.error('Weather API Key or Location Key is missing.');
      }
  });
});