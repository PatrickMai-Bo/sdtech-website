package com.sdtech.website.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestValueException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

/**
 * 全局异常处理：把所有异常统一转成 {code, message, data}。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 业务异常：原样透出错误码与文案。 */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }

    /** @Valid 请求体校验失败：取第一个字段错误，转 400。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
        String message = ResultCode.BAD_REQUEST.getMessage();
        if (!fieldErrors.isEmpty()) {
            FieldError first = fieldErrors.get(0);
            message = first.getField() + " " + first.getDefaultMessage();
        }
        return Result.fail(ResultCode.BAD_REQUEST.getCode(), message);
    }

    /** 缺少必填参数。 */
    @ExceptionHandler(MissingRequestValueException.class)
    public Result<Void> handleMissingValue(MissingRequestValueException e) {
        // Spring 6 的 MissingRequestValueException 未提供参数名 getter，这里用异常自带文案兜底
        String detail = e.getMessage();
        String message = (detail == null || detail.isEmpty()) ? "缺少必填参数" : "缺少必填参数：" + detail;
        return Result.fail(ResultCode.BAD_REQUEST.getCode(), message);
    }

    /** 路径参数类型不匹配。 */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public Result<Void> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return Result.fail(ResultCode.BAD_REQUEST.getCode(), "参数类型错误：" + e.getName());
    }

    /** 请求体不是合法 JSON。 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<Void> handleNotReadable(HttpMessageNotReadableException e) {
        return Result.fail(ResultCode.BAD_REQUEST.getCode(), "请求体格式错误");
    }

    /** 上传文件超过 5MB。 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<Void> handleMaxUpload(MaxUploadSizeExceededException e) {
        return Result.fail(ResultCode.BAD_REQUEST.getCode(), "文件大小超出限制，最大 5MB");
    }

    /** 静态资源或路径不存在，返回 404 JSON。 */
    @ExceptionHandler(NoResourceFoundException.class)
    public Result<Void> handleNoResource(NoResourceFoundException e) {
        return Result.fail(ResultCode.NOT_FOUND);
    }

    /** 兜底：未知异常记录日志，返回 500。 */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleUnknown(Exception e) {
        log.error("[sdtech] 未处理异常", e);
        return Result.fail(ResultCode.INTERNAL_ERROR);
    }
}
