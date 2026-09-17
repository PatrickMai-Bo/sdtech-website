package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.req.QuoteSaveReq;
import com.sdtech.website.dto.vo.QuoteVO;
import com.sdtech.website.entity.BizService;
import com.sdtech.website.entity.QuoteItem;
import com.sdtech.website.mapper.BizServiceMapper;
import com.sdtech.website.mapper.QuoteItemMapper;
import com.sdtech.website.service.QuoteService;
import com.sdtech.website.util.ValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 报价项读写实现。前后台共用同一查询，保证「后台改价 → 前台即时生效」。
 */
@Service
public class QuoteServiceImpl implements QuoteService {

    private final QuoteItemMapper quoteItemMapper;

    private final BizServiceMapper bizServiceMapper;

    public QuoteServiceImpl(QuoteItemMapper quoteItemMapper, BizServiceMapper bizServiceMapper) {
        this.quoteItemMapper = quoteItemMapper;
        this.bizServiceMapper = bizServiceMapper;
    }

    @Override
    public List<QuoteVO> listPublic() {
        return toVOList(quoteItemMapper.selectList(new LambdaQueryWrapper<QuoteItem>()
                .eq(QuoteItem::getStatus, 1)
                .orderByAsc(QuoteItem::getSortOrder)
                .orderByAsc(QuoteItem::getId)));
    }

    @Override
    public List<QuoteVO> listByServiceSlug(String serviceSlug) {
        if (!StringUtils.hasText(serviceSlug)) {
            return new ArrayList<>();
        }
        BizService service = bizServiceMapper.selectOne(new LambdaQueryWrapper<BizService>()
                .eq(BizService::getSlug, serviceSlug.trim()));
        if (service == null) {
            return new ArrayList<>();
        }
        return toVOList(quoteItemMapper.selectList(new LambdaQueryWrapper<QuoteItem>()
                .eq(QuoteItem::getServiceId, service.getId())
                .eq(QuoteItem::getStatus, 1)
                .orderByAsc(QuoteItem::getSortOrder)
                .orderByAsc(QuoteItem::getId)));
    }

    @Override
    public List<QuoteVO> listAdmin() {
        return toVOList(quoteItemMapper.selectList(new LambdaQueryWrapper<QuoteItem>()
                .orderByAsc(QuoteItem::getSortOrder)
                .orderByAsc(QuoteItem::getId)));
    }

    @Override
    public Long create(QuoteSaveReq req) {
        ValidatorUtil.assertNotBlank("名称", req.getItemName());
        ValidatorUtil.assertSafeText("名称", req.getItemName(), 128);
        ValidatorUtil.assertSafeText("说明", req.getDescription(), 500);
        if (req.getServiceId() != null) {
            requireService(req.getServiceId());
        }
        QuoteItem entity = new QuoteItem();
        entity.setServiceId(req.getServiceId());
        entity.setItemName(req.getItemName().trim());
        entity.setPriceText(req.getPriceText());
        entity.setPriceUnit(req.getPriceUnit());
        entity.setDescription(req.getDescription());
        entity.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        entity.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        quoteItemMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public void update(Long id, QuoteSaveReq req) {
        QuoteItem entity = requireQuote(id);
        if (req.getServiceId() != null) {
            requireService(req.getServiceId());
            entity.setServiceId(req.getServiceId());
        }
        ValidatorUtil.assertNotBlank("名称", req.getItemName());
        ValidatorUtil.assertSafeText("名称", req.getItemName(), 128);
        ValidatorUtil.assertSafeText("说明", req.getDescription(), 500);
        entity.setItemName(req.getItemName().trim());
        entity.setPriceText(req.getPriceText());
        entity.setPriceUnit(req.getPriceUnit());
        entity.setDescription(req.getDescription());
        if (req.getSortOrder() != null) {
            entity.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            entity.setStatus(req.getStatus());
        }
        quoteItemMapper.updateById(entity);
    }

    @Override
    public void remove(Long id) {
        requireQuote(id);
        quoteItemMapper.deleteById(id);
    }

    /** 取报价实体。 */
    private QuoteItem requireQuote(Long id) {
        QuoteItem entity = quoteItemMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "报价项不存在");
        }
        return entity;
    }

    /** 校验业务是否存在。 */
    private void requireService(Long serviceId) {
        if (bizServiceMapper.selectById(serviceId) == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "关联业务不存在");
        }
    }

    /** 实体列表转 VO，并回填业务标识。 */
    private List<QuoteVO> toVOList(List<QuoteItem> list) {
        List<QuoteVO> result = new ArrayList<>();
        if (list == null || list.isEmpty()) {
            return result;
        }
        Map<Long, String> slugMap = new HashMap<>();
        List<BizService> services = bizServiceMapper.selectList(null);
        if (services != null) {
            for (BizService service : services) {
                slugMap.put(service.getId(), service.getSlug());
            }
        }
        for (QuoteItem entity : list) {
            QuoteVO vo = new QuoteVO();
            vo.setId(entity.getId());
            vo.setServiceId(entity.getServiceId());
            vo.setServiceSlug(entity.getServiceId() == null ? null : slugMap.get(entity.getServiceId()));
            vo.setItemName(entity.getItemName());
            vo.setPriceText(entity.getPriceText());
            vo.setPriceUnit(entity.getPriceUnit());
            vo.setDescription(entity.getDescription());
            vo.setSortOrder(entity.getSortOrder());
            vo.setStatus(entity.getStatus());
            result.add(vo);
        }
        return result;
    }
}
