package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.common.SessionContext;
import com.sdtech.website.dto.vo.AdminProfileVO;
import com.sdtech.website.entity.AdminUser;
import com.sdtech.website.entity.ContactMessage;
import com.sdtech.website.mapper.AdminUserMapper;
import com.sdtech.website.mapper.ContactMessageMapper;
import com.sdtech.website.service.AuthService;
import com.sdtech.website.util.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 鉴权服务实现：登录限流（同 IP + 用户名 10 分钟 5 次）、Session 写入、改密。
 */
@Service
public class AuthServiceImpl implements AuthService {

    /** 登录限流键前缀。 */
    private static final String LOGIN_LIMIT_PREFIX = "login:";

    /** 登录窗口内最大失败次数。 */
    private static final int LOGIN_MAX_ATTEMPTS = 5;

    /** 登录限流窗口（10 分钟）。 */
    private static final long LOGIN_WINDOW_MS = 10 * 60 * 1000L;

    /** 新密码最短长度。 */
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final AdminUserMapper adminUserMapper;

    private final ContactMessageMapper contactMessageMapper;

    private final BCryptPasswordEncoder passwordEncoder;

    private final RateLimiter rateLimiter;

    private final SessionContext sessionContext;

    public AuthServiceImpl(AdminUserMapper adminUserMapper,
                           ContactMessageMapper contactMessageMapper,
                           BCryptPasswordEncoder passwordEncoder,
                           RateLimiter rateLimiter,
                           SessionContext sessionContext) {
        this.adminUserMapper = adminUserMapper;
        this.contactMessageMapper = contactMessageMapper;
        this.passwordEncoder = passwordEncoder;
        this.rateLimiter = rateLimiter;
        this.sessionContext = sessionContext;
    }

    @Override
    public AdminProfileVO login(String username, String password, String ip, HttpServletRequest request) {
        if (!StringUtils.hasText(username)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "账号不能为空");
        }
        String limitKey = LOGIN_LIMIT_PREFIX + ip + ":" + username.trim();
        if (!rateLimiter.check(limitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
            throw new BusinessException(ResultCode.TOO_MANY_REQUESTS);
        }
        AdminUser admin = adminUserMapper.selectOne(new LambdaQueryWrapper<AdminUser>()
                .eq(AdminUser::getUsername, username.trim()));
        if (admin == null
                || admin.getStatus() == null || admin.getStatus() != 1
                || admin.getPasswordHash() == null
                || !passwordEncoder.matches(password == null ? "" : password, admin.getPasswordHash())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "账号或密码错误");
        }
        // 登录成功清零失败计数
        rateLimiter.clear(limitKey);
        admin.setLastLoginTime(LocalDateTime.now());
        adminUserMapper.updateById(admin);
        sessionContext.writeLogin(request, admin.getId(), admin.getUsername(), admin.getRealName());
        return toProfile(admin);
    }

    @Override
    public void logout(HttpServletRequest request) {
        sessionContext.invalidate(request);
    }

    @Override
    public AdminProfileVO profile() {
        return toProfile(requireCurrentAdmin());
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        AdminUser admin = requireCurrentAdmin();
        if (!StringUtils.hasText(oldPassword)
                || !passwordEncoder.matches(oldPassword, admin.getPasswordHash())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "原密码不正确");
        }
        if (!StringUtils.hasText(newPassword) || newPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "新密码至少 " + MIN_PASSWORD_LENGTH + " 位");
        }
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserMapper.updateById(admin);
    }

    @Override
    public AdminUser requireCurrentAdmin() {
        Long adminId = sessionContext.currentAdminId();
        if (adminId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        AdminUser admin = adminUserMapper.selectById(adminId);
        if (admin == null || admin.getStatus() == null || admin.getStatus() != 1) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return admin;
    }

    /** 实体转 VO，并附带未读留言数。 */
    private AdminProfileVO toProfile(AdminUser admin) {
        AdminProfileVO vo = new AdminProfileVO();
        vo.setId(admin.getId());
        vo.setUsername(admin.getUsername());
        vo.setRealName(admin.getRealName());
        vo.setLastLoginTime(admin.getLastLoginTime());
        vo.setUnreadCount(contactMessageMapper.selectCount(new LambdaQueryWrapper<ContactMessage>()
                .eq(ContactMessage::getIsRead, 0)));
        return vo;
    }
}
