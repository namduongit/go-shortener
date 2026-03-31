const HttpCode = {
    "RestFulCodeSuccess": 200,
    "RestFulCodeInvalid": 400,
    "RestFulCodeNotFound": 404,
    "RestFulCodeForbidden": 403,
    "RestFulCodeUnauthorized": 401,
    "RestFulCodeInternalError": 500
} as const;
export type HttpCode = (typeof HttpCode)[keyof typeof HttpCode];

const HttpMessage = {
    "RestFulSuccess": "Success",
    "RestFulInvalid": "Invalid request",
    "RestFulNotFound": "Not found",
    "RestFulForbidden": "Forbidden",
    "RestFulUnauthorized": "Unauthorized",
    "RestFulInternalError": "Internal server error"
}
export type HttpMessage = (typeof HttpMessage)[keyof typeof HttpMessage];

export type HttpError = null | string[] | any;

export type RestFulResponse<T> = {
    code: HttpCode;
    message: HttpMessage;
    errs: HttpError;
    data: T;
}

export type RestResponse<T> = RestFulResponse<T>;
