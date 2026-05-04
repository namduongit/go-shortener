package config

import (
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3Config "github.com/aws/aws-sdk-go-v2/config"
	s3Credential "github.com/aws/aws-sdk-go-v2/credentials"
	s3 "github.com/aws/aws-sdk-go-v2/service/s3"
	s3Service "github.com/aws/aws-sdk-go-v2/service/s3"
	s3Types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

var S3Client *s3Service.Client
var PresignClient *s3.PresignClient

type CompletePart struct {
	PartNumber int32
	ETag       string
}

/*
The storage key is generated based on the file type and account ID. The structure of the storage key is as follows:

{file_type}/{account_id}/{folder_id}/{file_name}

Where:
- file_type: The type of the file (e.g., image, document, compressed, code, other)
- account_id: The ID of the account that owns the file
- folder_id: (Optional) The ID of the folder that contains the file
- file_name: The name of the file

Example:
For an image file uploaded by account with ID 123, the storage key would be:
image/123/file1.jpg

If the file is uploaded to a specific folder with ID 456, the storage key would be:
image/123/456/file1.jpg

This structure allows for easy organization and retrieval of files based on their type and ownership.
*/

func InitS3Client(ctx context.Context) {
	config, _ := s3Config.LoadDefaultConfig(ctx,
		s3Config.WithRegion("us-east-1"),
		s3Config.WithCredentialsProvider(
			s3Credential.NewStaticCredentialsProvider(
				cfg.MinIOAccessKey,
				cfg.MinIOSecretKey,
				"",
			),
		),
		s3Config.WithBaseEndpoint(cfg.MinIOEndpoint),
	)

	s3Client := s3Service.NewFromConfig(config, func(o *s3Service.Options) {
		// Set the S3 service to use path-style addressing instead of virtual-hosted-style addressing
		o.UsePathStyle = true
	})

	presignClient := s3.NewPresignClient(s3Client)

	log.Println("Connect to S3 cloud success")

	S3Client = s3Client
	PresignClient = presignClient
}

func CreateMultipart(ctx context.Context, objectKey string, contentType string) (string, error) {
	out, err := S3Client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket:      aws.String(cfg.MinIOTmpBucketName),
		Key:         aws.String(objectKey),
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return "", err
	}
	return aws.ToString(out.UploadId), nil
}

func CompleteMultipart(ctx context.Context, objectKeyTmp string, objectKeyFinal string, uploadID string, parts []CompletePart) error {
	var completedParts []s3Types.CompletedPart
	for _, part := range parts {
		completedParts = append(completedParts, s3Types.CompletedPart{
			ETag:       aws.String(part.ETag),
			PartNumber: &part.PartNumber,
		})
	}

	// Complete multipart upload in tmp bucket
	_, err := S3Client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket:   aws.String(cfg.MinIOTmpBucketName),
		Key:      aws.String(objectKeyTmp),
		UploadId: aws.String(uploadID),
		MultipartUpload: &s3Types.CompletedMultipartUpload{
			Parts: completedParts,
		},
	})
	if err != nil {
		return err
	}

	// Copy object from tmp bucket to final bucket
	_, err = S3Client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(cfg.MiniOFinalBucketName),
		Key:        aws.String(objectKeyFinal),
		CopySource: aws.String(cfg.MinIOTmpBucketName + "/" + objectKeyTmp),
	})
	if err != nil {
		return err
	}

	// Delete object in tmp bucket
	_, err = S3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(cfg.MinIOTmpBucketName),
		Key:    aws.String(objectKeyTmp),
	})
	if err != nil {
		return err
	}

	return nil
}

func CopyObject(ctx context.Context, srcBucket, srcKey, dstBucket, dstKey string) error {
	_, err := S3Client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(dstBucket),
		Key:        aws.String(dstKey),
		CopySource: aws.String(srcBucket + "/" + srcKey),
	})
	return err
}

func GetFinalBucketName() string {
	return cfg.MiniOFinalBucketName
}

func DeleteObject(ctx context.Context, bucket, key string) error {
	_, err := S3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	return err
}

func AbortMultipart(ctx context.Context, objectKey string, uploadID string) error {
	_, err := S3Client.AbortMultipartUpload(ctx, &s3.AbortMultipartUploadInput{
		Bucket:   aws.String(cfg.MinIOTmpBucketName),
		Key:      aws.String(objectKey),
		UploadId: aws.String(uploadID),
	})
	return err
}

func PresignSingleUpload(ctx context.Context, objectKey string) (string, error) {
	out, err := PresignClient.PresignPutObject(
		ctx,
		&s3.PutObjectInput{
			Bucket: aws.String(cfg.MiniOFinalBucketName),
			Key:    aws.String(objectKey),
		},
		s3.WithPresignExpires(15*time.Minute),
	)

	if err != nil {
		return "", err
	}

	return out.URL, nil
}

func PresignMultipartUpload(ctx context.Context, objectKey string, uploadID string, partNumber int32) (string, error) {
	out, err := PresignClient.PresignUploadPart(
		ctx,
		&s3.UploadPartInput{
			Bucket:     aws.String(cfg.MinIOTmpBucketName),
			Key:        aws.String(objectKey),
			UploadId:   aws.String(uploadID),
			PartNumber: &partNumber,
		},
		s3.WithPresignExpires(15*time.Minute),
	)

	if err != nil {
		return "", err
	}

	return out.URL, nil
}
