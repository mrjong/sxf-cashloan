

# 风控埋点excel生成文档

1. 第一步  生成json文件

   ```
   npm run risk-json
   ```

2. 第二步  生成excel文件

   ```
   npm run risk-excel
   ```

3. 替换json文件

   ```
   risk-bury-config.json 拷贝到 risk-bury-config-old.json 便于下次对比
   ```

说明：

为了保存每次操作，会自动生成每次执行的json

```
例如：risk-bury-config2020-01-14 20/17/22.json
```

