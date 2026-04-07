package handler

import (
	"net/http"

	"url-shortener/internal/config"
	"url-shortener/internal/model/response"
	"url-shortener/internal/repository"
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

func GetProfile(c *gin.Context) {
	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	profile, err := repository.GetProfileFromAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"Profile not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	res := response.ProfileResponse{
		UUID:        profile.UUID.String(),
		Username:    profile.Username,
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

func UpdateProfile(c *gin.Context) {
	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	hasUpdate := false
	profile, err := repository.GetProfileFromAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"Profile not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	if req.Username != nil {
		profile.Username = *req.Username
		hasUpdate = true
	}
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

	profile, err = repository.UpdateProfile(profile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	res := response.ProfileResponse{
		UUID:        profile.UUID.String(),
		Username:    profile.Username,
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
