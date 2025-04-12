class RetryManager {
  constructor(options = {}) {
    // Configuration options
    this.maxAttempts = options.maxAttempts || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.backoffFactor = options.backoffFactor || 2;
    this.maxDelay = options.maxDelay || 10000;
    
    // State management
    this.currentAttempt = 0;
    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0
    };
    
    // Default retry conditions
    this.retryConditions = [
      error => error.name === 'RetryableError',
      error => error?.retryable === true
    ];
  }

  async execute(fn) {
    this.currentAttempt = 0;
    
    while (this.currentAttempt < this.maxAttempts) {
      this.currentAttempt++;
      this.stats.totalAttempts++;

      try {
        const result = await fn();
        this.stats.successfulAttempts++;
        return result;
      } catch (error) {
        this.stats.failedAttempts++;
        
        if (!this.shouldRetry(error) || this.currentAttempt >= this.maxAttempts) {
          throw error;
        }

        const delay = this.calculateDelay();
        await this.wait(delay);
      }
    }
  }

  shouldRetry(error) {
    return this.retryConditions.some(condition => condition(error));
  }

  calculateDelay() {
    const delay = this.initialDelay * Math.pow(this.backoffFactor, this.currentAttempt - 1);
    return Math.min(delay, this.maxDelay);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalAttempts > 0 ?
        Math.round((this.stats.successfulAttempts / this.stats.totalAttempts) * 100) : 0
    };
  }

  addRetryCondition(condition) {
    if (typeof condition === 'function') {
      this.retryConditions.push(condition);
    }
  }

  reset() {
    this.currentAttempt = 0;
    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0
    };
  }
}

export default RetryManager;