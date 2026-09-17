package com.sdtech.website.util;

import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.ResultCode;

import java.util.regex.Pattern;

/**
 * 通用校验工具：XSS 指纹拦截、手机号校验、LIKE 转义、长度校验。
 */
public final class ValidatorUtil {

    /** 手机号正则。 */
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    /** XSS 指纹：script 标签。 */
    private static final Pattern XSS_SCRIPT = Pattern.compile("(?i)<\\s*script");

    /** XSS 指纹：iframe 标签。 */
    private static final Pattern XSS_IFRAME = Pattern.compile("(?i)<\\s*iframe");

    /** XSS 指纹：javascript: 协议。 */
    private static final Pattern XSS_JS_PROTOCOL = Pattern.compile("(?i)javascript\\s*:");

    /** XSS 指纹：内联事件属性（onclick= / onload= 等）。 */
    private static final Pattern XSS_EVENT = Pattern.compile("(?i)(^|[\\s\"'`])on\\w+\\s*=");

    /** 需要转义的 LIKE 通配符。 */
    private static final String[] LIKE_ESCAPE_TARGETS = {"\\", "%", "_"};

    private ValidatorUtil() {
    }

    /** 手机号是否合法。 */
    public static boolean isPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * 文本安全校验：命中 XSS 指纹直接抛 400。
     *
     * @param label 字段中文名，用于提示
     * @param value 待校验文本
     * @param maxLength 最大长度，0 表示不限制
     */
    public static void assertSafeText(String label, String value, int maxLength) {
        if (value == null) {
            return;
        }
        if (XSS_SCRIPT.matcher(value).find()
                || XSS_IFRAME.matcher(value).find()
                || XSS_JS_PROTOCOL.matcher(value).find()
                || XSS_EVENT.matcher(value).find()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, (label == null ? "内容" : label) + "包含不允许的字符");
        }
        if (maxLength > 0 && value.length() > maxLength) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    (label == null ? "内容" : label) + "长度不能超过 " + maxLength + " 个字符");
        }
    }

    /** 必填校验。 */
    public static void assertNotBlank(String label, String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, (label == null ? "参数" : label) + "不能为空");
        }
    }

    /** LIKE 关键字转义（配合 MySQL 默认转义符反斜杠）。 */
    public static String escapeLike(String keyword) {
        if (keyword == null) {
            return "";
        }
        String result = keyword.trim();
        for (String target : LIKE_ESCAPE_TARGETS) {
            result = result.replace(target, "\\" + target);
        }
        return result;
    }
}
