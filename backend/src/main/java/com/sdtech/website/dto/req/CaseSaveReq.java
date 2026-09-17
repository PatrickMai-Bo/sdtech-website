package com.sdtech.website.dto.req;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/** 案例新增/修改请求（images 为全量覆盖）。 */
public class CaseSaveReq {

    /** 标题。 */
    @NotBlank(message = "标题不能为空")
    @Size(max = 128, message = "标题长度不能超过 128")
    private String title;

    /** 分类：web/design/video/office。 */
    @NotBlank(message = "分类不能为空")
    @Size(max = 32, message = "分类长度不能超过 32")
    private String category;

    /** 封面图 URL。 */
    @Size(max = 512, message = "封面地址长度不能超过 512")
    private String coverImage;

    /** 项目简介。 */
    @Size(max = 1000, message = "简介长度不能超过 1000")
    private String summary;

    /** 技术/制作方式。 */
    @Size(max = 500, message = "技术说明长度不能超过 500")
    private String techOrMethod;

    /** 交付成果。 */
    @Size(max = 1000, message = "交付成果长度不能超过 1000")
    private String deliverResult;

    /** 是否精选：1 是 0 否。 */
    private Integer isFeatured;

    /** 排序。 */
    private Integer sortOrder;

    /** 状态：1 显示 0 隐藏。 */
    private Integer status;

    /** 案例图片（全量覆盖）。 */
    @Valid
    private List<ImageReq> images = new ArrayList<>();

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

    public List<ImageReq> getImages() {
        return images;
    }

    public void setImages(List<ImageReq> images) {
        this.images = images;
    }

    /** 案例图片条目（新增案例与追加单图共用）。 */
    public static class ImageReq {

        /** 图片地址。 */
        @NotBlank(message = "图片地址不能为空")
        @Size(max = 512, message = "图片地址长度不能超过 512")
        private String imageUrl;

        /** 替代文本。 */
        @Size(max = 255, message = "替代文本长度不能超过 255")
        private String altText;

        /** 排序。 */
        private Integer sortOrder;

        /** 是否封面：1 是 0 否。 */
        private Integer isCover;

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getAltText() {
            return altText;
        }

        public void setAltText(String altText) {
            this.altText = altText;
        }

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }

        public Integer getIsCover() {
            return isCover;
        }

        public void setIsCover(Integer isCover) {
            this.isCover = isCover;
        }
    }
}
