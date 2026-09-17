package com.sdtech.website.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 会话上下文：读写 HttpSession 中的管理员信息（D1 采用 Session 鉴权，不用 JWT）。
 */
@Component
public class SessionContext {

    /** Session 中管理员 ID 的键。 */
    public static final String KEY_ADMIN_ID = "SDTECH_ADMIN_ID";

    /** Session 中管理员账号的键。 */
    public static final String KEY_ADMIN_USERNAME = "SDTECH_ADMIN_USERNAME";

    /** Session 中管理员姓名的键。 */
    public static final String KEY_ADMIN_REAL_NAME = "SDTECH_ADMIN_REAL_NAME";

    /** 获取当前请求；非 Web 环境返回 null。 */
    public HttpServletRequest currentRequest() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            return servletAttributes.getRequest();
        }
        return null;
    }

    /** 登录成功后写入会话。 */
    public void writeLogin(HttpServletRequest request, Long adminId, String username, String realName) {
        HttpSession session = request.getSession(true);
        session.setAttribute(KEY_ADMIN_ID, adminId);
        session.setAttribute(KEY_ADMIN_USERNAME, username);
        session.setAttribute(KEY_ADMIN_REAL_NAME, realName);
    }

    /** 登出：使会话失效。 */
    public void invalidate(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /** 当前登录管理员 ID；未登录返回 null。 */
    public Long currentAdminId() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        return (Long) session.getAttribute(KEY_ADMIN_ID);
    }

    /** 是否已登录。 */
    public boolean isLoggedIn() {
        return currentAdminId() != null;
    }
}
