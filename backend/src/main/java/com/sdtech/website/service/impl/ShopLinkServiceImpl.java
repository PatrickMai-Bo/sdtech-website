package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.req.ShopLinkSaveReq;
import com.sdtech.website.dto.vo.ShopLinkVO;
import com.sdtech.website.entity.ShopLink;
import com.sdtech.website.mapper.ShopLinkMapper;
import com.sdtech.website.service.ShopLinkService;
import com.sdtech.website.util.ValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 店铺/联系方式链接读写实现。show_zone 为逗号分隔，按 zone 过滤。
 */
@Service
public class ShopLinkServiceImpl implements ShopLinkService {

    private final ShopLinkMapper shopLinkMapper;

    public ShopLinkServiceImpl(ShopLinkMapper shopLinkMapper) {
        this.shopLinkMapper = shopLinkMapper;
    }

    @Override
    public List<ShopLinkVO> listPublic(String zone) {
        List<ShopLink> rows = shopLinkMapper.selectList(new LambdaQueryWrapper<ShopLink>()
                .eq(ShopLink::getStatus, 1)
                .orderByAsc(ShopLink::getSortOrder)
                .orderByAsc(ShopLink::getId));
        List<ShopLinkVO> result = new ArrayList<>();
        String target = zone == null ? null : zone.trim();
        for (ShopLink row : rows) {
            if (StringUtils.hasText(target) && !matchZone(row.getShowZone(), target)) {
                continue;
            }
            result.add(toVO(row));
        }
        return result;
    }

    @Override
    public List<ShopLinkVO> listAdmin() {
        List<ShopLink> rows = shopLinkMapper.selectList(new LambdaQueryWrapper<ShopLink>()
                .orderByAsc(ShopLink::getSortOrder)
                .orderByAsc(ShopLink::getId));
        List<ShopLinkVO> result = new ArrayList<>();
        for (ShopLink row : rows) {
            result.add(toVO(row));
        }
        return result;
    }

    @Override
    public Long create(ShopLinkSaveReq req) {
        ValidatorUtil.assertNotBlank("平台", req.getPlatform());
        ValidatorUtil.assertNotBlank("标题", req.getTitle());
        ValidatorUtil.assertSafeText("标题", req.getTitle(), 64);
        ShopLink entity = new ShopLink();
        entity.setPlatform(req.getPlatform().trim());
        entity.setTitle(req.getTitle().trim());
        entity.setLinkUrl(req.getLinkUrl());
        entity.setIcon(req.getIcon());
        entity.setQrcodeImage(req.getQrcodeImage());
        entity.setShowZone(req.getShowZone());
        entity.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        entity.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        shopLinkMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public void update(Long id, ShopLinkSaveReq req) {
        ShopLink entity = requireLink(id);
        ValidatorUtil.assertNotBlank("平台", req.getPlatform());
        ValidatorUtil.assertNotBlank("标题", req.getTitle());
        ValidatorUtil.assertSafeText("标题", req.getTitle(), 64);
        entity.setPlatform(req.getPlatform().trim());
        entity.setTitle(req.getTitle().trim());
        entity.setLinkUrl(req.getLinkUrl());
        entity.setIcon(req.getIcon());
        entity.setQrcodeImage(req.getQrcodeImage());
        entity.setShowZone(req.getShowZone());
        if (req.getSortOrder() != null) {
            entity.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            entity.setStatus(req.getStatus());
        }
        shopLinkMapper.updateById(entity);
    }

    @Override
    public void remove(Long id) {
        requireLink(id);
        // 物理删除
        shopLinkMapper.deleteById(id);
    }

    /** 取链接实体。 */
    private ShopLink requireLink(Long id) {
        ShopLink entity = shopLinkMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "链接不存在");
        }
        return entity;
    }

    /** 判断 show_zone（逗号分隔）是否包含目标位置。 */
    private boolean matchZone(String showZone, String target) {
        if (!StringUtils.hasText(showZone)) {
            return false;
        }
        return Arrays.stream(showZone.split(","))
                .map(String::trim)
                .anyMatch(item -> item.equalsIgnoreCase(target));
    }

    /** 实体转 VO。 */
    private ShopLinkVO toVO(ShopLink entity) {
        ShopLinkVO vo = new ShopLinkVO();
        vo.setId(entity.getId());
        vo.setPlatform(entity.getPlatform());
        vo.setTitle(entity.getTitle());
        vo.setLinkUrl(entity.getLinkUrl());
        vo.setIcon(entity.getIcon());
        vo.setQrcodeImage(entity.getQrcodeImage());
        vo.setShowZone(entity.getShowZone());
        vo.setSortOrder(entity.getSortOrder());
        vo.setStatus(entity.getStatus());
        return vo;
    }
}
