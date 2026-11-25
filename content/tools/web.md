+++
title = "web"
description = "fingerprinting, content discovery, parameters and the usual injection checks."
weight = 2
+++

Web apps are where most real-world findings live. The tools below find the surface; the findings themselves usually come from reading responses carefully in a proxy. Route everything through Burp (or ZAP) so you have history to go back to.

## fingerprinting

### curl
Headers tell you the server, framework, cookies and security headers before you've loaded a page.

```sh
curl -skI https://<target>
```

```sh
# follow redirects and show where you end up
curl -skL -o /dev/null -w '%{http_code} %{url_effective}\n' https://<target>
```

### whatweb
Identifies CMSs, frameworks, JS libraries and versions.

```sh
whatweb -a 3 https://<target>
```

> **trap**
>
> Version banners lie — sometimes on purpose, often because a proxy or CDN sits in front. Treat a version string as a lead to confirm, not a finding.

## content discovery

### ffuf
Fast and flexible fuzzer for paths, files, virtual hosts and parameters. `FUZZ` marks where wordlist entries go.

```sh
ffuf -u https://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -ac
```

```sh
# files with extensions
ffuf -u https://<target>/FUZZ -w raft-medium-files.txt -e .php,.bak,.old,.txt -ac
```

```sh
# virtual hosts — filter out the default response by size
ffuf -u https://<target> -H "Host: FUZZ.<domain>" -w subdomains.txt -fs <size>
```

### gobuster
A simpler alternative when you just want directories.

```sh
gobuster dir -u https://<target> -w <wordlist> -x php,txt -t 40
```

> **trap**
>
> - Many apps return `200` for everything (soft 404s). Without filtering, every word "exists". `-ac` auto-calibrates; otherwise filter by size (`-fs`), words (`-fw`) or lines (`-fl`).
> - Vhost fuzzing only works through the `Host` header — fuzzing DNS names in the URL tests DNS, not the web server.
> - Hammering with high thread counts gets you rate-limited or blocked by a WAF, and the blocked responses then look like "nothing found".

## parameters and requests

### finding hidden parameters

```sh
ffuf -u 'https://<target>/page?FUZZ=1' -w burp-parameter-names.txt -fs <size>
```

### replaying through Burp
Send command-line requests through the proxy so they land in your history.

```sh
curl -sk -x http://127.0.0.1:8080 https://<target>/api/endpoint
```

> **trap**
>
> Testing only `GET` parameters misses half the app. Check `POST` bodies, JSON fields, headers and cookies — and try the same endpoint with a different method.

## sql injection

### sqlmap
Automates detection and exploitation of SQL injection. Save the request from Burp to a file and give it that — it keeps cookies, headers and body exactly right.

```sh
sqlmap -r request.txt --batch
```

```sh
# once confirmed: list databases, then tables
sqlmap -r request.txt --batch --dbs
sqlmap -r request.txt --batch -D <db> --tables
```

> **trap**
>
> `--risk 3` adds `OR`-based payloads, which on an `UPDATE` or `DELETE` statement can modify every row in a table. On anything resembling production, keep the default risk and confirm by hand first.

## tls

### testssl.sh
Checks protocols, ciphers, certificate issues and known TLS vulnerabilities.

```sh
testssl.sh https://<target>
```

```sh
# quicker summary
sslscan <target>:443
```

> **trap**
>
> Weak-cipher findings are real but usually low severity. Don't let a long TLS section crowd the findings that matter out of the report.
