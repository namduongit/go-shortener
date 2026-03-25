package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(sub any, secretKey string, role string, uid int) (*string, error) {
	iat := jwt.NewNumericDate(time.Now())
	exp := jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour))

	claims := jwt.MapClaims{
		"sub":     sub,
		"role":    role,
		"uid":     uid,
		"version": 1,
		"time": map[string]any{
			"iat": iat,
			"exp": exp,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return nil, err
	}
	return &tokenString, nil
}

func ParseToken(tokenStr string, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return token.Claims.(jwt.MapClaims), nil
}

func VerifyToken(tokenStr string, secretKey string) bool {
	_, err := ParseToken(tokenStr, secretKey)
	return err == nil
}
