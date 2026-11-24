+++
title = "shells"
description = "catching shells and making them usable."
weight = 3
+++

## listeners

```sh
rlwrap -cAr nc -lvnp <port>
```

## tty upgrade

```sh
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

```sh
# then: ctrl+z
stty raw -echo; fg
```

```sh
export TERM=xterm-256color; stty rows <rows> cols <cols>
```
