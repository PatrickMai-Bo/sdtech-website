package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 报价项 VO。 */
public class QuoteVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键。 */
    private Long id;

    /** 关联业务 ID。 */
    private Long serviceId;

    /** 关联业务标识（便于前端分组）。 */
    private String serviceSlug;

    /** 报价项名称。 */
    private String itemName;

    /** 价格文本。 */
    private String priceText;

    /** 计价单位。 */
    private String priceUnit;

    /** 说明。 */
    private String description;

    /** 排序。 */
    private Integer sortOrder;

    /** 状态。 */
    private Integer status;

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

    public String getServiceSlug() {
        return serviceSlug;
    }

    public void setServiceSlug(String serviceSlug) {
        this.serviceSlug = serviceSlug;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getPriceText() {
        return priceText;
    }

    public void setPriceText(String priceText) {
        this.priceText = priceText;
    }

    public String getPriceUnit() {
        return priceUnit;
    }

    public void setPriceUnit(String priceUnit) {
        this.priceUnit = priceUnit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
