package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.req.CaseSaveReq;
import com.sdtech.website.dto.vo.CaseDetailVO;
import com.sdtech.website.dto.vo.CaseImageVO;
import com.sdtech.website.dto.vo.CaseVO;
import com.sdtech.website.dto.vo.CategoryVO;
import com.sdtech.website.entity.CaseImage;
import com.sdtech.website.entity.CaseProject;
import com.sdtech.website.mapper.CaseImageMapper;
import com.sdtech.website.mapper.CaseProjectMapper;
import com.sdtech.website.service.CaseService;
import com.sdtech.website.util.ValidatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 案例与案例图片读写实现。
 */
@Service
public class CaseServiceImpl implements CaseService {

    /** 精选案例默认条数。 */
    private static final int DEFAULT_FEATURED_LIMIT = 4;

    /** 单页最大条数，防止恶意 size。 */
    private static final long MAX_PAGE_SIZE = 50L;

    private final CaseProjectMapper caseProjectMapper;

    private final CaseImageMapper caseImageMapper;

    public CaseServiceImpl(CaseProjectMapper caseProjectMapper, CaseImageMapper caseImageMapper) {
        this.caseProjectMapper = caseProjectMapper;
        this.caseImageMapper = caseImageMapper;
    }

    @Override
    public PageVO<CaseVO> pagePublic(String category, long page, long size, String keyword) {
        LambdaQueryWrapper<CaseProject> query = new LambdaQueryWrapper<>();
        query.eq(CaseProject::getStatus, 1);
        if (StringUtils.hasText(category)) {
            query.eq(CaseProject::getCategory, category.trim());
        }
        if (StringUtils.hasText(keyword)) {
            String escaped = ValidatorUtil.escapeLike(keyword);
            query.and(wrapper -> wrapper
                    .like(CaseProject::getTitle, escaped)
                    .or()
                    .like(CaseProject::getSummary, escaped));
        }
        query.orderByAsc(CaseProject::getSortOrder).orderByDesc(CaseProject::getId);
        Page<CaseProject> pageResult = caseProjectMapper.selectPage(buildPage(page, size), query);
        return PageVO.of(pageResult, toVOList(pageResult.getRecords()));
    }

    @Override
    public List<CaseVO> featured(int limit) {
        int size = limit <= 0 ? DEFAULT_FEATURED_LIMIT : Math.min(limit, 20);
        LambdaQueryWrapper<CaseProject> query = new LambdaQueryWrapper<CaseProject>()
                .eq(CaseProject::getIsFeatured, 1)
                .eq(CaseProject::getStatus, 1)
                .orderByAsc(CaseProject::getSortOrder)
                .orderByDesc(CaseProject::getId);
        Page<CaseProject> pageResult = caseProjectMapper.selectPage(new Page<>(1, size), query);
        return toVOList(pageResult.getRecords());
    }

    @Override
    public List<CategoryVO> categories() {
        return new ArrayList<>(Arrays.asList(
                new CategoryVO("web", "网页开发"),
                new CategoryVO("design", "美工设计"),
                new CategoryVO("video", "视频剪辑"),
                new CategoryVO("office", "办公定制")));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CaseDetailVO detail(Long id) {
        CaseProject project = caseProjectMapper.selectOne(new LambdaQueryWrapper<CaseProject>()
                .eq(CaseProject::getId, id)
                .eq(CaseProject::getStatus, 1));
        if (project == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "案例不存在");
        }
        // 浏览量自增（预留字段）
        caseProjectMapper.update(null, new LambdaUpdateWrapper<CaseProject>()
                .eq(CaseProject::getId, id)
                .setSql("view_count = view_count + 1"));
        return buildDetail(project);
    }

    @Override
    public PageVO<CaseVO> pageAdmin(long page, long size, String category, Integer featured, String keyword) {
        LambdaQueryWrapper<CaseProject> query = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(category)) {
            query.eq(CaseProject::getCategory, category.trim());
        }
        if (featured != null) {
            query.eq(CaseProject::getIsFeatured, featured);
        }
        if (StringUtils.hasText(keyword)) {
            String escaped = ValidatorUtil.escapeLike(keyword);
            query.and(wrapper -> wrapper
                    .like(CaseProject::getTitle, escaped)
                    .or()
                    .like(CaseProject::getSummary, escaped));
        }
        query.orderByDesc(CaseProject::getCreateTime).orderByDesc(CaseProject::getId);
        Page<CaseProject> pageResult = caseProjectMapper.selectPage(buildPage(page, size), query);
        return PageVO.of(pageResult, toVOList(pageResult.getRecords()));
    }

    @Override
    public CaseDetailVO adminDetail(Long id) {
        return buildDetail(requireProject(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(CaseSaveReq req) {
        ValidatorUtil.assertSafeText("标题", req.getTitle(), 128);
        CaseProject entity = new CaseProject();
        entity.setTitle(req.getTitle().trim());
        entity.setCategory(req.getCategory().trim());
        entity.setCoverImage(req.getCoverImage());
        entity.setSummary(req.getSummary());
        entity.setTechOrMethod(req.getTechOrMethod());
        entity.setDeliverResult(req.getDeliverResult());
        entity.setIsFeatured(req.getIsFeatured() == null ? 0 : req.getIsFeatured());
        entity.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        entity.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        entity.setViewCount(0);
        caseProjectMapper.insert(entity);
        replaceImages(entity.getId(), req.getImages());
        syncCover(entity.getId(), req.getCoverImage());
        return entity.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, CaseSaveReq req) {
        CaseProject entity = requireProject(id);
        ValidatorUtil.assertSafeText("标题", req.getTitle(), 128);
        entity.setTitle(req.getTitle().trim());
        entity.setCategory(req.getCategory().trim());
        entity.setCoverImage(req.getCoverImage());
        entity.setSummary(req.getSummary());
        entity.setTechOrMethod(req.getTechOrMethod());
        entity.setDeliverResult(req.getDeliverResult());
        if (req.getIsFeatured() != null) {
            entity.setIsFeatured(req.getIsFeatured());
        }
        if (req.getSortOrder() != null) {
            entity.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            entity.setStatus(req.getStatus());
        }
        caseProjectMapper.updateById(entity);
        // 图片全量覆盖
        replaceImages(id, req.getImages());
        syncCover(id, req.getCoverImage());
    }

    @Override
    public void remove(Long id) {
        requireProject(id);
        // 逻辑删除，图片保留以便后续恢复
        caseProjectMapper.deleteById(id);
        CaseImage patch = new CaseImage();
        patch.setIsCover(0);
        caseImageMapper.update(patch, new LambdaUpdateWrapper<CaseImage>().eq(CaseImage::getCaseId, id));
    }

    @Override
    public void toggleFeatured(Long id, Integer isFeatured) {
        CaseProject entity = requireProject(id);
        entity.setIsFeatured(isFeatured == null || isFeatured == 0 ? 0 : 1);
        caseProjectMapper.updateById(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addImage(Long caseId, CaseSaveReq.ImageReq req) {
        requireProject(caseId);
        ValidatorUtil.assertNotBlank("图片地址", req.getImageUrl());
        CaseImage image = new CaseImage();
        image.setCaseId(caseId);
        image.setImageUrl(req.getImageUrl().trim());
        image.setAltText(req.getAltText());
        image.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        image.setIsCover(req.getIsCover() == null ? 0 : req.getIsCover());
        caseImageMapper.insert(image);
        if (image.getIsCover() != null && image.getIsCover() == 1) {
            syncCoverFromImages(caseId);
        }
        return image.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeImage(Long imageId) {
        CaseImage image = caseImageMapper.selectById(imageId);
        if (image == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "图片不存在");
        }
        boolean wasCover = image.getIsCover() != null && image.getIsCover() == 1;
        caseImageMapper.deleteById(imageId);
        if (wasCover) {
            syncCoverFromImages(image.getCaseId());
        }
    }

    /** 构造分页对象并夹紧参数。 */
    private Page<CaseProject> buildPage(long page, long size) {
        long current = page < 1 ? 1 : page;
        long pageSize = size < 1 ? 9 : Math.min(size, MAX_PAGE_SIZE);
        return new Page<>(current, pageSize);
    }

    /** 取案例实体。 */
    private CaseProject requireProject(Long id) {
        CaseProject project = caseProjectMapper.selectById(id);
        if (project == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "案例不存在");
        }
        return project;
    }

    /** 组装详情 VO（含图片）。 */
    private CaseDetailVO buildDetail(CaseProject project) {
        CaseDetailVO vo = new CaseDetailVO();
        vo.setId(project.getId());
        vo.setTitle(project.getTitle());
        vo.setCategory(project.getCategory());
        vo.setCoverImage(project.getCoverImage());
        vo.setSummary(project.getSummary());
        vo.setTechOrMethod(project.getTechOrMethod());
        vo.setDeliverResult(project.getDeliverResult());
        vo.setIsFeatured(project.getIsFeatured());
        vo.setSortOrder(project.getSortOrder());
        vo.setStatus(project.getStatus());
        vo.setViewCount(project.getViewCount());
        vo.setCreateTime(project.getCreateTime());
        vo.setImages(imageVOList(project.getId()));
        return vo;
    }

    /** 图片列表。 */
    private List<CaseImageVO> imageVOList(Long caseId) {
        List<CaseImage> rows = caseImageMapper.selectList(new LambdaQueryWrapper<CaseImage>()
                .eq(CaseImage::getCaseId, caseId)
                .orderByAsc(CaseImage::getSortOrder)
                .orderByAsc(CaseImage::getId));
        List<CaseImageVO> list = new ArrayList<>();
        for (CaseImage row : rows) {
            CaseImageVO vo = new CaseImageVO();
            vo.setId(row.getId());
            vo.setCaseId(row.getCaseId());
            vo.setImageUrl(row.getImageUrl());
            vo.setAltText(row.getAltText());
            vo.setSortOrder(row.getSortOrder());
            vo.setIsCover(row.getIsCover());
            list.add(vo);
        }
        return list;
    }

    /** 全量替换图片：先删后插。 */
    private void replaceImages(Long caseId, List<CaseSaveReq.ImageReq> images) {
        caseImageMapper.delete(new LambdaQueryWrapper<CaseImage>().eq(CaseImage::getCaseId, caseId));
        if (images == null || images.isEmpty()) {
            return;
        }
        int index = 0;
        for (CaseSaveReq.ImageReq req : images) {
            if (req == null || !StringUtils.hasText(req.getImageUrl())) {
                index++;
                continue;
            }
            CaseImage image = new CaseImage();
            image.setCaseId(caseId);
            image.setImageUrl(req.getImageUrl().trim());
            image.setAltText(req.getAltText());
            image.setSortOrder(req.getSortOrder() == null ? index : req.getSortOrder());
            image.setIsCover(req.getIsCover() == null ? 0 : req.getIsCover());
            caseImageMapper.insert(image);
            index++;
        }
    }

    /** 用指定封面地址同步；为空则从图片中取封面。 */
    private void syncCover(Long caseId, String coverImage) {
        if (StringUtils.hasText(coverImage)) {
            CaseProject patch = new CaseProject();
            patch.setCoverImage(coverImage.trim());
            caseProjectMapper.update(patch, new LambdaUpdateWrapper<CaseProject>()
                    .eq(CaseProject::getId, caseId));
            return;
        }
        syncCoverFromImages(caseId);
    }

    /** 从图片列表中取封面（优先 is_cover=1，其次第一张）同步到 case_project。 */
    private void syncCoverFromImages(Long caseId) {
        List<CaseImage> rows = caseImageMapper.selectList(new LambdaQueryWrapper<CaseImage>()
                .eq(CaseImage::getCaseId, caseId)
                .orderByAsc(CaseImage::getSortOrder)
                .orderByAsc(CaseImage::getId));
        CaseImage coverRow = null;
        for (CaseImage row : rows) {
            if (row.getIsCover() != null && row.getIsCover() == 1) {
                coverRow = row;
                break;
            }
        }
        if (coverRow == null && !rows.isEmpty()) {
            coverRow = rows.get(0);
        }
        CaseProject patch = new CaseProject();
        patch.setCoverImage(coverRow == null ? null : coverRow.getImageUrl());
        caseProjectMapper.update(patch, new LambdaUpdateWrapper<CaseProject>()
                .eq(CaseProject::getId, caseId));
        if (coverRow == null) {
            return;
        }
        // 保证有且仅有一张封面
        CaseImage reset = new CaseImage();
        reset.setIsCover(0);
        caseImageMapper.update(reset, new LambdaUpdateWrapper<CaseImage>()
                .eq(CaseImage::getCaseId, caseId));
        CaseImage mark = new CaseImage();
        mark.setIsCover(1);
        caseImageMapper.update(mark, new LambdaUpdateWrapper<CaseImage>()
                .eq(CaseImage::getId, coverRow.getId()));
    }

    /** 实体列表转 VO 列表。 */
    private List<CaseVO> toVOList(List<CaseProject> list) {
        List<CaseVO> result = new ArrayList<>();
        if (list == null || list.isEmpty()) {
            return result;
        }
        for (CaseProject project : list) {
            CaseVO vo = new CaseVO();
            vo.setId(project.getId());
            vo.setTitle(project.getTitle());
            vo.setCategory(project.getCategory());
            vo.setCoverImage(project.getCoverImage());
            vo.setSummary(project.getSummary());
            vo.setIsFeatured(project.getIsFeatured());
            vo.setSortOrder(project.getSortOrder());
            vo.setStatus(project.getStatus());
            vo.setViewCount(project.getViewCount());
            vo.setCreateTime(project.getCreateTime());
            result.add(vo);
        }
        return result;
    }
}
