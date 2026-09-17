package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.req.DeliverableSaveReq;
import com.sdtech.website.dto.req.ServiceItemSaveReq;
import com.sdtech.website.dto.req.ServiceSaveReq;
import com.sdtech.website.dto.req.SortReq;
import com.sdtech.website.dto.vo.DeliverableVO;
import com.sdtech.website.dto.vo.ServiceDetailVO;
import com.sdtech.website.dto.vo.ServiceItemVO;
import com.sdtech.website.dto.vo.ServiceVO;
import com.sdtech.website.entity.BizService;
import com.sdtech.website.entity.ServiceDeliverable;
import com.sdtech.website.entity.ServiceItem;
import com.sdtech.website.mapper.BizServiceMapper;
import com.sdtech.website.mapper.ServiceDeliverableMapper;
import com.sdtech.website.mapper.ServiceItemMapper;
import com.sdtech.website.service.BizServiceService;
import com.sdtech.website.util.ValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * 业务、细分项、交付物的读写实现。
 */
@Service
public class BizServiceServiceImpl implements BizServiceService {

    /** 交付物默认图标。 */
    private static final String DEFAULT_DELIVERABLE_ICON = "check";

    /** 排序步长。 */
    private static final int SORT_STEP = 10;

    /**
     * 页面级业务标识：仅承载各业务页 Banner 与介绍段落，
     * 不作为首页业务卡展示（首页固定 8 张卡）。
     */
    private static final Set<String> PAGE_LEVEL_SLUGS = Set.of("web", "design", "video", "office");

    private final BizServiceMapper bizServiceMapper;

    private final ServiceItemMapper serviceItemMapper;

    private final ServiceDeliverableMapper serviceDeliverableMapper;

    public BizServiceServiceImpl(BizServiceMapper bizServiceMapper,
                                 ServiceItemMapper serviceItemMapper,
                                 ServiceDeliverableMapper serviceDeliverableMapper) {
        this.bizServiceMapper = bizServiceMapper;
        this.serviceItemMapper = serviceItemMapper;
        this.serviceDeliverableMapper = serviceDeliverableMapper;
    }

    @Override
    public List<ServiceVO> listPublic() {
        List<BizService> list = bizServiceMapper.selectList(new LambdaQueryWrapper<BizService>()
                .eq(BizService::getStatus, 1)
                .notIn(BizService::getSlug, PAGE_LEVEL_SLUGS)
                .orderByAsc(BizService::getSortOrder)
                .orderByAsc(BizService::getId));
        return toVOList(list);
    }

    @Override
    public ServiceDetailVO detailBySlug(String slug) {
        BizService service = requirePublicBySlug(slug);
        ServiceDetailVO vo = toDetailVO(service);
        vo.setItems(itemVOList(service.getId(), true));
        vo.setDeliverables(deliverableVOList(service.getId()));
        return vo;
    }

    @Override
    public List<ServiceItemVO> itemsBySlug(String slug) {
        BizService service = requirePublicBySlug(slug);
        return itemVOList(service.getId(), true);
    }

    @Override
    public List<ServiceVO> listAdmin() {
        List<BizService> list = bizServiceMapper.selectList(new LambdaQueryWrapper<BizService>()
                .orderByAsc(BizService::getSortOrder)
                .orderByAsc(BizService::getId));
        return toVOList(list);
    }

    @Override
    public Long create(ServiceSaveReq req) {
        String slug = req.getSlug() == null ? null : req.getSlug().trim();
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "标识不能为空");
        }
        ValidatorUtil.assertSafeText("名称", req.getName(), 64);
        ValidatorUtil.assertSafeText("副标题", req.getSubtitle(), 255);
        ValidatorUtil.assertSafeText("介绍", req.getSummary(), 500);
        if (countBySlug(slug, null) > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "标识已存在");
        }
        BizService entity = new BizService();
        applyToEntity(entity, req);
        entity.setSlug(slug);
        entity.setSortOrder(req.getSortOrder() == null ? nextSortOrder() : req.getSortOrder());
        entity.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        bizServiceMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public void update(Long id, ServiceSaveReq req) {
        BizService entity = requireService(id);
        String slug = req.getSlug() == null ? null : req.getSlug().trim();
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "标识不能为空");
        }
        ValidatorUtil.assertSafeText("名称", req.getName(), 64);
        ValidatorUtil.assertSafeText("副标题", req.getSubtitle(), 255);
        ValidatorUtil.assertSafeText("介绍", req.getSummary(), 500);
        if (countBySlug(slug, id) > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "标识已存在");
        }
        applyToEntity(entity, req);
        entity.setSlug(slug);
        if (req.getSortOrder() != null) {
            entity.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            entity.setStatus(req.getStatus());
        }
        bizServiceMapper.updateById(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void remove(Long id) {
        BizService entity = requireService(id);
        bizServiceMapper.deleteById(id);
        // 业务下线时级联隐藏其细分项，避免前台残留
        ServiceItem patch = new ServiceItem();
        patch.setStatus(0);
        serviceItemMapper.update(patch, new LambdaQueryWrapper<ServiceItem>()
                .eq(ServiceItem::getServiceId, entity.getId()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void sort(Long id, SortReq req) {
        requireService(id);
        List<BizService> all = bizServiceMapper.selectList(new LambdaQueryWrapper<BizService>()
                .orderByAsc(BizService::getSortOrder)
                .orderByAsc(BizService::getId));
        int index = -1;
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).getId().equals(id)) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            return;
        }
        int target = "up".equalsIgnoreCase(req.getDirection()) ? index - 1 : index + 1;
        if (target < 0 || target >= all.size()) {
            // 已在边界，无需移动
            return;
        }
        Collections.swap(all, index, target);
        for (int i = 0; i < all.size(); i++) {
            BizService current = all.get(i);
            current.setSortOrder(i * SORT_STEP);
            bizServiceMapper.updateById(current);
        }
    }

    @Override
    public List<ServiceItemVO> adminItems(Long serviceId) {
        return itemVOList(serviceId, false);
    }

    @Override
    public Long createItem(ServiceItemSaveReq req) {
        requireService(req.getServiceId());
        ValidatorUtil.assertSafeText("标题", req.getTitle(), 128);
        ValidatorUtil.assertSafeText("描述", req.getDescription(), 500);
        ServiceItem entity = new ServiceItem();
        entity.setServiceId(req.getServiceId());
        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription());
        entity.setIcon(req.getIcon());
        entity.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        entity.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        serviceItemMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public void updateItem(Long id, ServiceItemSaveReq req) {
        ServiceItem entity = requireItem(id);
        if (req.getServiceId() != null) {
            requireService(req.getServiceId());
            entity.setServiceId(req.getServiceId());
        }
        ValidatorUtil.assertSafeText("标题", req.getTitle(), 128);
        ValidatorUtil.assertSafeText("描述", req.getDescription(), 500);
        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription());
        entity.setIcon(req.getIcon());
        if (req.getSortOrder() != null) {
            entity.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            entity.setStatus(req.getStatus());
        }
        serviceItemMapper.updateById(entity);
    }

    @Override
    public void deleteItem(Long id) {
        requireItem(id);
        serviceItemMapper.deleteById(id);
    }

    @Override
    public List<DeliverableVO> deliverables(Long serviceId) {
        return deliverableVOList(serviceId);
    }

    @Override
    public Long createDeliverable(DeliverableSaveReq req) {
        requireService(req.getServiceId());
        ValidatorUtil.assertNotBlank("内容", req.getContent());
        ValidatorUtil.assertSafeText("内容", req.getContent(), 255);
        ServiceDeliverable entity = new ServiceDeliverable();
        entity.setServiceId(req.getServiceId());
        entity.setContent(req.getContent().trim());
        entity.setIcon(StringUtils.hasText(req.getIcon()) ? req.getIcon().trim() : DEFAULT_DELIVERABLE_ICON);
        entity.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        serviceDeliverableMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public void updateDeliverable(Long id, DeliverableSaveReq req) {
        ServiceDeliverable entity = requireDeliverable(id);
        if (req.getServiceId() != null) {
            requireService(req.getServiceId());
            entity.setServiceId(req.getServiceId());
        }
        ValidatorUtil.assertNotBlank("内容", req.getContent());
        ValidatorUtil.assertSafeText("内容", req.getContent(), 255);
        entity.setContent(req.getContent().trim());
        if (StringUtils.hasText(req.getIcon())) {
            entity.setIcon(req.getIcon().trim());
        }
        if (req.getSortOrder() != null) {
            entity.setSortOrder(req.getSortOrder());
        }
        serviceDeliverableMapper.updateById(entity);
    }

    @Override
    public void deleteDeliverable(Long id) {
        requireDeliverable(id);
        // 从表，物理删除
        serviceDeliverableMapper.deleteById(id);
    }

    /** 取业务实体，不存在抛 404。 */
    private BizService requireService(Long id) {
        BizService service = bizServiceMapper.selectById(id);
        if (service == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "业务不存在");
        }
        return service;
    }

    /** 取前台可见业务（status=1）。 */
    private BizService requirePublicBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "业务不存在");
        }
        BizService service = bizServiceMapper.selectOne(new LambdaQueryWrapper<BizService>()
                .eq(BizService::getSlug, slug.trim())
                .eq(BizService::getStatus, 1));
        if (service == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "业务不存在");
        }
        return service;
    }

    /** 取细分项实体。 */
    private ServiceItem requireItem(Long id) {
        ServiceItem item = serviceItemMapper.selectById(id);
        if (item == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "细分服务不存在");
        }
        return item;
    }

    /** 取交付物实体。 */
    private ServiceDeliverable requireDeliverable(Long id) {
        ServiceDeliverable deliverable = serviceDeliverableMapper.selectById(id);
        if (deliverable == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "交付物不存在");
        }
        return deliverable;
    }

    /** 统计同 slug 数量，excludeId 非空时排除自身。 */
    private long countBySlug(String slug, Long excludeId) {
        LambdaQueryWrapper<BizService> query = new LambdaQueryWrapper<BizService>()
                .eq(BizService::getSlug, slug);
        if (excludeId != null) {
            query.ne(BizService::getId, excludeId);
        }
        Long count = bizServiceMapper.selectCount(query);
        return count == null ? 0L : count;
    }

    /** 新记录默认排在末尾。 */
    private int nextSortOrder() {
        List<BizService> all = bizServiceMapper.selectList(new LambdaQueryWrapper<BizService>()
                .orderByDesc(BizService::getSortOrder));
        if (all.isEmpty() || all.get(0).getSortOrder() == null) {
            return 0;
        }
        return all.get(0).getSortOrder() + SORT_STEP;
    }

    /** 请求体写入实体（不含 slug / sortOrder / status）。 */
    private void applyToEntity(BizService entity, ServiceSaveReq req) {
        entity.setName(req.getName() == null ? null : req.getName().trim());
        entity.setSubtitle(req.getSubtitle());
        entity.setSummary(req.getSummary());
        entity.setIcon(req.getIcon());
        entity.setCoverImage(req.getCoverImage());
        entity.setTargetUrl(req.getTargetUrl());
        entity.setPageKey(req.getPageKey());
    }

    /** 细分项列表；onlyEnabled 为 true 时只返回启用项。 */
    private List<ServiceItemVO> itemVOList(Long serviceId, boolean onlyEnabled) {
        LambdaQueryWrapper<ServiceItem> query = new LambdaQueryWrapper<ServiceItem>()
                .eq(ServiceItem::getServiceId, serviceId);
        if (onlyEnabled) {
            query.eq(ServiceItem::getStatus, 1);
        }
        query.orderByAsc(ServiceItem::getSortOrder).orderByAsc(ServiceItem::getId);
        List<ServiceItem> items = serviceItemMapper.selectList(query);
        List<ServiceItemVO> list = new ArrayList<>();
        for (ServiceItem item : items) {
            ServiceItemVO vo = new ServiceItemVO();
            vo.setId(item.getId());
            vo.setServiceId(item.getServiceId());
            vo.setTitle(item.getTitle());
            vo.setDescription(item.getDescription());
            vo.setIcon(item.getIcon());
            vo.setSortOrder(item.getSortOrder());
            vo.setStatus(item.getStatus());
            list.add(vo);
        }
        return list;
    }

    /** 交付物列表。 */
    private List<DeliverableVO> deliverableVOList(Long serviceId) {
        List<ServiceDeliverable> rows = serviceDeliverableMapper.selectList(
                new LambdaQueryWrapper<ServiceDeliverable>()
                        .eq(ServiceDeliverable::getServiceId, serviceId)
                        .orderByAsc(ServiceDeliverable::getSortOrder)
                        .orderByAsc(ServiceDeliverable::getId));
        List<DeliverableVO> list = new ArrayList<>();
        for (ServiceDeliverable row : rows) {
            DeliverableVO vo = new DeliverableVO();
            vo.setId(row.getId());
            vo.setServiceId(row.getServiceId());
            vo.setContent(row.getContent());
            vo.setIcon(row.getIcon());
            vo.setSortOrder(row.getSortOrder());
            list.add(vo);
        }
        return list;
    }

    /** 实体列表转 VO 列表。 */
    private List<ServiceVO> toVOList(List<BizService> list) {
        List<ServiceVO> result = new ArrayList<>();
        if (list == null) {
            return result;
        }
        for (BizService service : list) {
            result.add(toVO(service));
        }
        return result;
    }

    /** 实体转 VO。 */
    private ServiceVO toVO(BizService service) {
        ServiceVO vo = new ServiceVO();
        vo.setId(service.getId());
        vo.setSlug(service.getSlug());
        vo.setName(service.getName());
        vo.setSubtitle(service.getSubtitle());
        vo.setSummary(service.getSummary());
        vo.setIcon(service.getIcon());
        vo.setCoverImage(service.getCoverImage());
        vo.setTargetUrl(service.getTargetUrl());
        vo.setPageKey(service.getPageKey());
        vo.setSortOrder(service.getSortOrder());
        vo.setStatus(service.getStatus());
        return vo;
    }

    /** 实体转详情 VO。 */
    private ServiceDetailVO toDetailVO(BizService service) {
        ServiceDetailVO vo = new ServiceDetailVO();
        vo.setId(service.getId());
        vo.setSlug(service.getSlug());
        vo.setName(service.getName());
        vo.setSubtitle(service.getSubtitle());
        vo.setSummary(service.getSummary());
        vo.setIcon(service.getIcon());
        vo.setCoverImage(service.getCoverImage());
        vo.setTargetUrl(service.getTargetUrl());
        vo.setPageKey(service.getPageKey());
        vo.setSortOrder(service.getSortOrder());
        vo.setStatus(service.getStatus());
        return vo;
    }
}
