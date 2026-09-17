package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 细分服务新增/修改请求。 */
public class ServiceItemSaveReq {

    /** 所属业务 ID。 */
    @NotNull(message = "所属业务不能为空")
    private Long serviceId;

    /** 标题。 */
    @NotBlank(message = "标题不能为空")
    @Size(max = 128, message = "标题长度不能超过 128")
    private String title;

    /** 描述。 */
    @Size(max = 500, message = "描述长度不能超过 500")
    private String description;

    /** 图标 key。 */
    @Size(max = 64, message = "图标长度不能超过 64")
    private String icon;

    /** 排序。 */
    private Integer sortOrder;

    /** 状态：1 显示 0 隐藏。 */
    private Integer status;

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
