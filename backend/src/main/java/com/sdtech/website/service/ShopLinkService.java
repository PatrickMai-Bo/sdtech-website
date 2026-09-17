package com.sdtech.website.service;

import com.sdtech.website.dto.req.ShopLinkSaveReq;
import com.sdtech.website.dto.vo.ShopLinkVO;

import java.util.List;

/**
 * 店铺/联系方式链接（shop_link）读写服务。
 */
public interface ShopLinkService {

    /** 公开：按展示位置过滤的启用链接。 */
    List<ShopLinkVO> listPublic(String zone);

    /** 后台：全部链接。 */
    List<ShopLinkVO> listAdmin();

    /** 新增链接。 */
    Long create(ShopLinkSaveReq req);

    /** 修改链接。 */
    void update(Long id, ShopLinkSaveReq req);

    /** 删除链接（物理删除）。 */
    void remove(Long id);
}
