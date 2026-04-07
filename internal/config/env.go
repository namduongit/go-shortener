package config

import (
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Environment string

const (
	Development Environment = "DEVELOPMENT"
	Production  Environment = "PRODUCTION"
)

type AppConfig struct {
	// Environment production
	ENV Environment

	// Server
	Port       string
	ServerHost string

	// Secret key for JWT and Token
	JWTSecret   string
	TokenSecret string

	// Client
	ClientHost string

	// Database
	DBHost     string
	DBUser     string
	DBPassword string
	DBName     string
	DBPort     string
	DBSSLMode  string

	// MiniO
	MinIOEndpoint  string
	MinIOAccessKey string
	MinIOSecretKey string
}

var (
	cfg     AppConfig
	cfgOnce sync.Once
)

func GetConfig() AppConfig {
	cfgOnce.Do(func() {
		if err := godotenv.Load(); err != nil {
			log.Printf("warning: could not load .env file: %v", err)
		}

		cfg = AppConfig{
			ENV: Environment(getEnv("ENV", string(Development))),

			Port:       getEnv("PORT", "8080"),
			ServerHost: getEnv("SERVER_HOST", "http://localhost:8080"),

			ClientHost: getEnv("CLIENT_HOST", "http://localhost:5173"),

			DBHost:     getEnv("DB_HOST", "localhost"),
			DBUser:     getEnv("DB_USER", "postgres"),
			DBPassword: getEnv("DB_PASSWORD", ""),
			DBName:     getEnv("DB_NAME", "gms_cloud"),
			DBPort:     getEnv("DB_PORT", "5432"),
			DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
			JWTSecret:  getEnv("JWT_SECRET", "secret_key"),

			MinIOEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
			MinIOAccessKey: getEnv("MINIO_ACCESS_KEY", "access_key"),
			MinIOSecretKey: getEnv("MINIO_SECRET_KEY", "secret_key"),
		}
	})

	return cfg
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
