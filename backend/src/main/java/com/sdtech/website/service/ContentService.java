package com.sdtech.website.service;

import com.sdtech.website.dto.vo.AdvantageVO;
import com.sdtech.website.dto.vo.FaqVO;
import com.sdtech.website.dto.vo.ProcessStepVO;
import com.sdtech.website.dto.vo.SiteContentItem;

import java.util.List;

/**
 * 公开内容聚合服务：全站 KV 与由 KV 派生的同构列表（优势 / 流程 / FAQ）。
 * <p>
 * 解析规则：content_key 首段为纯数字即视为列表项（{@code 序号.字段名}）。
 */
public interface ContentService {

    /** 全站 KV（可按 group 过滤）。 */
    List<SiteContentItem> publicContent(String group);

    /** FAQ 列表（group=faq）。 */
    List<FaqVO> faqs();

    /** 合作流程 6 步（group=process）。 */
    List<ProcessStepVO> processSteps();

    /** 优势条目（group=advantage）。 */
    List<AdvantageVO> advantages();
}
