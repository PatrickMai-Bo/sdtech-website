package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 业务新增/修改请求。 */
public class ServiceSaveReq {

    /** 业务标识，唯一。 */
    @NotBlank(message = "标识不能为空")
    @Size(max = 64, message = "标识长度不能超过 64")
    private String slug;

    /** 业务名称。 */
    @NotBlank(message = "名称不能为空")
    @Size(max = 64, message = "名称长度不能超过 64")
    private String name;

    /** Banner 副标题。 */
    @Size(max = 255, message = "副标题长度不能超过 255")
    private String subtitle;

    /** 介绍段落。 */
    @Size(max = 500, message = "介绍长度不能超过 500")
    private String summary;

    /** 图标 key。 */
    @Size(max = 64, message = "图标长度不能超过 64")
    private String icon;

    /** 封面图 URL。 */
    @Size(max = 512, message = "封面地址长度不能超过 512")
    private String coverImage;

    /** 跳转地址。 */
    @Size(max = 255, message = "跳转地址长度不能超过 255")
    private String targetUrl;

    /** 页面标识：web/design/video/office。 */
    @Size(max = 32, message = "页面标识长度不能超过 32")
    private String pageKey;

    /** 排序。 */
    private Integer sortOrder;

    /** 状态：1 显示 0 隐藏。 */
    private Integer status;

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public String getPageKey() {
        return pageKey;
    }

    public void setPageKey(String pageKey) {
        this.pageKey = pageKey;
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
