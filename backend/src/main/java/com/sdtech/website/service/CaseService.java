package com.sdtech.website.service;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.dto.req.CaseSaveReq;
import com.sdtech.website.dto.vo.CaseDetailVO;
import com.sdtech.website.dto.vo.CaseVO;
import com.sdtech.website.dto.vo.CategoryVO;

import java.util.List;

/**
 * 案例项目（case_project + case_image）读写服务。
 */
public interface CaseService {

    /** 前台案例分页。 */
    PageVO<CaseVO> pagePublic(String category, long page, long size, String keyword);

    /** 精选案例。 */
    List<CaseVO> featured(int limit);

    /** 案例分类。 */
    List<CategoryVO> categories();

    /** 案例详情含多图，并累加浏览量。 */
    CaseDetailVO detail(Long id);

    /** 后台案例分页。 */
    PageVO<CaseVO> pageAdmin(long page, long size, String category, Integer featured, String keyword);

    /** 后台案例详情（不累加浏览量）。 */
    CaseDetailVO adminDetail(Long id);

    /** 新增案例（含图片）。 */
    Long create(CaseSaveReq req);

    /** 修改案例（图片全量覆盖）。 */
    void update(Long id, CaseSaveReq req);

    /** 逻辑删除案例，并清理其图片。 */
    void remove(Long id);

    /** 切换精选状态。 */
    void toggleFeatured(Long id, Integer isFeatured);

    /** 追加单张案例图片。 */
    Long addImage(Long caseId, CaseSaveReq.ImageReq req);

    /** 删除单张案例图片。 */
    void removeImage(Long imageId);
}
