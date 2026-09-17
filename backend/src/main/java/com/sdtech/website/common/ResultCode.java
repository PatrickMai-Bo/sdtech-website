package com.sdtech.website.common;

/**
 * 全局错误码：code=0 表示成功，其余与 HTTP 状态码保持一致。
 */
public enum ResultCode {

    /** 成功。 */
    OK(0, "成功"),
    /** 参数校验失败。 */
    BAD_REQUEST(400, "参数错误"),
    /** 未登录或会话失效。 */
    UNAUTHORIZED(401, "未登录或登录已失效"),
    /** 禁止访问。 */
    FORBIDDEN(403, "禁止访问"),
    /** 资源不存在。 */
    NOT_FOUND(404, "资源不存在"),
    /** 操作过于频繁（限流）。 */
    TOO_MANY_REQUESTS(429, "操作过于频繁，请稍后再试"),
    /** 服务器内部错误。 */
    INTERNAL_ERROR(500, "服务器繁忙，请稍后重试");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
