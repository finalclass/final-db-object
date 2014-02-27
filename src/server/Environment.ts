class Environment {

  static DEVELOPMENT:Environment = new Environment('development');
  static STAGING:Environment = new Environment('staging');
  static PRODUCTION:Environment = new Environment('production');

  constructor(private value:string) {
    
  }

  public toString() : string {
    return this.value;
  }

  public static fromString(env:string) : Environment {
    if (env === 'development') {
      return Environment.DEVELOPMENT;
    }
    if (env === 'staging') {
      return Environment.STAGING;
    }
    if (env === 'production') {
      return Environment.PRODUCTION;
    }
    throw new TypeError('Invalid environment string');
  }

}

export = Environment;