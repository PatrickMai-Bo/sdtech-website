package com.sdtech.website.config;

import com.sdtech.website.entity.AdminUser;
import com.sdtech.website.mapper.AdminUserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 管理员播种：admin_user 表为空时，按环境变量注入的账号密码创建 BCrypt 管理员（D2）。
 * <p>
 * 种子 SQL 不插管理员，全仓库不出现明文密码；凭据仅从环境变量读取，默认值仅供本地启动兜底。
 */
@Component
public class AdminSeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedRunner.class);

    private final AdminUserMapper adminUserMapper;

    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${admin.seed.username}")
    private String seedUsername;

    @Value("${admin.seed.password}")
    private String seedPassword;

    public AdminSeedRunner(AdminUserMapper adminUserMapper, BCryptPasswordEncoder passwordEncoder) {
        this.adminUserMapper = adminUserMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedIfEmpty();
    }

    /** 空表时写入默认管理员。 */
    private void seedIfEmpty() {
        Long count = adminUserMapper.selectCount(null);
        if (count != null && count > 0) {
            log.info("[sdtech] 管理员已存在，跳过播种");
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername(seedUsername);
        admin.setPasswordHash(passwordEncoder.encode(seedPassword));
        admin.setRealName("管理员");
        admin.setStatus(1);
        admin.setLastLoginTime(LocalDateTime.now());
        adminUserMapper.insert(admin);
        // 只打印账号，绝不打印密码
        log.info("[sdtech] 已初始化管理员：{}", seedUsername);
    }
}
