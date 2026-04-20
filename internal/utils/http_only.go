package utils

import (
	"net/http"
	"url-shortener/internal/config"

	"github.com/gin-gonic/gin"
)

var cfg = config.GetConfig()

func ClearAccessTokenCookie(c *gin.Context) {
	secureCookie := cfg.ENV == config.Production
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "isLogin",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})
}

func SetAccessTokenCookie(c *gin.Context, token string) {
	secureCookie := cfg.ENV == config.Production
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    token,
		Path:     "/",
		MaxAge:   24 * 60 * 60 * 7,
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "isLogin",
		Value:    "true",
		Path:     "/",
		MaxAge:   24 * 60 * 60 * 7,
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})
}
