package com.sdtech.website.service.impl;

import com.sdtech.website.dto.vo.AdvantageVO;
import com.sdtech.website.dto.vo.FaqVO;
import com.sdtech.website.dto.vo.ProcessStepVO;
import com.sdtech.website.dto.vo.SiteContentItem;
import com.sdtech.website.entity.SiteContent;
import com.sdtech.website.service.ContentService;
import com.sdtech.website.service.SiteContentService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

/**
 * 公开内容聚合实现：把 site_content 的「序号.字段」键解析成结构化数组。
 * <p>
 * 前端只消费结构化 VO，不感知键规则；未来若拆分独立表，前端零改动。
 */
@Service
public class ContentServiceImpl implements ContentService {

    /** 分组：FAQ。 */
    private static final String GROUP_FAQ = "faq";

    /** 分组：合作流程。 */
    private static final String GROUP_PROCESS = "process";

    /** 分组：优势。 */
    private static final String GROUP_ADVANTAGE = "advantage";

    /** 纯数字序号判定。 */
    private static final Pattern DIGITS = Pattern.compile("\\d+");

    private final SiteContentService siteContentService;

    public ContentServiceImpl(SiteContentService siteContentService) {
        this.siteContentService = siteContentService;
    }

    @Override
    public List<SiteContentItem> publicContent(String group) {
        return siteContentService.listPublic(group);
    }

    @Override
    public List<FaqVO> faqs() {
        Map<Integer, Map<String, String>> parsed = parse(siteContentService.raw(GROUP_FAQ));
        List<FaqVO> list = new ArrayList<>();
        for (Map.Entry<Integer, Map<String, String>> entry : parsed.entrySet()) {
            Map<String, String> values = entry.getValue();
            list.add(new FaqVO(entry.getKey(), values.get("question"), values.get("answer")));
        }
        return list;
    }

    @Override
    public List<ProcessStepVO> processSteps() {
        Map<Integer, Map<String, String>> parsed = parse(siteContentService.raw(GROUP_PROCESS));
        List<ProcessStepVO> list = new ArrayList<>();
        for (Map.Entry<Integer, Map<String, String>> entry : parsed.entrySet()) {
            Map<String, String> values = entry.getValue();
            list.add(new ProcessStepVO(entry.getKey(), values.get("title"), values.get("desc")));
        }
        return list;
    }

    @Override
    public List<AdvantageVO> advantages() {
        Map<Integer, Map<String, String>> parsed = parse(siteContentService.raw(GROUP_ADVANTAGE));
        List<AdvantageVO> list = new ArrayList<>();
        for (Map.Entry<Integer, Map<String, String>> entry : parsed.entrySet()) {
            Map<String, String> values = entry.getValue();
            list.add(new AdvantageVO(entry.getKey(), values.get("title"), values.get("desc"), values.get("icon")));
        }
        return list;
    }

    /**
     * 解析同构列表：key 首段为纯数字即视为 {序号}.{字段名}。
     *
     * @param rows 原始行
     * @return 按序号升序排列的字段映射
     */
    private Map<Integer, Map<String, String>> parse(List<SiteContent> rows) {
        TreeMap<Integer, Map<String, String>> result = new TreeMap<>();
        if (rows == null) {
            return result;
        }
        for (SiteContent row : rows) {
            String key = row.getContentKey();
            if (key == null) {
                continue;
            }
            int dot = key.indexOf('.');
            if (dot <= 0 || dot >= key.length() - 1) {
                continue;
            }
            String seqPart = key.substring(0, dot);
            if (!DIGITS.matcher(seqPart).matches()) {
                continue;
            }
            int seq = Integer.parseInt(seqPart);
            String field = key.substring(dot + 1);
            result.computeIfAbsent(seq, k -> new LinkedHashMap<>()).put(field, row.getContentValue());
        }
        return result;
    }
}
