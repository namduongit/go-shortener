package handler

import (
	"net/http"
	"strconv"
	"url-shortener/internal/config"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetActivityLogs(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	limit := 50
	if l := c.Query("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil && v > 0 && v <= 200 {
			limit = v
		}
	}

	logs, err := service.GetActivityLogs(account.ID, limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(), config.RestFulInvalid, config.RestFulCodeInvalid,
		))
		return
	}

	logResponses := make([]response.ActivityLogResponse, len(logs))
	for i, l := range logs {
		logResponses[i] = response.ActivityLogResponse{
			UUID:      l.UUID.String(),
			Action:    string(l.Action),
			Detail:    l.Detail,
			IPAddress: l.IPAddress,
			UserAgent: l.UserAgent,
			CreatedAt: l.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, config.GinResponse(logResponses, config.RestFulSuccess, nil, config.RestFulCodeSuccess))
}
