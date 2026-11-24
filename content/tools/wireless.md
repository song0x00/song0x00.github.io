+++
title = "wireless"
description = "802.11 recon and capture."
weight = 5
+++

## interface setup

```sh
sudo airmon-ng check kill && sudo airmon-ng start <iface>
```

```sh
iw dev <iface> info
```

## recon

```sh
sudo airodump-ng <mon-iface> --band abg -w recon
```

```sh
sudo airodump-ng <mon-iface> -c <channel> --bssid <bssid> -w capture
```

## handshakes

```sh
sudo hcxdumptool -i <mon-iface> -w dump.pcapng
```

```sh
hcxpcapngtool -o hash.hc22000 dump.pcapng
```

```sh
hashcat -m 22000 hash.hc22000 <wordlist>
```
