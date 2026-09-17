package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;

/** 后台登录请求。 */
public class LoginReq {

    /** 登录账号。 */
    @NotBlank(message = "账号不能为空")
    private String username;

    /** 登录密码。 */
    @NotBlank(message = "密码不能为空")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
