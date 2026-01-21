const axios = require('axios');

const getCurrentWeather = async (req, res) => {
  try {
    const city = req.query.city || 'London';
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'WEATHER_API_KEY is not configured on the server',
      });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
      },
      timeout: 8000,
    });

    const data = response.data;

    const result = {
      city: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      feelsLike: data.main?.feels_like,
      description: data.weather?.[0]?.description,
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
      raw: data,
    };

    return res.status(200).json({
      success: true,
      message: 'Weather fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching weather:', error.message);

    if (error.response) {
      return res.status(error.response.status || 502).json({
        success: false,
        message: 'Failed to fetch weather from external API',
        error: error.response.data || error.message,
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Weather API request timed out',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unexpected error fetching weather',
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentWeather,
};


