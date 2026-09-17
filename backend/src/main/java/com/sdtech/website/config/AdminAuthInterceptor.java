package com.sdtech.website.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sdtech.website.common.Result;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.common.SessionContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * 后台鉴权拦截器：拦截 /api/admin/**，仅放行 POST /api/admin/auth/login。
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthInterceptor.class);

    /** 唯一放行的登录路径。 */
    private static final String LOGIN_PATH = "/api/admin/auth/login";

    private final ObjectMapper objectMapper;

    public AdminAuthInterceptor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        if (isLoginPath(request)) {
            return true;
        }
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(SessionContext.KEY_ADMIN_ID) == null) {
            log.debug("[sdtech] 未登录访问 {}", request.getRequestURI());
            writeUnauthorized(response);
            return false;
        }
        return true;
    }

    /** 仅 POST /api/admin/auth/login 放行。 */
    private boolean isLoginPath(HttpServletRequest request) {
        return LOGIN_PATH.equals(request.getRequestURI())
                && "POST".equalsIgnoreCase(request.getMethod());
    }

    /** 输出 401 JSON，供前端 admin-api.js 捕获后跳转登录页。 */
    private void writeUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Result.fail(ResultCode.UNAUTHORIZED)));
        response.getWriter().flush();
    }
}
