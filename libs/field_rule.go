package libs

import (
	"fmt"
	"reflect"
	"strings"
)

type FieldRule struct {
}

func newFieldRule() *FieldRule {
	return &FieldRule{}
}

func (fr *FieldRule) require(fieldName string, value reflect.Value) error {
	switch value.Kind() {
	case reflect.String:
		if strings.TrimSpace(value.String()) == "" {
			return fmt.Errorf("%s is required", fieldName)
		}
	default:
		if value.IsZero() {
			return fmt.Errorf("%s is required", fieldName)
		}
	}
	return nil
}

func (fr *FieldRule) min(fieldName string, value reflect.Value, ruleValue string) error {

	return nil
}

func (fr *FieldRule) max(fieldName string, value reflect.Value, ruleValue string) error {

	return nil
}
