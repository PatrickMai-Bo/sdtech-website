package com.sdtech.website.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 案例项目（case_project）。种子使用中性占位名，不虚构客户。
 */
@TableName("case_project")
public class CaseProject {

    /** 主键。 */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 标题。 */
    private String title;

    /** 分类：web/design/video/office。 */
    private String category;

    /** 封面图 URL。 */
    private String coverImage;

    /** 项目简介。 */
    private String summary;

    /** 技术/制作方式。 */
    private String techOrMethod;

    /** 交付成果。 */
    private String deliverResult;

    /** 是否精选：1 是 0 否。 */
    private Integer isFeatured;

    /** 排序，升序。 */
    private Integer sortOrder;

    /** 状态：1 显示 0 隐藏。 */
    private Integer status;

    /** 浏览量（预留）。 */
    private Integer viewCount;

    /** 逻辑删除标记。 */
    @TableLogic
    private Integer deleted;

    /** 创建时间。 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createTime;

    /** 更新时间。 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getTechOrMethod() {
        return techOrMethod;
    }

    public void setTechOrMethod(String techOrMethod) {
        this.techOrMethod = techOrMethod;
    }

    public String getDeliverResult() {
        return deliverResult;
    }

    public void setDeliverResult(String deliverResult) {
        this.deliverResult = deliverResult;
    }

    public Integer getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Integer isFeatured) {
        this.isFeatured = isFeatured;
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

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
