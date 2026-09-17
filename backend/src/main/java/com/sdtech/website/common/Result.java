package com.sdtech.website.common;

import java.io.Serializable;

/**
 * 统一返回体：{code, message, data}。
 *
 * @param <T> data 的类型
 */
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 0 成功；400/401/403/404/429/500 见 {@link ResultCode}。 */
    private int code;

    /** 提示信息。 */
    private String message;

    /** 业务数据。 */
    private T data;

    public Result() {
    }

    public Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /** 成功且无数据。 */
    public static <T> Result<T> ok() {
        return new Result<>(ResultCode.OK.getCode(), ResultCode.OK.getMessage(), null);
    }

    /** 成功并返回数据。 */
    public static <T> Result<T> ok(T data) {
        return new Result<>(ResultCode.OK.getCode(), ResultCode.OK.getMessage(), data);
    }

    /** 失败（使用枚举默认文案）。 */
    public static <T> Result<T> fail(ResultCode resultCode) {
        return new Result<>(resultCode.getCode(), resultCode.getMessage(), null);
    }

    /** 失败（自定义文案）。 */
    public static <T> Result<T> fail(ResultCode resultCode, String message) {
        return new Result<>(resultCode.getCode(), message, null);
    }

    /** 失败（自定义码与文案）。 */
    public static <T> Result<T> fail(int code, String message) {
        return new Result<>(code, message, null);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
