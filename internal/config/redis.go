package config

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var RedisContext = context.Background()
var RedisClient *redis.Client

func InitRedis() {
	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisHost,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	_, err := redisClient.Ping(RedisContext).Result()
	if err != nil {
		panic(err)
	}

	log.Println("Connect to Redis cloud success")

	RedisClient = redisClient
}
