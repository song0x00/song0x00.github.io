+++
title = "web"
description = "content discovery and quick checks."
weight = 2
+++

## content discovery

```sh
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -mc all -fc 404
```

```sh
ffuf -u http://<target> -H "Host: FUZZ.<domain>" -w subdomains.txt -fs <size>
```

## fingerprinting

```sh
whatweb -a 3 http://<target>
```

```sh
curl -skI https://<target>
```
