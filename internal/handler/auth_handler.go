package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = config.GetConfig().JWTSecret

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var req RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Required email and password"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 10)

	var plan model.Plan
	config.DB.Where("name = ?", "Free").First(&plan)

	user := model.User{
		Email:    req.Email,
		Password: string(hashed),
		PlanID:   plan.ID,
		Role:     model.RoleUser,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Email already exists"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]any{
			"email": user.Email,
			"plan":  plan.Name,
		},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Required email and password"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	var user model.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"Invalid credentials"},
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"Invalid credentials"},
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	tokenString, _ := utils.GenerateToken(
		map[string]any{
			"uid":   user.ID,
			"email": user.Email,
			"role":  user.Role,
		}, string(jwtKey), string(user.Role), int(user.ID),
	)

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]any{
			"email": user.Email,
			"role":  user.Role,
			"token": tokenString,
		},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}
