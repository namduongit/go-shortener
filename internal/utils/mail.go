package utils

import (
	"os"
	"strings"

	"github.com/go-gomail/gomail"
	"golang.org/x/crypto/bcrypt"
)

/**
* * Generate activation token for verification email after registration
* ? @param email string
* ? @return string, error
* * Flow: hash(email + secretKey) with bcrypt and return the token
 */
func GenerateActivationToken(email string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(email+cfg.MailSecret), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

/**
* * Compare activation token with email
* ? @param token string
* ? @param email string
* ? @return bool
* * Flow: Compare token with hash of email + secretKey, if match return true, else return false
 */
func CompareActivationToken(token string, email string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(token), []byte(email+cfg.MailSecret))
	return err == nil
}

/**
* * Send activation email to user after registration
* ? @param to: email address of user
* ? @param token: activation token
 * * Flow: Create email message with activation link and send it to the user
*/
func SendActivationEmail(to string, token string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", cfg.MailUsername)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Kích hoạt tài khoản")

	content, err := loadTemplate("activation_email.html")
	if err != nil {
		return err
	}

	// Update args in template by replace the string
	activationRef := cfg.ServerHost + "/auth/activation" + "?email=" + to + "&activate-key=" + token
	content = strings.ReplaceAll(content, "{{.ActivationLink}}", activationRef)

	m.SetBody("text/html", content)

	d := gomail.NewDialer(cfg.MailHost, cfg.MailPort, cfg.MailUsername, cfg.MailPassword)
	return d.DialAndSend(m)
}

func loadTemplate(templateName string) (string, error) {
	pwd, _ := os.Getwd()
	path := pwd + "/resources/" + templateName

	content, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
