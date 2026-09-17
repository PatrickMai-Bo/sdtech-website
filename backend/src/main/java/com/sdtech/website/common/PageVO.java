package com.sdtech.website.common;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 分页返回体：{records, total, page, size, pages}。
 *
 * @param <T> 记录类型
 */
public class PageVO<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 当前页记录。 */
    private List<T> records = new ArrayList<>();

    /** 总记录数。 */
    private long total;

    /** 当前页码（从 1 开始）。 */
    private long page;

    /** 每页条数。 */
    private long size;

    /** 总页数。 */
    private long pages;

    public PageVO() {
    }

    /** 由 MyBatis-Plus 分页对象转换。 */
    public static <T> PageVO<T> of(IPage<T> pageResult) {
        PageVO<T> vo = new PageVO<>();
        if (pageResult == null) {
            return vo;
        }
        vo.setRecords(pageResult.getRecords() == null ? Collections.emptyList() : pageResult.getRecords());
        vo.setTotal(pageResult.getTotal());
        vo.setPage(pageResult.getCurrent());
        vo.setSize(pageResult.getSize());
        vo.setPages(pageResult.getPages());
        return vo;
    }

    /** 由 MyBatis-Plus 分页对象 + 已转换的记录列表构造（实体转 VO 后使用）。 */
    public static <T, R> PageVO<R> of(IPage<T> pageResult, List<R> records) {
        PageVO<R> vo = new PageVO<>();
        if (pageResult == null) {
            vo.setRecords(records);
            return vo;
        }
        vo.setRecords(records == null ? Collections.emptyList() : records);
        vo.setTotal(pageResult.getTotal());
        vo.setPage(pageResult.getCurrent());
        vo.setSize(pageResult.getSize());
        vo.setPages(pageResult.getPages());
        return vo;
    }

    public List<T> getRecords() {
        return records;
    }

    public void setRecords(List<T> records) {
        this.records = records == null ? new ArrayList<>() : records;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getPage() {
        return page;
    }

    public void setPage(long page) {
        this.page = page;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public long getPages() {
        return pages;
    }

    public void setPages(long pages) {
        this.pages = pages;
    }
}
