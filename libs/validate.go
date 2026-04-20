package libs

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
)

type Validate struct {
	tagName string
}

func NewValidate() *Validate {
	return &Validate{tagName: "validate"}
}

func (v *Validate) Validate(s interface{}) error {
	val := reflect.ValueOf(s)

	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}

	if val.Kind() != reflect.Struct {
		return errors.New("Not a struct")
	}

	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		fieldValue := val.Field(i)

		tag := field.Tag.Get(v.tagName)
		if tag == "" || tag == "-" {
			continue
		}
		fmt.Println("TAG:", tag)

		rules := strings.Split(tag, ";")

		for _, rule := range rules {
			rule = strings.TrimSpace(rule)
			if rule == "" {
				continue
			}

			if err := v.ValidateRule(field.Name, fieldValue, rule); err != nil {
				return err
			}
		}
	}

	return nil
}

func (v *Validate) ValidateRule(fieldName string, value reflect.Value, rule string) error {
	helper := newFieldRule()

	parts := strings.SplitN(rule, ":", 2)

	ruleName := parts[0]
	var ruleValue string

	if len(parts) > 1 {
		ruleValue = parts[1]
	}

	switch ruleName {
	case "required":
		return helper.require(fieldName, value)
	case "min":
		return helper.min(fieldName, value, ruleValue)
	case "max":
		return helper.max(fieldName, value, ruleValue)

	default:
		return errors.New("Invalid validation rule")
	}
}
