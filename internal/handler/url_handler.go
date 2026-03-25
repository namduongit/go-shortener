package handler

import (
	"fmt"
	"net/http"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var port = config.GetConfig().PORT
var host = config.GetConfig().HOST

func GetUrls(c *gin.Context) {
	uid := c.GetUint("uid")
	if uid == 0 {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"User not exists"},
			config.RestFulNotFound,
			config.RestFulCodeInvalid,
		))
		return
	}

	urls, err := service.GetListByUserID(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch urls"})
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]any{
			"accountID": uid,
			"urls":      urls,
		},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

type CreateURLRequest struct {
	URL string `json:"url"`
}

func CreateShortURL(c *gin.Context) {
	userID := c.GetUint("uid")

	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.URL == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Required url field"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	var user model.User
	config.DB.Preload("Plan").First(&user, userID)

	if user.PlanID == 0 {
		c.JSON(http.StatusForbidden, config.GinErrorResponse(
			[]string{"User plan not found"},
			config.RestFulForbidden,
			config.RestFulCodeForbidden,
		))
		return
	}

	var count int64
	config.DB.Model(&model.URL{}).
		Where("user_id = ?", userID).
		Count(&count)

	if int(count) >= user.Plan.URLLimit {
		c.JSON(http.StatusForbidden, config.GinErrorResponse(
			[]string{"Url limit exceeded"},
			config.RestFulForbidden,
			config.RestFulCodeForbidden,
		))
		return
	}

	code := strings.ReplaceAll(uuid.New().String(), "-", "")[:6]

	url := model.URL{
		ShortCode: code,
		LongURL:   req.URL,
		UserID:    userID,
	}

	config.DB.Create(&url)

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]string{
			"short_url": host + ":" + port + "/api/urls/" + code,
		},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func RedirectURL(c *gin.Context) {
	code := c.Param("code")
	fmt.Println("Redirecting code:", code)

	longURL, err := service.GetLongURL(code)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			[]string{"Url not found"},
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	c.Redirect(http.StatusFound, longURL)
}

func DeleteURL(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Missing code"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if err := service.DeleteURL(code); err != nil {
		status := http.StatusInternalServerError
		if err == gorm.ErrRecordNotFound {
			status = http.StatusNotFound
		}
		c.JSON(status, config.GinErrorResponse(
			[]string{"Cannot delete url"},
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	c.Status(http.StatusNoContent)
}
