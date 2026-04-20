package handler

// import (
// 	"net/http"
// 	"url-shortener/internal/config"
// 	"url-shortener/internal/model"
// 	"url-shortener/internal/model/response"
// 	"url-shortener/internal/service"
// 	"url-shortener/internal/utils"

// 	"github.com/gin-gonic/gin"
// )

// func UseAPIUpImageHandler(c *gin.Context) {
// 	account := c.MustGet("account").(*model.Account)

// 	fileHeader, err := c.FormFile("file")
// 	folderUUIDInput := c.PostForm("folder")

// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
// 			config.InvalidRequestBody,
// 			config.RestFulInvalid,
// 			config.RestFulCodeInvalid,
// 		))
// 		return
// 	}

// 	isValid := service.VerifyServiceStore(account, fileHeader)

// 	if !isValid {
// 		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
// 			config.StorageLimitExceeded,
// 			config.RestFulInvalid,
// 			config.RestFulCodeInvalid,
// 		))
// 		return
// 	}

// 	file, err := service.CreateFile(
// 		c.Request.Context(),
// 		account.ID,
// 		fileHeader,
// 		folderUUIDInput,
// 	)

// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
// 			err.Error(),
// 			config.RestFulInvalid,
// 			config.RestFulCodeInvalid,
// 		))
// 		return
// 	}

// 	response := response.UploadImageResponse{
// 		UUID:        file.UUID.String(),
// 		FileName:    file.FileName,
// 		FileType:    string(file.FileType),
// 		ContentType: file.ContentType,
// 		PublicURL:   utils.PublicImageURL(file.UUID.String()),
// 	}

// 	c.JSON(http.StatusOK, config.GinResponse(
// 		response,
// 		config.RestFulSuccess,
// 		nil,
// 		config.RestFulCodeSuccess,
// 	))
// }

// func UseAPIDeleteImageHandler(c *gin.Context) {

// }
