package com.sdtech.website.dto.req;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.List;

/**
 * 站点内容「整组替换」请求：一次提交一个 group 的完整条目。
 */
public class SiteContentSaveReq {

    /** 内容分组，如 hero。 */
    @NotBlank(message = "分组不能为空")
    private String group;

    /** 该组完整条目列表。 */
    @Valid
    @NotEmpty(message = "条目不能为空")
    private List<Item> items = new ArrayList<>();

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    /** 单条 KV 条目。 */
    public static class Item {

        /** 键名，如 title / 1.title。 */
        @NotBlank(message = "键名不能为空")
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
}
