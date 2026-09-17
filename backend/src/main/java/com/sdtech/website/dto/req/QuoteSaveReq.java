package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 报价项新增/修改请求。 */
public class QuoteSaveReq {

    /** 关联业务 ID，可为空。 */
    private Long serviceId;

    /** 报价项名称。 */
    @NotBlank(message = "名称不能为空")
    @Size(max = 128, message = "名称长度不能超过 128")
    private String itemName;

    /** 价格文本，如 2000-6000 / 面议。 */
    @Size(max = 64, message = "价格长度不能超过 64")
    private String priceText;

    /** 计价单位。 */
    @Size(max = 32, message = "单位长度不能超过 32")
    private String priceUnit;

    /** 说明。 */
    @Size(max = 500, message = "说明长度不能超过 500")
    private String description;

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
