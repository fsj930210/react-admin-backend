/**
 * 业务错误码
 */
export enum ERROR_CODE_ENUM {
  // 通用异常
  ERROR_CODE_1000000000 = '系统内部异常',

  // 用户相关 1
  ERROR_CODE_1000000001 = '用户已存在',
  ERROR_CODE_1000000002 = '用户不存在',
  ERROR_CODE_1000000003 = '用户名密码不正确',

  // token 相关
  ERROR_CODE_1000000004 = 'token不能为空',
  ERROR_CODE_1000000005 = '无效的token',

  // 组织相关2
  ERROR_CODE_2000000000 = '组织已存在',
  ERROR_CODE_2000000001 = '不能创建根组织',
  ERROR_CODE_2000000002 = '不能删除根组织',
  ERROR_CODE_2000000003 = '当前节点下还有子节点，不能删除',
  ERROR_CODE_2000000004 = '当前节点下还有用户，不能删除',
  ERROR_CODE_2000000005 = '组织不存在',
  ERROR_CODE_2000000006 = '组织节点不能为空',

  // 角色相关
  ERROR_CODE_3000000000 = '角色已存在',
}
