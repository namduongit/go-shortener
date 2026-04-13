package utils

import (
	"crypto/rand"
	"encoding/base64"
	"url-shortener/internal/config"

	"golang.org/x/crypto/bcrypt"
)

type APITokenPair struct {
	PublicToken      string
	PrivateToken     string
	PrivateTokenHash string
}

func generateSecureToken(prefix string, size int) (string, error) {
	randomBytes := make([]byte, size)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	encoded := base64.RawURLEncoding.EncodeToString(randomBytes)
	return prefix + encoded, nil
}

func GenerateAPITokenPair() (*APITokenPair, error) {
	cfg := config.GetConfig()

	publicToken, err := generateSecureToken("gpk_", 18)
	if err != nil {
		return nil, err
	}

	privateToken, err := generateSecureToken("gsk_", 32)
	if err != nil {
		return nil, err
	}

	hashSource := privateToken + cfg.APISecret + cfg.APISalt
	privateTokenHash, err := bcrypt.GenerateFromPassword([]byte(hashSource), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return &APITokenPair{
		PublicToken:      publicToken,
		PrivateToken:     privateToken,
		PrivateTokenHash: string(privateTokenHash),
	}, nil
}

func VerifyAPIToken(privateToken string, privateTokenHash string) bool {
	cfg := config.GetConfig()
	hashSource := privateToken + cfg.APISecret + cfg.APISalt

	err := bcrypt.CompareHashAndPassword([]byte(privateTokenHash), []byte(hashSource))
	return err == nil
}
