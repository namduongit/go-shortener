package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/http/request"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"
	"url-shortener/internal/utils"
	"url-shortener/libs"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var cfg = config.GetConfig()

/**
* * Register method - Create new account with email and password
* TODO: Register -> Validate input -> Hash password -> Create account in database -> Send verification email
 */
func Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	if req.Password != req.PasswordConfirm {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				"Password and confirm password do not match",
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	account, err := service.RegisterAccount(req.Email, string(hashed))

	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	response := response.RegisterResponse{
		UUID:  account.UUID.String(),
		Email: account.Email,
		Plan: response.PlanDetailResponse{
			UUID:         account.Plan.UUID.String(),
			Name:         account.Plan.Name,
			StorageLimit: account.Plan.StorageLimit,
		},
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

/**
* * Login method - Authenticate user with email and password
* TODO: Login -> Validate input -> Check credentials -> Generate token -> Set token in cookie
 */
func Login(c *gin.Context) {
	var req request.LoginRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	account, err := service.LoginAccount(req.Email, req.Password)

	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	tokenString, _ := utils.GenerateToken(
		map[string]any{
			"email":     account.Email,
			"plan_name": account.Plan.Name,
			"join_date": account.CreatedAt.Unix(),
		},
		string(account.Role),
		account.UUID.String(),
		account.Version,
		string(cfg.JWTSecret),
	)

	utils.SetAccessTokenCookie(c, *tokenString)

	// Ghi log async
	go service.WriteLog(account.ID, model.LogActionLogin,
		"Đăng nhập thành công", c.ClientIP(), c.Request.UserAgent())

	response := response.LoginResponse{
		UUID:  account.UUID.String(),
		Email: account.Email,
		Plan: response.PlanDetailResponse{
			UUID:         account.Plan.UUID.String(),
			Name:         account.Plan.Name,
			StorageLimit: account.Plan.StorageLimit,
		},
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

/**
* *Auth config method - Validate state of user session
* ! This method handled in middlware
* TODO: Auth config -> Check token in cookie -> If valid, return user info and session config -> If invalid, clear cookie and return unauthorized
 */
func AuthConfig(c *gin.Context) {
	tokenStr, _ := c.Cookie("accessToken")
	authenticated := false

	account := c.MustGet("account").(*model.Account)

	claims, err := utils.VerifyToken(tokenStr, string(cfg.JWTSecret))
	if err != nil {
		utils.ClearAccessTokenCookie(c)
		c.JSON(
			http.StatusUnauthorized,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
		return
	}

	iat, _ := claims["iat"].(float64)
	exp, _ := claims["exp"].(float64)

	service.ReloadAccount(account)

	response := response.ConfigResponse{
		UUID:     account.UUID.String(),
		Email:    account.Email,
		PlanName: account.Plan.Name,
		Config: response.ConfigDetailResponse{
			IsValid:   iat < exp,
			IssueAt:   int64(iat),
			ExpiresIn: int64(exp),
		},
		Usage: response.UsageResponse{
			PlanUUID:      account.Plan.UUID.String(),
			TotalBytes:    account.Plan.StorageLimit,
			QuotaBytes:    account.Usage.QuotaBytes,
			UsedStorage:   account.Usage.UsedStorage,
			ReservedBytes: account.Usage.ReservedBytes,
		},
	}

	response.Config.IsValid = authenticated

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

/**
* * Forgot password method
* TODO: Forgot password -> Generate reset token -> Send reset email
 */
func ForgotPassword(c *gin.Context) {
	var req request.ForgotPasswordRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	// Call mail service to send reset password email
}

/**
* * Change password method
* ! This method handled in middlware
* TODO: Change password -> Update account version -> Resend new token to client
* ! Important: When update account version, all old token will be invalid
 */
func ChangePassword(c *gin.Context) {
	var req request.ChangePasswordRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	account := c.MustGet("account").(*model.Account)

	// Verify old password before allowing change
	if err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(req.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Old password is incorrect",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if req.Password != req.PasswordConfirm {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Password and confirm password do not match",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	err := service.UpdateAccountPassword(account, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	tokenString, _ := utils.GenerateToken(
		map[string]any{
			"email":     account.Email,
			"plan_name": account.Plan.Name,
			"join_date": account.CreatedAt.Unix(),
		},
		string(account.Role),
		account.UUID.String(),
		account.Version,
		string(cfg.JWTSecret),
	)

	// Clear old cookie and set new cookie with new token
	utils.ClearAccessTokenCookie(c)
	utils.SetAccessTokenCookie(c, *tokenString)

	// Ghi log async
	go service.WriteLog(account.ID, model.LogActionChangePassword,
		"Đổi mật khẩu thành công", c.ClientIP(), c.Request.UserAgent())

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			nil,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		))
}

/**
* * Logout method
* ! This method handled in middlware
* TODO: Logout -> Clear access token cookie -> Send goroutine to update account version
 */
func Logout(c *gin.Context) {
	utils.ClearAccessTokenCookie(c)

	c.JSON(http.StatusOK, config.GinResponse(
		nil,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

/*
 * Activation method
 * TODO: Check in redis -> If token valid, activate account and delete token in redis -> If token invalid, return error
 * Redirect to CLIENT_HOST/verify/success if valid, CLIENT_HOST/verify/failed if invalid
 */
func Activation(c *gin.Context) {
	email := c.Query("email")
	token := c.Query("activate-key")

	if err := service.ActivateAccount(email, token); err != nil {
		c.Redirect(http.StatusFound, cfg.ClientHost+"/verify/failed")
		return
	}

	c.Redirect(http.StatusFound, cfg.ClientHost+"/verify/success")
}

func ResendActivationEmail(c *gin.Context) {
	email := c.Query("email")
	oldActivationToken := c.Query("activate-key")

	if err := service.ResendActivationEmail(email, oldActivationToken); err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			nil,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		),
	)
}
