package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.req.BatchReadReq;
import com.sdtech.website.dto.req.MessageReq;
import com.sdtech.website.dto.vo.ContactMessageVO;
import com.sdtech.website.entity.ContactMessage;
import com.sdtech.website.mapper.ContactMessageMapper;
import com.sdtech.website.service.MessageService;
import com.sdtech.website.util.RateLimiter;
import com.sdtech.website.util.ValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 留言读写实现：提交含 IP 限流（60 秒 3 条）与服务端二次校验。
 */
@Service
public class MessageServiceImpl implements MessageService {

    /** 留言限流键前缀。 */
    private static final String MESSAGE_LIMIT_PREFIX = "message:";

    /** 限流窗口内允许条数。 */
    private static final int MESSAGE_MAX = 3;

    /** 限流窗口（60 秒）。 */
    private static final long MESSAGE_WINDOW_MS = 60 * 1000L;

    /** 单页最大条数。 */
    private static final long MAX_PAGE_SIZE = 50L;

    private final ContactMessageMapper contactMessageMapper;

    private final RateLimiter rateLimiter;

    public MessageServiceImpl(ContactMessageMapper contactMessageMapper, RateLimiter rateLimiter) {
        this.contactMessageMapper = contactMessageMapper;
        this.rateLimiter = rateLimiter;
    }

    @Override
    public Long create(MessageReq req, String ip) {
        if (!rateLimiter.check(MESSAGE_LIMIT_PREFIX + ip, MESSAGE_MAX, MESSAGE_WINDOW_MS)) {
            throw new BusinessException(ResultCode.TOO_MANY_REQUESTS, "提交过于频繁，请稍后再试");
        }
        // 服务端二次校验（前端已校验，后端必须独立再校验一次）
        ValidatorUtil.assertNotBlank("姓名", req.getName());
        ValidatorUtil.assertSafeText("姓名", req.getName(), 30);
        ValidatorUtil.assertNotBlank("手机号", req.getPhone());
        if (!ValidatorUtil.isPhone(req.getPhone())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "手机号格式不正确");
        }
        ValidatorUtil.assertNotBlank("需求描述", req.getDemand());
        if (req.getDemand().length() < 5 || req.getDemand().length() > 500) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "需求描述长度需为 5-500 个字符");
        }
        ValidatorUtil.assertSafeText("需求描述", req.getDemand(), 500);
        ContactMessage entity = new ContactMessage();
        entity.setName(req.getName().trim());
        entity.setPhone(req.getPhone().trim());
        entity.setDemand(req.getDemand().trim());
        entity.setIsRead(0);
        entity.setSourcePage(req.getSourcePage());
        entity.setIpAddress(ip);
        contactMessageMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public PageVO<ContactMessageVO> pageAdmin(long page, long size, Integer isRead) {
        LambdaQueryWrapper<ContactMessage> query = new LambdaQueryWrapper<>();
        if (isRead != null) {
            query.eq(ContactMessage::getIsRead, isRead);
        }
        query.orderByDesc(ContactMessage::getCreateTime).orderByDesc(ContactMessage::getId);
        long current = page < 1 ? 1 : page;
        long pageSize = size < 1 ? 10 : Math.min(size, MAX_PAGE_SIZE);
        Page<ContactMessage> pageResult = contactMessageMapper.selectPage(new Page<>(current, pageSize), query);
        List<ContactMessageVO> records = new ArrayList<>();
        for (ContactMessage entity : pageResult.getRecords()) {
            records.add(toVO(entity));
        }
        return PageVO.of(pageResult, records);
    }

    @Override
    public long countUnread() {
        Long count = contactMessageMapper.selectCount(new LambdaQueryWrapper<ContactMessage>()
                .eq(ContactMessage::getIsRead, 0));
        return count == null ? 0L : count;
    }

    @Override
    public void markRead(Long id, Integer isRead) {
        if (contactMessageMapper.selectById(id) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "留言不存在");
        }
        ContactMessage patch = new ContactMessage();
        patch.setIsRead(isRead == null || isRead == 0 ? 0 : 1);
        contactMessageMapper.update(patch, new LambdaUpdateWrapper<ContactMessage>()
                .eq(ContactMessage::getId, id));
    }

    @Override
    public int batchRead(BatchReadReq req) {
        List<Long> ids = req == null ? null : req.getIds();
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        ContactMessage patch = new ContactMessage();
        patch.setIsRead(1);
        return contactMessageMapper.update(patch, new LambdaUpdateWrapper<ContactMessage>()
                .in(ContactMessage::getId, ids)
                .eq(ContactMessage::getIsRead, 0));
    }

    @Override
    public void remove(Long id) {
        if (contactMessageMapper.selectById(id) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "留言不存在");
        }
        contactMessageMapper.deleteById(id);
    }

    /** 实体转 VO（不含 ip_address）。 */
    private ContactMessageVO toVO(ContactMessage entity) {
        ContactMessageVO vo = new ContactMessageVO();
        vo.setId(entity.getId());
        vo.setName(entity.getName());
        vo.setPhone(entity.getPhone());
        vo.setDemand(entity.getDemand());
        vo.setIsRead(entity.getIsRead());
        vo.setSourcePage(entity.getSourcePage());
        vo.setRemark(entity.getRemark());
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }
}
