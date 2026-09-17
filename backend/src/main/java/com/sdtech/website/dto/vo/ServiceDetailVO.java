package com.sdtech.website.dto.vo;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/** 业务详情 VO：业务 + 细分项 + 交付物。 */
public class ServiceDetailVO extends ServiceVO {

    private static final long serialVersionUID = 1L;

    /** 细分服务列表。 */
    private List<ServiceItemVO> items = new ArrayList<>();

    /** 交付物列表。 */
    private List<DeliverableVO> deliverables = new ArrayList<>();

    public List<ServiceItemVO> getItems() {
        return items;
    }

    public void setItems(List<ServiceItemVO> items) {
        this.items = items == null ? new ArrayList<>() : items;
    }

    public List<DeliverableVO> getDeliverables() {
        return deliverables;
    }

    public void setDeliverables(List<DeliverableVO> deliverables) {
        this.deliverables = deliverables == null ? new ArrayList<>() : deliverables;
    }
}
