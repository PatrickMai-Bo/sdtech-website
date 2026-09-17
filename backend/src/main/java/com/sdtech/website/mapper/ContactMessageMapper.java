package com.sdtech.website.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sdtech.website.entity.ContactMessage;
import org.apache.ibatis.annotations.Mapper;

/** contact_message 数据访问。 */
@Mapper
public interface ContactMessageMapper extends BaseMapper<ContactMessage> {
}
