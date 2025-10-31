const axios = require('axios');

class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 2;
    this.retryDelay = 2000; // 2 seconds
  }

  async analyzeCode(code, language, fileName, fileSize) {
    const payload = {
      code,
      language,
      fileName,
      fileSize
    };

    return this.executeWithRetry(
      () => this.makeRequest('/api/analyze', payload),
      (error) => this.shouldRetry(error)
    );
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async executeWithRetry(requestFn, shouldRetryFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      // Don't retry on 429 (rate limit)
      if (error.status === 429) {
        throw error;
      }

      // Don't retry on 400 (validation error)
      if (error.status === 400) {
        throw error;
      }

      // Retry for other errors
      if (shouldRetryFn(error) && attempt < this.maxRetries) {
        await this.delay(this.retryDelay);
        return this.executeWithRetry(requestFn, shouldRetryFn, attempt + 1);
      }

      throw error;
    }
  }

  shouldRetry(error) {
    // Retry on network errors
    if (!error.status || error.status >= 500) {
      return true;
    }
    return false;
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorData = error.response.data;
      const message = errorData?.error || 'Unknown error';

      if (status === 400) {
        return {
          status,
          message,
          userMessage: message
        };
      }

      if (status === 401) {
        return {
          status,
          message,
          userMessage: 'Analysis service not properly configured'
        };
      }

      if (status === 429) {
        return {
          status,
          message,
          userMessage: 'API quota exceeded. Please try again in a few moments.'
        };
      }

      if (status === 503) {
        return {
          status,
          message,
          userMessage: 'Analysis service temporarily unavailable. Try again in a moment.'
        };
      }

      if (status >= 500) {
        return {
          status,
          message,
          userMessage: 'Analysis service encountered an error. Please try again.'
        };
      }

      return {
        status,
        message,
        userMessage: message
      };
    }

    if (error.code === 'ECONNREFUSED') {
      return {
        status: 0,
        message: 'Connection refused',
        userMessage: 'Unable to connect to analysis server. Make sure the backend is running on http://localhost:3000'
      };
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return {
        status: 0,
        message: error.code,
        userMessage: 'Unable to connect to analysis server. Check your internet connection.'
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        status: 0,
        message: 'Request timeout',
        userMessage: 'Analysis is taking longer than expected. Please try again.'
      };
    }

    return {
      status: 0,
      message: error.message || 'Unknown error',
      userMessage: error.message || 'An unexpected error occurred'
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ApiClient;
