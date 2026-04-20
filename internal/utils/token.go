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

/*
* Generate a secure random token with a given prefix and size
 */
func generateSecureToken(prefix string, size int) (string, error) {
	randomBytes := make([]byte, size)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	encoded := base64.RawURLEncoding.EncodeToString(randomBytes)
	return prefix + encoded, nil
}

/*
* Generate a pair of API tokens: public and private
* The private token is hashed with bcrypt and stored in the database
* The public token is returned to the user and used for API requests
 */
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

/*
* Verify token from API request by comparing the hash
? true if private token = hash(private token from request + secret + salt)
*/
func VerifyAPIToken(privateToken string, hashKeyLoadFromAccount string) bool {
	hashSource := privateToken + cfg.APISecret + cfg.APISalt

	err := bcrypt.CompareHashAndPassword([]byte(hashKeyLoadFromAccount), []byte(hashSource))
	return err == nil
}
