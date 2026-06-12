-- 更新菜单名称，去除英文前缀
UPDATE menus SET name = '首页' WHERE name = 'hom首页';
UPDATE menus SET name = '线索管理' WHERE name = 'user线索管理';
UPDATE menus SET name = '客户管理' WHERE name = 'team客户管理';
UPDATE menus SET name = '报价管理' WHERE name = 'file-报价管理';
UPDATE menus SET name = '报价管理' WHERE name = 'text报价管理';
UPDATE menus SET name = '合同管理' WHERE name = 'file合同管理';
UPDATE menus SET name = '数据报表' WHERE name = 'bar-数据报表';
UPDATE menus SET name = '数据报表' WHERE name = 'chart数据报表';
UPDATE menus SET name = 'AI分析' WHERE name = 'brain分析';
UPDATE menus SET name = '系统管理' WHERE name = 'setti系统管理';
UPDATE menus SET name = '系统管理' WHERE name = 'setting系统管理';

-- 删除孤立的英文名称记录
DELETE FROM menus WHERE name REGEXP '^[a-zA-Z]+[-_]?$';

-- 查询更新后的菜单数据
SELECT id, parent_id, name, code, path, icon, sort FROM menus ORDER BY parent_id, sort;