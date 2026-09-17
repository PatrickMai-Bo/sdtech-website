package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.req.SiteContentSaveReq;
import com.sdtech.website.dto.vo.SiteContentItem;
import com.sdtech.website.entity.SiteContent;
import com.sdtech.website.mapper.SiteContentMapper;
import com.sdtech.website.service.SiteContentService;
import com.sdtech.website.util.ValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * site_content 读写实现：原始 KV 查询 + 按组整组替换（事务）。
 */
@Service
public class SiteContentServiceImpl implements SiteContentService {

    /** 默认值类型。 */
    private static final String DEFAULT_VALUE_TYPE = "text";

    private final SiteContentMapper siteContentMapper;

    public SiteContentServiceImpl(SiteContentMapper siteContentMapper) {
        this.siteContentMapper = siteContentMapper;
    }

    @Override
    public List<SiteContent> raw(String group) {
        LambdaQueryWrapper<SiteContent> query = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(group)) {
            query.eq(SiteContent::getContentGroup, group.trim());
        }
        query.orderByAsc(SiteContent::getContentGroup)
                .orderByAsc(SiteContent::getSortOrder)
                .orderByAsc(SiteContent::getId);
        return siteContentMapper.selectList(query);
    }

    @Override
    public List<SiteContentItem> listPublic(String group) {
        return convert(raw(group));
    }

    @Override
    public List<SiteContentItem> listAdmin(String group) {
        return convert(raw(group));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int replaceGroups(List<SiteContentSaveReq> payloads) {
        if (payloads == null || payloads.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "内容不能为空");
        }
        int total = 0;
        for (SiteContentSaveReq payload : payloads) {
            if (payload == null) {
                continue;
            }
            String group = payload.getGroup() == null ? null : payload.getGroup().trim();
            if (!StringUtils.hasText(group)) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "内容分组不能为空");
            }
            // 整组替换：先物理删除该组全部行，避免唯一键与被删记录冲突
            siteContentMapper.delete(new LambdaQueryWrapper<SiteContent>()
                    .eq(SiteContent::getContentGroup, group));
            List<SiteContentSaveReq.Item> items = payload.getItems();
            if (items == null || items.isEmpty()) {
                continue;
            }
            int index = 0;
            for (SiteContentSaveReq.Item item : items) {
                if (item == null || !StringUtils.hasText(item.getKey())) {
                    index++;
                    continue;
                }
                ValidatorUtil.assertSafeText("内容", item.getValue(), 0);
                ValidatorUtil.assertSafeText("图片地址", item.getImageUrl(), 0);
                SiteContent row = new SiteContent();
                row.setContentGroup(group);
                row.setContentKey(item.getKey().trim());
                row.setContentValue(item.getValue());
                row.setImageUrl(item.getImageUrl());
                row.setValueType(StringUtils.hasText(item.getValueType())
                        ? item.getValueType().trim() : DEFAULT_VALUE_TYPE);
                row.setLabel(item.getLabel());
                row.setSortOrder(item.getSortOrder() == null ? index : item.getSortOrder());
                siteContentMapper.insert(row);
                index++;
                total++;
            }
        }
        return total;
    }

    /** 实体转 VO。 */
    private List<SiteContentItem> convert(List<SiteContent> rows) {
        List<SiteContentItem> list = new ArrayList<>();
        if (rows == null) {
            return list;
        }
        for (SiteContent row : rows) {
            list.add(new SiteContentItem(
                    row.getContentGroup(),
                    row.getContentKey(),
                    row.getContentValue(),
                    row.getImageUrl(),
                    row.getValueType(),
                    row.getLabel(),
                    row.getSortOrder()));
        }
        return list;
    }
}
