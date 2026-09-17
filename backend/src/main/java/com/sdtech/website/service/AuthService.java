package com.sdtech.website.service;

import com.sdtech.website.dto.vo.AdminProfileVO;
import com.sdtech.website.entity.AdminUser;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 后台鉴权服务：登录（含限流）、登出、当前管理员、修改密码。
 */
public interface AuthService {

    /**
     * 登录并写入 Session。
     *
     * @param username 账号
     * @param password 密码
     * @param ip 客户端 IP（限流维度）
     * @param request 当前请求
     * @return 管理员信息
     */
    AdminProfileVO login(String username, String password, String ip, HttpServletRequest request);

    /** 登出：会话失效。 */
    void logout(HttpServletRequest request);

    /** 当前管理员信息（含未读留言数）。 */
    AdminProfileVO profile();

    /** 修改密码：校验旧密码，新密码 ≥8 位。 */
    void changePassword(String oldPassword, String newPassword);

    /** 取当前登录管理员实体；未登录抛 401。 */
    AdminUser requireCurrentAdmin();
}
