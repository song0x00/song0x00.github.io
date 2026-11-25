+++
title = "passwords"
description = "identifying hashes, cracking them offline, and testing logins without locking anyone out."
weight = 4
+++

Offline cracking is quiet and limited only by your hardware and wordlists. Online guessing is loud, slow and can lock real users out of their accounts. Prefer offline whenever you have a hash, and treat every online attempt as something that might page someone.

## identifying hashes

### name-that-hash / hashid
Suggest what a hash probably is, along with the hashcat mode to use.

```sh
nth --text '<hash>'
```

```sh
hashid -m '<hash>'
```

```sh
# compare against hashcat's own example for a mode
hashcat -m 1000 --example-hashes
```

> **trap**
>
> Identification is a guess from length and character set — an unsalted MD5 and an NTLM hash look identical. Use context: hashes from a Windows SAM are NTLM, whatever the tool's first guess says.

## hashcat

### wordlist + rules
The workhorse. Rules mutate each word (capitalise, add digits, swap letters), which finds far more than the raw list.

```sh
hashcat -m <mode> hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule
```

### masks
Brute force with structure. `?l` lowercase, `?u` uppercase, `?d` digit, `?s` symbol.

```sh
# e.g. 8-digit numeric WPA passphrases
hashcat -m 22000 hash.hc22000 -a 3 '?d?d?d?d?d?d?d?d'
```

```sh
# show what's already cracked
hashcat -m <mode> hashes.txt --show
```

```sh
# long jobs: name the session so you can resume it
hashcat -m <mode> hashes.txt rockyou.txt --session job1
hashcat --session job1 --restore
```

### common modes

```sh
# 0 MD5 · 100 SHA1 · 1000 NTLM · 5600 NetNTLMv2
# 1800 sha512crypt · 3200 bcrypt · 13100 Kerberos TGS · 22000 WPA
hashcat --help | grep -i '<name>'
```

> **trap**
>
> - Hashcat skips anything already in its **potfile**, so a rerun can "finish" instantly with nothing new. Use `--show` to see earlier results.
> - `-O` (optimised kernels) is much faster but caps password length, often at 31 characters. Leave it off for long passphrases.
> - NTLM (`1000`) and NetNTLMv2 (`5600`) are different things. NetNTLMv2 is a challenge-response captured off the wire; it can't be passed like an NTLM hash.
> - bcrypt and sha512crypt are deliberately slow. Don't plan an engagement around brute-forcing them.

## john the ripper

### *2john
Extracts crackable hashes from protected files.

```sh
zip2john archive.zip > zip.hash
ssh2john id_rsa > ssh.hash
keepass2john vault.kdbx > kp.hash
```

```sh
john --wordlist=rockyou.txt zip.hash
john --show zip.hash
```

> **trap**
>
> The `*2john` output often includes a filename prefix (`archive.zip:$zip2$...`). John expects that; hashcat doesn't. Strip it (or use `--username`) before handing the hash to hashcat.

## wordlists

### cewl
Builds a wordlist from the target's own website — product names, team names, jargon.

```sh
cewl -d 2 -m 6 -w site-words.txt https://<target>
```

> **trap**
>
> rockyou is a 2009 consumer leak. Corporate passwords look more like `Company2026!` or `Summer2026`. A short custom list plus good rules usually beats a huge generic one.

## online guessing

### hydra

```sh
hydra -L users.txt -P passwords.txt ssh://<target> -t 4
```

### netexec password spray
One password against many users — stays under per-account lockout thresholds.

```sh
nxc smb <target> -u users.txt -p '<password>' --continue-on-success
```

> **trap**
>
> - **Get the lockout policy first** (`nxc smb <target> -u <user> -p '<pass>' --pass-pol`, using any valid account), then stay well under it, and leave time for the counter to reset between rounds.
> - SSH servers often limit concurrent attempts; more than `-t 4` mostly produces errors that look like failed logins.
> - Every attempt is logged. Agree beforehand whether online guessing is in scope at all.
