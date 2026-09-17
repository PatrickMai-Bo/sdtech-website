package com.sdtech.website.dto.vo;

import java.io.Serializable;

/** 优势条目 VO：由 site_content 的 group=advantage 解析而来。 */
public class AdvantageVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 序号。 */
    private Integer seq;

    /** 标题。 */
    private String title;

    /** 说明。 */
    private String desc;

    /** 图标 key。 */
    private String icon;

    public AdvantageVO() {
    }

    public AdvantageVO(Integer seq, String title, String desc, String icon) {
        this.seq = seq;
        this.title = title;
        this.desc = desc;
        this.icon = icon;
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
