package com.sdtech.website.common;

/**
 * 统一业务异常：携带与 HTTP 语义一致的错误码（400/401/403/404/429/500）。
 */
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** 错误码，见 {@link ResultCode}。 */
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }

    public int getCode() {
        return code;
    }
}
