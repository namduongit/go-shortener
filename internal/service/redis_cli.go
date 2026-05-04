package service

import (
	"context"
	"encoding/json"
	"time"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func SetUploadSession(ctx context.Context, SessionUUID string, session model.Session) error {
	data, err := json.Marshal(session)
	if err != nil {
		return err
	}

	return config.RedisClient.Set(ctx, SessionUUID, data, time.Until(session.ExpiresAt)).Err()
}

func GetUploadSession(ctx context.Context, sessionUUID string) (*model.Session, error) {
	data, err := config.RedisClient.Get(ctx, sessionUUID).Bytes()
	if err != nil {
		return nil, err
	}
	var session model.Session
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, err
	}
	return &session, nil
}
