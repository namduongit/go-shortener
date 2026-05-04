package service

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

// WriteLog ghi log hoạt động bất đồng bộ (chạy goroutine từ handler)
func WriteLog(accountID uint, action model.LogAction, detail, ip, ua string) {
	config.PostgresClient.Create(&model.ActivityLog{
		AccountID: accountID,
		Action:    action,
		Detail:    detail,
		IPAddress: ip,
		UserAgent: ua,
	})
}

// GetActivityLogs trả về danh sách log của account, mới nhất trước
func GetActivityLogs(accountID uint, limit int) ([]model.ActivityLog, error) {
	var logs []model.ActivityLog
	err := config.PostgresClient.
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}
