<!--
 * @Author: shawn
 * @LastEditTime: 2020-01-14 20:33:29
 -->


# 神策埋点excel生成文档

1. 第一步  生成json文件

   ```
   npm run shence-json
   ```

2. 第二步  生成excel文件

   ```
   npm run shence-excel
   ```

3. 替换json文件

   ```
   shence-bury-config.json 拷贝到 shence-bury-config-old.json 便于下次对比
   ```

说明：

为了保存每次操作，会自动生成每次执行的json

```
例如：shence-bury-config2020-01-14 20/17/22.json
```

