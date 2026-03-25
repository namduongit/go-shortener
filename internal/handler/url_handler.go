package handler

import (
	"net/http"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CreateURLRequest struct {
	URL string `json:"url"`
}

func CreateShortURL(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid"})
		return
	}

	var user model.User
	config.DB.Preload("Plan").First(&user, userID)

	var count int64
	config.DB.Model(&model.URL{}).
		Where("user_id = ?", userID).
		Count(&count)

	if int(count) >= user.Plan.URLLimit {
		c.JSON(http.StatusForbidden, gin.H{"error": "url limit exceeded"})
		return
	}

	code := strings.ReplaceAll(uuid.New().String(), "-", "")[:6]

	url := model.URL{
		ShortCode: code,
		LongURL:   req.URL,
		UserID:    userID,
	}

	config.DB.Create(&url)

	c.JSON(http.StatusOK, gin.H{
		"short_url": "http://localhost:8080/" + code,
	})
}

func RedirectURL(c *gin.Context) {
	code := c.Param("code")

	longURL, err := service.GetLongURL(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "url not found"})
		return
	}

	c.Redirect(http.StatusFound, longURL)
}

func GetAllURLs(c *gin.Context) {
	urls, err := service.ListURLs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch urls"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": urls})
}

func DeleteURL(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing code"})
		return
	}

	if err := service.DeleteURL(code); err != nil {
		status := http.StatusInternalServerError
		if err == gorm.ErrRecordNotFound {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": "cannot delete url"})
		return
	}

	c.Status(http.StatusNoContent)
}
