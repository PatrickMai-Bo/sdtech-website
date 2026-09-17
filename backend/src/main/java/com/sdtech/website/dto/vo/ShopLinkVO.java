package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 店铺链接 VO。 */
public class ShopLinkVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键。 */
    private Long id;

    /** 平台。 */
    private String platform;

    /** 标题。 */
    private String title;

    /** 链接地址。 */
    private String linkUrl;

    /** 图标 key。 */
    private String icon;

    /** 二维码。 */
    private String qrcodeImage;

    /** 展示位置。 */
    private String showZone;

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

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getQrcodeImage() {
        return qrcodeImage;
    }

    public void setQrcodeImage(String qrcodeImage) {
        this.qrcodeImage = qrcodeImage;
    }

    public String getShowZone() {
        return showZone;
    }

    public void setShowZone(String showZone) {
        this.showZone = showZone;
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
