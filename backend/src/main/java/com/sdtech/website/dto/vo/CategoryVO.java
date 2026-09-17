package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 分类 VO：{code, name}。 */
public class CategoryVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 分类编码：web/design/video/office。 */
    private String code;

    /** 分类名称。 */
    private String name;

    public CategoryVO() {
    }

    public CategoryVO(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
