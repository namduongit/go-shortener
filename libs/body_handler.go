package libs

import (
	"errors"

	"github.com/gin-gonic/gin"
)

func WithBind(c *gin.Context, object interface{}) error {
	if err := c.ShouldBind(object); err != nil {
		// Error sometimes is "json: mashalled value is not an object -> object is null"
		return err
	}

	// Call validation
	return NewValidate().Validate(object)
}

func WithJSON(c *gin.Context, object interface{}) error {
	if err := c.ShouldBindJSON(object); err != nil {
		return errors.New("Invalid request body")
	}
	// Call validation
	return NewValidate().Validate(object)
}
