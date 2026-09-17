package com.sdtech.website.service;

import com.sdtech.website.dto.req.QuoteSaveReq;
import com.sdtech.website.dto.vo.QuoteVO;

import java.util.List;

/**
 * 报价项（quote_item）读写服务。
 */
public interface QuoteService {

    /** 公开：全部启用报价。 */
    List<QuoteVO> listPublic();

    /** 公开：某业务下的报价。 */
    List<QuoteVO> listByServiceSlug(String serviceSlug);

    /** 后台：全部报价（含隐藏）。 */
    List<QuoteVO> listAdmin();

    /** 新增报价。 */
    Long create(QuoteSaveReq req);

    /** 修改报价。 */
    void update(Long id, QuoteSaveReq req);

    /** 删除报价。 */
    void remove(Long id);
}
