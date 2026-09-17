package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 访客留言提交请求。 */
public class MessageReq {

    /** 姓名，≤30 字。 */
    @NotBlank(message = "姓名不能为空")
    @Size(max = 30, message = "姓名长度不能超过 30 个字符")
    private String name;

    /** 手机号，11 位。 */
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    /** 需求描述，5–500 字。 */
    @NotBlank(message = "需求描述不能为空")
    @Size(min = 5, max = 500, message = "需求描述长度需为 5-500 个字符")
    private String demand;

    /** 来源页面标识。 */
    @Size(max = 64, message = "来源标识长度不能超过 64")
    private String sourcePage;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDemand() {
        return demand;
    }

    public void setDemand(String demand) {
        this.demand = demand;
    }

    public String getSourcePage() {
        return sourcePage;
    }

    public void setSourcePage(String sourcePage) {
        this.sourcePage = sourcePage;
    }
}
