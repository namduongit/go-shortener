package config

import (
	"log"
	"os"
	"strconv"
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

	// Client
	ClientHost string

	// Secret key for JWT and Token
	JWTSecret string

	// Secret key for API
	APISecret string
	APISalt   string

	// Mail server configuration
	MailHost     string
	MailPort     int
	MailUsername string
	MailPassword string
	MailSecret   string

	// Database
	DBHost     string
	DBUser     string
	DBPassword string
	DBName     string
	DBPort     string
	DBSSLMode  string

	// MiniO
	MiniOFinalBucketName string
	MinIOTmpBucketName   string
	MinIOEndpoint        string
	MinIOAccessKey       string
	MinIOSecretKey       string

	// Redis
	RedisHost     string
	RedisPassword string
	RedisDB       int
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
			/* Environment */
			ENV: Environment(getEnv("ENV", string(Development))),

			/* Server */
			Port:       getEnv("PORT", "8080"),
			ServerHost: getEnv("SERVER_HOST", "http://localhost:8080"),

			/* Client */
			ClientHost: getEnv("CLIENT_HOST", "http://localhost:5173"),

			/* Secret key for JWT and Token */
			JWTSecret: getEnv("JWT_SECRET", "secret_key"),

			/* API Secret and Salt */
			APISecret: getEnv("API_SECRET", "api_secret"),
			APISalt:   getEnv("API_SALT", "api_salt"),

			/* Mail server configuration */
			MailHost: getEnv("MAIL_HOST", "smtp.gmail.com"),
			MailPort: func() int {
				port, err := strconv.Atoi(getEnv("MAIL_PORT", "587"))
				if err != nil {
					log.Printf("warning: invalid MAIL_PORT, using default: %v", err)
					return 587
				}
				return port
			}(),
			MailUsername: getEnv("MAIL_USERNAME", "email@gmail.com"),
			MailPassword: getEnv("MAIL_PASSWORD", "password"),
			MailSecret:   getEnv("MAIL_SECRECT", "mail_secret"),

			/* Database Configuration - Postgres */
			DBHost:     getEnv("DB_HOST", "localhost"),
			DBUser:     getEnv("DB_USER", "postgres"),
			DBPassword: getEnv("DB_PASSWORD", ""),
			DBName:     getEnv("DB_NAME", "gms_cloud"),
			DBPort:     getEnv("DB_PORT", "5432"),
			DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

			/* MinIO Configuration */
			MiniOFinalBucketName: getEnv("MINIO_FINAL_BUCKET_NAME", "gms-cloud"),
			MinIOTmpBucketName:   getEnv("MINIO_TMP_BUCKET_NAME", "gms-cloud-tmp"),
			MinIOEndpoint:        getEnv("MINIO_ENDPOINT", "localhost:9000"),
			MinIOAccessKey:       getEnv("MINIO_ACCESS_KEY", "access_key"),
			MinIOSecretKey:       getEnv("MINIO_SECRET_KEY", "secret_key"),

			/* Redis Configuration */
			RedisHost:     getEnv("REDIS_HOST", "localhost:6379"),
			RedisPassword: getEnv("REDIS_PASSWORD", ""),
			RedisDB: func() int {
				db, err := strconv.Atoi(getEnv("REDIS_DB", "0"))
				if err != nil {
					log.Printf("warning: invalid REDIS_DB, using default: %v", err)
					return 0
				}
				return db
			}(),
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
