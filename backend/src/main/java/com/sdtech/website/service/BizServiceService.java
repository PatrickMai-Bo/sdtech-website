package com.sdtech.website.service;

import com.sdtech.website.dto.req.DeliverableSaveReq;
import com.sdtech.website.dto.req.ServiceItemSaveReq;
import com.sdtech.website.dto.req.ServiceSaveReq;
import com.sdtech.website.dto.req.SortReq;
import com.sdtech.website.dto.vo.DeliverableVO;
import com.sdtech.website.dto.vo.ServiceDetailVO;
import com.sdtech.website.dto.vo.ServiceItemVO;
import com.sdtech.website.dto.vo.ServiceVO;

import java.util.List;

/**
 * 业务服务（biz_service）及其细分项、交付物的读写。
 */
public interface BizServiceService {

    /** 公开业务卡列表（仅 status=1）。 */
    List<ServiceVO> listPublic();

    /** 公开业务详情（含细分项与交付物）。 */
    ServiceDetailVO detailBySlug(String slug);

    /** 公开细分服务列表。 */
    List<ServiceItemVO> itemsBySlug(String slug);

    /** 后台业务列表（含隐藏）。 */
    List<ServiceVO> listAdmin();

    /** 新增业务。 */
    Long create(ServiceSaveReq req);

    /** 修改业务。 */
    void update(Long id, ServiceSaveReq req);

    /** 删除业务（逻辑删除，并级联下线其细分项）。 */
    void remove(Long id);

    /** 上下移动排序。 */
    void sort(Long id, SortReq req);

    /** 后台细分服务列表。 */
    List<ServiceItemVO> adminItems(Long serviceId);

    /** 新增细分服务。 */
    Long createItem(ServiceItemSaveReq req);

    /** 修改细分服务。 */
    void updateItem(Long id, ServiceItemSaveReq req);

    /** 删除细分服务。 */
    void deleteItem(Long id);

    /** 交付物列表。 */
    List<DeliverableVO> deliverables(Long serviceId);

    /** 新增交付物。 */
    Long createDeliverable(DeliverableSaveReq req);

    /** 修改交付物。 */
    void updateDeliverable(Long id, DeliverableSaveReq req);

    /** 删除交付物。 */
    void deleteDeliverable(Long id);
}
