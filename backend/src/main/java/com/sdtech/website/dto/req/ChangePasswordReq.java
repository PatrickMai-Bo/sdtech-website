package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 修改管理员密码请求。 */
public class ChangePasswordReq {

    /** 原密码。 */
    @NotBlank(message = "原密码不能为空")
    private String oldPassword;

    /** 新密码，≥8 位。 */
    @NotBlank(message = "新密码不能为空")
    @Size(min = 8, max = 64, message = "新密码长度需为 8-64 位")
    private String newPassword;

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
