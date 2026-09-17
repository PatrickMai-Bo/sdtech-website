package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 通用 ID 返回体：{id}。 */
public class IdVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 新增记录的主键。 */
    private Long id;

    public IdVO() {
    }

    public IdVO(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
