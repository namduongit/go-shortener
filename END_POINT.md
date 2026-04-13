{register}

Method: POST /auth/register
body (type) example:
{
  "email": "user@example.com",
  "password": "12345678",
  "password_confirm": "12345678"
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "email": "user@example.com",
    "plan": {
      "uuid": "8b60a7e8-7183-47f9-8d98-ebec75db1d35",
      "name": "Free",
      "storage_limit": 1073741824
    }
  }
}

{login}

Method: POST /auth/login
body (type) example:
{
  "email": "user@example.com",
  "password": "12345678"
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "email": "user@example.com",
    "plan": {
      "uuid": "8b60a7e8-7183-47f9-8d98-ebec75db1d35",
      "name": "Free",
      "storage_limit": 1073741824
    }
  }
}

{logout}

Method: POST /auth/logout
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": null
}

{public-plans}

Method: GET /api/public/plans
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": [
    {
      "uuid": "8b60a7e8-7183-47f9-8d98-ebec75db1d35",
      "name": "Free",
      "price": 0,
      "storage_limit": 1073741824,
      "url_limit": 20
    }
  ]
}

{public-image}

Method: GET /api/public/images/:code
body (type) example:
{}
response example:
Binary file stream (image/*)

{redirect-short-url}

Method: GET /:code
body (type) example:
{}
response example:
HTTP 301 redirect to original URL

{api-upload-image}

Method: POST /api/token/upload-image
body (type) example:
form-data:
- file (file)
- folder (string, optional)
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d",
    "file_name": "avatar.png",
    "file_type": "image",
    "content_type": "image/png",
    "public_url": "https://server/api/public/images/1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d"
  }
}

{api-delete-image}

Method: DELETE /api/token/delete-image
body (type) example:
{}
response example:
Not implemented yet (handler exists, no response body currently)

{share-download-file}

Method: GET /api/share/file/:uuid/download
body (type) example:
{}
response example:
Binary file stream (attachment)

{guard-config}

Method: GET /api/guard/config
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "email": "user@example.com",
    "config": {
      "is_valid": true,
      "issue_at": 1712912000,
      "expires_in": 1713516800
    }
  }
}

{guard-profile-get}

Method: GET /api/guard/profile
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "0b8aa78b-5d12-4f0a-a4b5-b03f5a8c8c3a",
    "username": "john",
    "avatar_url": "",
    "full_name": "John Doe",
    "company_name": "GMS",
    "address": "HCM",
    "phone": "0123456789"
  }
}

{guard-profile-update}

Method: PUT /api/guard/profile
body (type) example:
{
  "username": "john",
  "avatar_url": "",
  "full_name": "John Doe",
  "company_name": "GMS",
  "address": "HCM",
  "phone": "0123456789"
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "0b8aa78b-5d12-4f0a-a4b5-b03f5a8c8c3a",
    "username": "john"
  }
}

{guard-plan-usage}

Method: GET /api/guard/plans
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "plan": {
      "uuid": "8b60a7e8-7183-47f9-8d98-ebec75db1d35",
      "name": "Free",
      "price": 0,
      "storage_limit": 1073741824,
      "url_limit": 20
    },
    "total_storage": 1073741824,
    "used_storage": 2048,
    "used_url": 1
  }
}

{guard-token-list}

Method: GET /api/guard/tokens
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "owner_uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "tokens": [
      {
        "uuid": "0ea69303-339f-4ddf-bd7a-e2ef577ba8b1",
        "name": "default",
        "token": "gpk_xxx",
        "public_token": "gpk_xxx",
        "expires_at": null,
        "created_at": "2026-04-12T10:00:00Z"
      }
    ]
  }
}

{guard-token-create}

Method: POST /api/guard/tokens
body (type) example:
{
  "name": "automation",
  "time": 30
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "0ea69303-339f-4ddf-bd7a-e2ef577ba8b1",
    "name": "automation",
    "token": "gpk_xxx",
    "public_token": "gpk_xxx",
    "private_token": "gsk_xxx"
  }
}

{guard-token-delete}

Method: DELETE /api/guard/tokens/:uuid
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": null
}

{guard-folder-list}

Method: GET /api/guard/folders
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "owner_uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "folders": [
      {
        "uuid": "0adcc14e-c8a2-4592-ac87-fd2a6314ef5e",
        "name": "docs",
        "total_files": 2,
        "total_size": 1000,
        "created_at": "2026-04-12T10:00:00Z"
      }
    ]
  }
}

{guard-folder-create}

Method: POST /api/guard/folders
body (type) example:
{
  "name": "docs"
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "0adcc14e-c8a2-4592-ac87-fd2a6314ef5e",
    "name": "docs"
  }
}

{guard-folder-delete}

Method: DELETE /api/guard/folders/:uuid
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": null
}

{guard-folder-update}

Method: PUT /api/guard/folders/:uuid
body (type) example:
{
  "name": "new-folder-name"
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "0adcc14e-c8a2-4592-ac87-fd2a6314ef5e",
    "name": "new-folder-name"
  }
}

{guard-file-list}

Method: GET /api/guard/files
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "owner_uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "files": [
      {
        "uuid": "1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d",
        "file_name": "avatar.png",
        "file_type": "image",
        "content_type": "image/png",
        "size": 1024,
        "is_shared": false
      }
    ]
  }
}

{guard-file-upload}

Method: POST /api/guard/files
body (type) example:
form-data:
- file (file)
- folder (string, optional)
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d",
    "file_name": "avatar.png",
    "file_type": "image",
    "content_type": "image/png",
    "size": 1024,
    "is_shared": false
  }
}

{guard-file-delete}

Method: DELETE /api/guard/files/:uuid
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": null
}

{guard-file-share}

Method: POST /api/guard/files/:uuid/share
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d",
    "is_shared": true,
    "download_url": "https://server/file/1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d/download"
  }
}

{guard-file-unshare}

Method: POST /api/guard/files/:uuid/unshare
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d",
    "is_shared": false,
    "download_url": "https://server/file/1d4fb4b4-0dbb-4f2f-bcf2-04e2618c7e7d/download"
  }
}

{guard-file-download}

Method: GET /api/guard/file/:uuid/download
body (type) example:
{}
response example:
Binary file stream (attachment)

{guard-url-list}

Method: GET /api/guard/urls
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "owner_uuid": "f4e2d2c0-9e7b-4d7f-9f2f-cfbdac16fa43",
    "urls": [
      {
        "uuid": "6741b36a-4254-43c4-a61b-c3cd120a5332",
        "code": "abc123",
        "original_url": "https://example.com",
        "description": "demo",
        "created_at": "2026-04-12T10:00:00Z"
      }
    ]
  }
}

{guard-url-create}

Method: POST /api/guard/urls
body (type) example:
{
  "url": "https://example.com",
  "description": "demo"
}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": {
    "uuid": "6741b36a-4254-43c4-a61b-c3cd120a5332",
    "code": "abc123",
    "original_url": "https://example.com",
    "description": "demo"
  }
}

{guard-url-delete}

Method: DELETE /api/guard/urls/:uuid
body (type) example:
{}
response example:
{
  "code": 200,
  "message": "Success",
  "errs": null,
  "data": null
}
