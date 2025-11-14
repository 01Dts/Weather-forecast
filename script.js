const weatherCodes = {
    0: { description: 'Clear sky' },
    1: { description: 'Mainly clear' },
    2: { description: 'Partly cloudy' },
    3: { description: 'Overcast' },
    45: { description: 'Foggy' },
    48: { description: 'Foggy' },
    51: { description: 'Light drizzle' },
    53: { description: 'Drizzle' },
    55: { description: 'Heavy drizzle' },
    61: { description: 'Light rain' },
    63: { description: 'Rain' },
    65: { description: 'Heavy rain' },
    71: { description: 'Light snow' },
    73: { description: 'Snow' },
    75: { description: 'Heavy snow' },
    80: { description: 'Rain showers' },
    81: { description: 'Rain showers' },
    82: { description: 'Heavy rain showers' },
    95: { description: 'Thunderstorm' },
    96: { description: 'Thunderstorm with hail' }
};

// DOM elements
const latInput = document.getElementById('latitude');
const lonInput = document.getElementById('longitude');
const btn = document.getElementById('getWeatherBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const forecastDiv = document.getElementById('forecast');

// Event listeners
btn.addEventListener('click', getWeather);
latInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});
lonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

// Main function
async function getWeather() {
    const lat = latInput.value.trim();
    const lon = lonInput.value.trim();

    // Validation
    if (!lat || !lon) {
        showError('Please enter both latitude and longitude');
        return;
    }

    // Clear previous results
    hideError();
    forecastDiv.innerHTML = '';
    showLoading();
    btn.disabled = true;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto&forecast_days=5`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        displayForecast(data);

    } catch (error) {
        showError('Unable to fetch weather data. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
        btn.disabled = false;
    }
}

// Display forecast
function displayForecast(data) {
    const daily = data.daily;

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const weather = getWeatherInfo(daily.weathercode[i]);
        
        const card = document.createElement('div');
        card.className = 'day-card';
        
        card.innerHTML = `
            <div class="day-name">${getDayName(date, i)}</div>
            <div class="date">${formatDate(date)}</div>
            <div class="temperature">${Math.round(daily.temperature_2m_max[i])}°</div>
            <div class="description">${weather.description}</div>
            <div class="details">
                <div>Low: ${Math.round(daily.temperature_2m_min[i])}°C</div>
                <div>Rain: ${daily.precipitation_sum[i]} mm</div>
                <div>Wind: ${Math.round(daily.windspeed_10m_max[i])} km/h</div>
            </div>
        `;
        
        forecastDiv.appendChild(card);
    }
}

function getWeatherInfo(code) {
    return weatherCodes[code] || { icon: '🌡️', description: 'Unknown' };
}

function getDayName(date, index) {
    if (index === 0) return 'Today';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function hideError() {
    errorDiv.classList.remove('show');
}

function showLoading() {
    loadingDiv.classList.add('show');
}

function hideLoading() {
    loadingDiv.classList.remove('show');
}