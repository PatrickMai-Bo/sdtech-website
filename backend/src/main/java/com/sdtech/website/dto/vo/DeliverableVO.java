package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 交付物 VO。 */
public class DeliverableVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键。 */
    private Long id;

    /** 所属业务 ID。 */
    private Long serviceId;

    /** 交付物内容。 */
    private String content;

    /** 图标 key。 */
    private String icon;

    /** 排序。 */
    private Integer sortOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
