package com.sdtech.website.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sdtech.website.entity.QuoteItem;
import org.apache.ibatis.annotations.Mapper;

/** quote_item 数据访问。 */
@Mapper
public interface QuoteItemMapper extends BaseMapper<QuoteItem> {
}
