+++
title = "enumeration"
description = "first look at a host or range — what's alive, what's listening, what it'll tell you for free."
weight = 1
+++

Enumeration is most of the job. Everything later depends on how complete this picture is, so be slow and thorough here rather than fast and sorry later. Keep every scan's output (`-oA`) — you'll want it for the report.

## host discovery

### nmap ping sweep
Finds live hosts across a range without port scanning them.

```sh
nmap -sn 10.0.0.0/24 -oA sweep
```

```sh
# list just the live IPs
grep Up sweep.gnmap | cut -d' ' -f2
```

### arp-scan
On the local segment, ARP is the most reliable discovery there is — hosts can drop ICMP, but they can't ignore ARP and still talk on the network.

```sh
sudo arp-scan -l
```

> **trap**
>
> "Host seems down" usually means "host drops ping". If something should be there, scan it anyway with `-Pn` (skip discovery). Equally, a sweep only proves a host answered *that* probe — it isn't a complete inventory.

## ports and services

### nmap
The two-pass approach: a fast sweep of all 65,535 TCP ports, then a slower, detailed scan of only the ones that answered.

```sh
# pass 1: every TCP port, quickly
nmap -p- --min-rate 2000 -oA full <target>
```

```sh
# pull the open ports out as a comma list
ports=$(grep -oP '\d+(?=/open)' full.gnmap | sort -un | paste -sd,)
```

```sh
# pass 2: versions + default scripts on just those
nmap -sC -sV -p "$ports" -oA svc <target>
```

```sh
# UDP is slow — start with the top ports
sudo nmap -sU --top-ports 50 --open <target>
```

> **trap**
>
> - Without `-p-`, nmap only scans the **top 1,000** ports. Plenty of interesting services live elsewhere.
> - A high `--min-rate` on a lossy link or through a firewall drops probes, and dropped probes look like closed ports. If results look thin, rerun slower.
> - `-sC` isn't passive — default scripts make real requests, and a few try default logins. Fine in scope, not something to point at a range you haven't confirmed.
> - UDP results are often `open|filtered`, which just means "no reply". Confirm with a service-specific tool before writing it up.

## smb

### netexec (nxc)
The successor to CrackMapExec. One command gives you OS, hostname, domain and whether SMB signing is enforced — across a whole range.

```sh
nxc smb 10.0.0.0/24
```

```sh
# anonymous and guest share listing
nxc smb <target> -u '' -p '' --shares
nxc smb <target> -u guest -p '' --shares
```

```sh
# check the lockout policy BEFORE trying any passwords
nxc smb <target> -u <user> -p '<pass>' --pass-pol
```

### smbclient
For browsing and pulling files once you know a share is readable.

```sh
smbclient -N -L //<target>
```

```sh
smbclient -N //<target>/<share>
# inside: recurse on; prompt off; mget *
```

> **trap**
>
> Null sessions (`-u '' -p ''`) and guest access are different things — a box can refuse one and allow the other, so try both. And never spray passwords until you know the lockout threshold; locking out half a domain is a very memorable way to end an engagement.

## dns

### dig
Zone transfers are rarely allowed now, but when they are, they hand you the whole map.

```sh
# find the authoritative name servers first
dig ns <domain> +short
```

```sh
# then ask each one for a transfer
dig axfr @<ns-server> <domain>
```

### subfinder
Passive subdomain discovery from public sources — it never touches the target.

```sh
subfinder -d <domain> -silent -o subs.txt
```

> **trap**
>
> AXFR has to go to an **authoritative** server for the zone. Asking your local resolver will always fail, and that tells you nothing about whether the zone is exposed.

## snmp

### snmpwalk
SNMP with a default community string can leak interfaces, running processes, installed software and sometimes usernames.

```sh
snmpwalk -v2c -c public <target>
```

```sh
# try a list of community strings quickly
onesixtyone -c communities.txt <target>
```

> **trap**
>
> SNMP is UDP/161, so a TCP-only scan won't show it. SNMPv3 needs real credentials — no response to `public` on v3 doesn't mean v1/v2c are locked down too.
