package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetPlans(c *gin.Context) {
	plans, err := service.GetPlans()
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInternalError,
				config.RestFulCodeInternalError,
			))
		return
	}

	plansResponse := make([]response.PlanResponse, len(plans))
	for i, plan := range plans {
		plansResponse[i] = response.PlanResponse{
			UUID:         plan.UUID.String(),
			Name:         plan.Name,
			Price:        plan.Price,
			StorageLimit: plan.StorageLimit,
			URLLimit:     plan.URLLimit,
		}
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			plansResponse,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		))
}

func ViewPlan(c *gin.Context) {
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

	usedStorage, err := service.GetUsedStorageByAccountID(account.ID)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInternalError,
				config.RestFulCodeInternalError,
			))
		return
	}

	usedURL, err := service.GetUsedURLCountByAccountID(account.ID)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInternalError,
				config.RestFulCodeInternalError,
			))
		return
	}

	plan := account.Plan
	response := response.MyPlanUsageResponse{
		Plan: response.PlanResponse{
			UUID:         plan.UUID.String(),
			Name:         plan.Name,
			Price:        plan.Price,
			StorageLimit: plan.StorageLimit,
			URLLimit:     plan.URLLimit,
		},
		TotalStorage: plan.StorageLimit,
		UsedStorage:  usedStorage,
		UsedURL:      usedURL,
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			response,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		))
}
