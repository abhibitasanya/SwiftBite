declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      CORS_ORIGIN?: string;
      MYSQL_HOST?: string;
      MYSQL_PORT?: string;
      MYSQL_USER?: string;
      MYSQL_PASSWORD?: string;
      MYSQL_DATABASE?: string;
    }
  }
}

export {};
