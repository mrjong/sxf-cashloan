###
# @Author: sunjiankun
 # @LastEditors: Please set LastEditors
 # @LastEditTime: 2020-02-24 13:01:01
 ###
#!/usr/bin/env bash

remote_path=/home/app/nginx/html
remote_path2=/home/app/nginx/html/www
remote_user=app
remote_ip=172.16.175.23

tar czvf dist.tar ./*
echo -e "\033[41;37m 请输入远程服务器密码开始上传文件 \033[0m"
sftp ${remote_user}@${remote_ip}<<EOF
  put -r dist.tar ${remote_path}
  quit
EOF
echo '文件上传成功'

echo -e "\033[41;37m 请输入远程服务器密码开始部署项目 \033[0m"
ssh -t ${remote_user}@${remote_ip} << EOF
      cd ${remote_path}
      tar zxvf dist.tar -C ${remote_path2}
exit
EOF


echo '部署完成'

