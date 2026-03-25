package config

type RestFulResponse struct {
	Code    RestFulCode    `json:"code"`
	Message RestFulMessage `json:"message"`
	Errs    *[]string      `json:"errs,omitempty"`
	Data    interface{}    `json:"data,omitempty"`
}

type RestFulCode int

const (
	RestFulCodeSuccess       RestFulCode = 200
	RestFulCodeInvalid       RestFulCode = 400
	RestFulCodeNotFound      RestFulCode = 404
	RestFulCodeForbidden     RestFulCode = 403
	RestFulCodeUnauthorized  RestFulCode = 401
	RestFulCodeInternalError RestFulCode = 500
)

type RestFulMessage string

const (
	RestFulSuccess       RestFulMessage = "Success"
	RestFulInvalid       RestFulMessage = "Invalid request"
	RestFulNotFound      RestFulMessage = "Not found"
	RestFulForbidden     RestFulMessage = "Forbidden"
	RestFulUnauthorized  RestFulMessage = "Unauthorized"
	RestFulInternalError RestFulMessage = "Internal server error"
)

func GinResponse(data interface{}, message RestFulMessage, errs *[]string, code RestFulCode) RestFulResponse {
	return RestFulResponse{
		Code:    code,
		Message: message,
		Errs:    errs,
		Data:    data,
	}
}

func GinErrorResponse(errs []string, message RestFulMessage, code RestFulCode) RestFulResponse {
	return RestFulResponse{
		Code:    code,
		Message: message,
		Errs:    &errs,
	}
}
