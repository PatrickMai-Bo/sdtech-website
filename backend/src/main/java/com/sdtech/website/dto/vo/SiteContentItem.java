package com.sdtech.website.dto.vo;

import java.io.Serializable;

/**
 * 站点内容项：{group, key, value, imageUrl, valueType, label, sortOrder}。
 */
public class SiteContentItem implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 分组。 */
    private String group;

    /** 键名。 */
    private String key;

    /** 文本值。 */
    private String value;

    /** 配套图片。 */
    private String imageUrl;

    /** 值类型：text/image/url/switch。 */
    private String valueType;

    /** 后台表单中文名。 */
    private String label;

    /** 排序。 */
    private Integer sortOrder;

    public SiteContentItem() {
    }

    public SiteContentItem(String group, String key, String value, String imageUrl,
                           String valueType, String label, Integer sortOrder) {
        this.group = group;
        this.key = key;
        this.value = value;
        this.imageUrl = imageUrl;
        this.valueType = valueType;
        this.label = label;
        this.sortOrder = sortOrder;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
