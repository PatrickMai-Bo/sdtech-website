package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 店铺链接新增/修改请求。 */
public class ShopLinkSaveReq {

    /** 平台：wechat/xianyu/taobao/pdd/other。 */
    @NotBlank(message = "平台不能为空")
    @Size(max = 32, message = "平台长度不能超过 32")
    private String platform;

    /** 展示标题。 */
    @NotBlank(message = "标题不能为空")
    @Size(max = 64, message = "标题长度不能超过 64")
    private String title;

    /** 链接地址。 */
    @Size(max = 512, message = "链接长度不能超过 512")
    private String linkUrl;

    /** 图标 key。 */
    @Size(max = 64, message = "图标长度不能超过 64")
    private String icon;

    /** 二维码图片 URL。 */
    @Size(max = 512, message = "二维码地址长度不能超过 512")
    private String qrcodeImage;

    /** 展示位置，逗号分隔：home,footer,contact,cta。 */
    @Size(max = 128, message = "展示位置长度不能超过 128")
    private String showZone;

    /** 排序。 */
    private Integer sortOrder;

    /** 状态：1 显示 0 隐藏。 */
    private Integer status;

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
