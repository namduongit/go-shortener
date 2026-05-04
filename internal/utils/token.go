package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
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

// sha256Hex hashes an arbitrary-length string to a fixed 64-char hex string,
// keeping bcrypt input safely under the 72-byte limit.
func sha256Hex(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

/*
* Generate a pair of API tokens: public and private
* The private token is SHA-256 pre-hashed before bcrypt to avoid the 72-byte limit.
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

	// SHA-256 the combined secret so bcrypt always receives ≤64 bytes
	hashSource := sha256Hex(privateToken + cfg.APISecret + cfg.APISalt)
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
	cfg := config.GetConfig()
	hashSource := sha256Hex(privateToken + cfg.APISecret + cfg.APISalt)

	err := bcrypt.CompareHashAndPassword([]byte(hashKeyLoadFromAccount), []byte(hashSource))
	return err == nil
}
