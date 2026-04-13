package config

/*
- Errs: any is string | []string | anything
- Data: any is object | array | anything
*/
type RestFulResponse struct {
	Code    RestFulCode    `json:"code"`
	Message RestFulMessage `json:"message"`
	Errs    any            `json:"errs"`
	Data    interface{}    `json:"data"`
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

func GinResponse(data interface{}, message RestFulMessage, errs any, code RestFulCode) RestFulResponse {
	return RestFulResponse{
		Code:    code,
		Message: message,
		Errs:    errs,
		Data:    data,
	}
}

func GinErrorResponse(errs any, message RestFulMessage, code RestFulCode) RestFulResponse {
	return RestFulResponse{
		Code:    code,
		Message: message,
		Errs:    &errs,
	}
}

type ErrorMessageExmaple string

const (
	InvalidRequestBody ErrorMessageExmaple = "Invalid request body"

	RequireAuthentication ErrorMessageExmaple = "Authentication required"
	Unauthorize           ErrorMessageExmaple = "Unauthorize"
	InvalidToken          ErrorMessageExmaple = "Invalid token"
	MissingAPIKey         ErrorMessageExmaple = "Missing API key"
	AccountNotFound       ErrorMessageExmaple = "Account not found"

	// Auth related
	PasswordCompareFailed ErrorMessageExmaple = "Password and confirm password do not match"

	FileNotExists   ErrorMessageExmaple = "File not exists"
	URLNotExists    ErrorMessageExmaple = "URL not exists"
	FolderNotExists ErrorMessageExmaple = "Folder not exists"

	FileNotImage  ErrorMessageExmaple = "File is not an image"
	FileNotShared ErrorMessageExmaple = "File is not shared"

	StorageLimitExceeded ErrorMessageExmaple = "Storage limit exceeded"
	URLLimitExceeded     ErrorMessageExmaple = "URL limit exceeded"

	FolderNameExists ErrorMessageExmaple = "Folder name already exists"

	TokenIsOutdated ErrorMessageExmaple = "Token is outdated, please login again"
)
