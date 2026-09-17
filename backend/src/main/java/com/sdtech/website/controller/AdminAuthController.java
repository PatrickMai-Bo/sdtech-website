package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.ChangePasswordReq;
import com.sdtech.website.dto.req.LoginReq;
import com.sdtech.website.dto.vo.AdminProfileVO;
import com.sdtech.website.service.AuthService;
import com.sdtech.website.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台鉴权接口：登录（唯一放行）、登出、当前管理员、改密。
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AuthService authService;

    public AdminAuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 登录：成功后写入 Session（8h）。 */
    @PostMapping("/login")
    public Result<AdminProfileVO> login(@Valid @RequestBody LoginReq req, HttpServletRequest request) {
        String ip = IpUtil.getClientIp(request);
        return Result.ok(authService.login(req.getUsername(), req.getPassword(), ip, request));
    }

    /** 登出：会话失效。 */
    @PostMapping("/logout")
    public Result<Boolean> logout(HttpServletRequest request) {
        authService.logout(request);
        return Result.ok(true);
    }

    /** 当前管理员信息 + 未读留言数（后台页加载先调它，401 即跳登录）。 */
    @GetMapping("/profile")
    public Result<AdminProfileVO> profile() {
        return Result.ok(authService.profile());
    }

    /** 修改密码。 */
    @PutMapping("/password")
    public Result<Boolean> changePassword(@Valid @RequestBody ChangePasswordReq req) {
        authService.changePassword(req.getOldPassword(), req.getNewPassword());
        return Result.ok(true);
    }
}
