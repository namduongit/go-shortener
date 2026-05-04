package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

type UpdateProfileRequest struct {
	Username    *string `json:"username"`
	AvatarURL   *string `json:"avatar_url"`
	FullName    *string `json:"full_name"`
	CompanyName *string `json:"company_name"`
	Address     *string `json:"address"`
	Phone       *string `json:"phone"`
}

// GetProfile returns the authenticated user's profile.
// Route: GET /api/guard/profile
func GetProfile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	profile, err := service.GetProfileByAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"Profile not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	res := response.ProfileResponse{
		UUID:        account.UUID.String(),
		AvatarURL:   profile.AvatarURL,
		FullName:    profile.FullName,
		CompanyName: profile.CompanyName,
		Address:     profile.Address,
		Phone:       profile.Phone,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		res,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

// UpdateProfile updates mutable profile fields for the authenticated user.
// Route: PUT /api/guard/profile
func UpdateProfile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Invalid request body",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	profile, err := service.GetProfileByAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"Profile not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	hasUpdate := false

	if req.AvatarURL != nil {
		profile.AvatarURL = *req.AvatarURL
		hasUpdate = true
	}
	if req.FullName != nil {
		profile.FullName = *req.FullName
		hasUpdate = true
	}
	if req.CompanyName != nil {
		profile.CompanyName = *req.CompanyName
		hasUpdate = true
	}
	if req.Address != nil {
		profile.Address = *req.Address
		hasUpdate = true
	}
	if req.Phone != nil {
		profile.Phone = *req.Phone
		hasUpdate = true
	}

	if !hasUpdate {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"No profile fields to update",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if err := service.UpdateProfile(profile); err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	res := response.ProfileResponse{
		UUID:        account.UUID.String(),
		AvatarURL:   profile.AvatarURL,
		FullName:    profile.FullName,
		CompanyName: profile.CompanyName,
		Address:     profile.Address,
		Phone:       profile.Phone,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		res,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}
