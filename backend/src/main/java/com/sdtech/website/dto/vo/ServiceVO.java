package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 业务卡片 VO。 */
public class ServiceVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键。 */
    private Long id;

    /** 业务标识。 */
    private String slug;

    /** 业务名称。 */
    private String name;

    /** Banner 副标题。 */
    private String subtitle;

    /** 介绍段落。 */
    private String summary;

    /** 图标 key。 */
    private String icon;

    /** 封面图。 */
    private String coverImage;

    /** 跳转地址。 */
    private String targetUrl;

    /** 页面标识。 */
    private String pageKey;

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
