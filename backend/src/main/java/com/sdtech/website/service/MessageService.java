package com.sdtech.website.service;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.dto.req.BatchReadReq;
import com.sdtech.website.dto.req.MessageReq;
import com.sdtech.website.dto.vo.ContactMessageVO;

/**
 * 访客留言（contact_message）读写服务：提交含限流，后台列表不含 IP。
 */
public interface MessageService {

    /** 提交留言（服务端二次校验 + XSS 拦截 + IP 限流）。 */
    Long create(MessageReq req, String ip);

    /** 后台分页列表（时间倒序，可按已读状态过滤）。 */
    PageVO<ContactMessageVO> pageAdmin(long page, long size, Integer isRead);

    /** 未读数量。 */
    long countUnread();

    /** 标记已读/未读。 */
    void markRead(Long id, Integer isRead);

    /** 批量标记已读。 */
    int batchRead(BatchReadReq req);

    /** 删除留言。 */
    void remove(Long id);
}
