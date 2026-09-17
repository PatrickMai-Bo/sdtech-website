package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 合作流程步骤 VO：由 site_content 的 group=process 解析而来。 */
public class ProcessStepVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 序号。 */
    private Integer seq;

    /** 标题。 */
    private String title;

    /** 说明。 */
    private String desc;

    public ProcessStepVO() {
    }

    public ProcessStepVO(Integer seq, String title, String desc) {
        this.seq = seq;
        this.title = title;
        this.desc = desc;
    }

    public Integer getSeq() {
        return seq;
    }

    public void setSeq(Integer seq) {
        this.seq = seq;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
