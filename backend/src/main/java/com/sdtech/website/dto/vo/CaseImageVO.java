package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 案例图片 VO。 */
public class CaseImageVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键。 */
    private Long id;

    /** 所属案例 ID。 */
    private Long caseId;

    /** 图片地址。 */
    private String imageUrl;

    /** 替代文本。 */
    private String altText;

    /** 排序。 */
    private Integer sortOrder;

    /** 是否封面。 */
    private Integer isCover;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

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
