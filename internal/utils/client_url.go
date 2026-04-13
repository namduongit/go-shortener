package utils

import "url-shortener/internal/config"

var server = config.GetConfig().ServerHost

func PublicImageURL(uuid string) string {
	return server + "/api/public/images/" + uuid
}

func GetPublicShortURL(code string) string {
	return server + "/" + code
}
