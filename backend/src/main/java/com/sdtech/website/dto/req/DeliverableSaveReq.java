package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 交付物新增/修改请求。 */
public class DeliverableSaveReq {

    /** 所属业务 ID。 */
    @NotNull(message = "所属业务不能为空")
    private Long serviceId;

    /** 交付物内容。 */
    @NotBlank(message = "内容不能为空")
    @Size(max = 255, message = "内容长度不能超过 255")
    private String content;

    /** 图标 key，默认 check。 */
    @Size(max = 64, message = "图标长度不能超过 64")
    private String icon;

    /** 排序。 */
    private Integer sortOrder;

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
