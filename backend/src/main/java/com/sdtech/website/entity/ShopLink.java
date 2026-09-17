package com.sdtech.website.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 店铺/联系方式链接（shop_link）。物理删除，无逻辑删除字段。
 */
@TableName("shop_link")
public class ShopLink {

    /** 主键。 */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 平台：wechat/xianyu/taobao/pdd/other。 */
    private String platform;

    /** 展示标题。 */
    private String title;

    /** 链接地址；为 # 或空时前端隐藏入口。 */
    private String linkUrl;

    /** 图标 key。 */
    private String icon;

    /** 二维码图片 URL。 */
    private String qrcodeImage;

    /** 展示位置，逗号分隔：home,footer,contact,cta。 */
    private String showZone;

    /** 排序，升序。 */
    private Integer sortOrder;

    /** 状态：1 显示 0 隐藏。 */
    private Integer status;

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

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getQrcodeImage() {
        return qrcodeImage;
    }

    public void setQrcodeImage(String qrcodeImage) {
        this.qrcodeImage = qrcodeImage;
    }

    public String getShowZone() {
        return showZone;
    }

    public void setShowZone(String showZone) {
        this.showZone = showZone;
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
