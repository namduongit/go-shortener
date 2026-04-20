package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(sub any, role string, uuid string, id uint, secretKey string) (*string, error) {
	iat := time.Now().Unix()
	exp := time.Now().Add(7 * 24 * time.Hour).Unix()

	claims := jwt.MapClaims{
		"version_id": id,
		"uuid":       uuid,
		"sub":        sub,
		"role":       role,
		"exp":        exp,
		"iat":        iat,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secretKey))

	if err != nil {
		return nil, err
	}

	return &tokenString, nil
}

func ParseToken(tokenString string, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("Unexpected signing method")
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("Invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("Failed to parse claims")
	}

	return claims, nil
}

func VerifyToken(tokenString string, secretKey string) (jwt.MapClaims, error) {
	claims, err := ParseToken(tokenString, secretKey)
	if err != nil {
		return nil, err
	}

	// iat is a field that displays when the token was created
	_, ok := claims["iat"].(float64)
	if !ok {
		return nil, errors.New("Invalid 'iat' claim")
	}

	exp, ok := claims["exp"].(float64)
	if !ok {
		return nil, errors.New("Invalid 'exp' claim")
	}

	if int64(exp) < time.Now().Unix() {
		return nil, errors.New("Token has expired")
	}

	return claims, nil
}
