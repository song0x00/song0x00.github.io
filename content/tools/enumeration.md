+++
title = "enumeration"
description = "first look at a host or range."
weight = 1
+++

## ports and services

```sh
nmap -p- --min-rate 2000 -oA full <target>
```

```sh
nmap -sC -sV -p <ports> -oA svc <target>
```

```sh
sudo nmap -sU --top-ports 50 <target>
```

## smb and shares

```sh
nxc smb <target> -u '' -p '' --shares
```

```sh
smbclient -N -L //<target>
```

## dns

```sh
dig axfr @<dns-server> <domain>
```
