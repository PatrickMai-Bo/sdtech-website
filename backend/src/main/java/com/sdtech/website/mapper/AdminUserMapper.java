package com.sdtech.website.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sdtech.website.entity.AdminUser;
import org.apache.ibatis.annotations.Mapper;

/** admin_user 数据访问。 */
@Mapper
public interface AdminUserMapper extends BaseMapper<AdminUser> {
}
