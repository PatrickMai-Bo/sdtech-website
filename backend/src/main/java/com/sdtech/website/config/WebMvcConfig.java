package com.sdtech.website.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置：注册后台鉴权拦截器 + 本地调试用的 /uploads 静态映射。
 * <p>
 * 同时提供全站唯一的 {@link BCryptPasswordEncoder} Bean（仅使用 spring-security-crypto，
 * 不引入 Spring Security 过滤器链）。
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /** 上传根目录（容器内 /app/uploads）。 */
    @Value("${sdtech.upload.dir}")
    private String uploadDir;

    private final AdminAuthInterceptor adminAuthInterceptor;

    public WebMvcConfig(AdminAuthInterceptor adminAuthInterceptor) {
        this.adminAuthInterceptor = adminAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor).addPathPatterns("/api/admin/**");
    }

    /**
     * 本地无 nginx 时直接映射上传目录；生产由 nginx {@code location /uploads/} 托管，
     * 该映射仅作为兜底，不影响线上行为。
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadDir.endsWith("/") ? uploadDir : uploadDir + "/";
        registry.addResourceHandler("/uploads/**").addResourceLocations("file:" + location);
    }

    /**
     * 密码编码器：管理员密码一律 BCrypt 落库，全仓库不出现明文密码。
     * 放在配置类中声明，避免由使用方自己声明 Bean 造成自引用循环依赖。
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
