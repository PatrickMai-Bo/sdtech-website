package com.sdtech.website.dto.vo;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.time.LocalDateTime;

/** 留言 VO：不含 ip_address，避免敏感字段下发前端。 */
public class ContactMessageVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键。 */
    private Long id;

    /** 姓名。 */
    private String name;

    /** 手机号。 */
    private String phone;

    /** 需求描述。 */
    private String demand;

    /** 是否已读。 */
    private Integer isRead;

    /** 来源页面。 */
    private String sourcePage;

    /** 管理员备注。 */
    private String remark;

    /** 创建时间。 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDemand() {
        return demand;
    }

    public void setDemand(String demand) {
        this.demand = demand;
    }

    public Integer getIsRead() {
        return isRead;
    }

    public void setIsRead(Integer isRead) {
        this.isRead = isRead;
    }

    public String getSourcePage() {
        return sourcePage;
    }

    public void setSourcePage(String sourcePage) {
        this.sourcePage = sourcePage;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}
