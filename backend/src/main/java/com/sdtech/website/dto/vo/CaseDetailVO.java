package com.sdtech.website.dto.vo;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/** 案例详情 VO：案例 + 技术说明 + 交付成果 + 多图。 */
public class CaseDetailVO extends CaseVO {

    private static final long serialVersionUID = 1L;

    /** 技术/制作方式。 */
    private String techOrMethod;

    /** 交付成果。 */
    private String deliverResult;

    /** 图片列表。 */
    private List<CaseImageVO> images = new ArrayList<>();

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

    public List<CaseImageVO> getImages() {
        return images;
    }

    public void setImages(List<CaseImageVO> images) {
        this.images = images == null ? new ArrayList<>() : images;
    }
}
