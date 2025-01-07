# 虚拟机 CentOS7 配置网络 ​

## 1.查看本机（Windows）IP 信息

```bash
cmd
ipconfig/all
```

![virtual-machine-network-1](https://zhang.beer/static/images/virtual-machine-network-1.png)
找到这四项

## 2.配置虚拟机（CentOS7）IP

```bash
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

![virtual-machine-network-2](https://zhang.beer/static/images/virtual-machine-network-2.png)

将红框部分注释，添加绿框内容，其中绿框中内容与第 1 步中信息同步，

IPADDR 填写 IPv4 地址同网段内任意 IP。

NETMASK 对应子网掩码。

GATEWAY 对应默认网关。

DNS 对应 DNS 服务器，有几个写几个。

## 3.重启

```bash
systemctl restart network
```

4.检查

```bash
ip addr
```

![virtual-machine-network-3](https://zhang.beer/static/images/virtual-machine-network-3.png)

​
