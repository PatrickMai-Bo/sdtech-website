package com.sdtech.website.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

/**
 * 客户端 IP 解析：优先 nginx 透传的 X-Forwarded-For / X-Real-IP。
 */
public final class IpUtil {

    /** IP 字段最大长度（contact_message.ip_address 为 VARCHAR(64)）。 */
    private static final int MAX_LENGTH = 64;

    private IpUtil() {
    }

    /** 获取客户端真实 IP。 */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String first = forwarded.split(",")[0].trim();
            if (StringUtils.hasText(first)) {
                return truncate(first);
            }
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return truncate(realIp.trim());
        }
        String remote = request.getRemoteAddr();
        return truncate(remote == null ? "unknown" : remote);
    }

    /** 超长截断，避免超字段长度。 */
    private static String truncate(String ip) {
        return ip.length() <= MAX_LENGTH ? ip : ip.substring(0, MAX_LENGTH);
    }
}
