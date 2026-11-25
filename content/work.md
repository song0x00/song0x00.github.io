+++
title = "work"
template = "work.html"
description = "research, experience and toolkit — wireless security, offensive tooling and the lab they run in."

[extra]
# the three tiles at the top: [label, value]
status = [
  ["focus", "wireless"],
  ["researching", "WPA3 transition"],
  ["studying", "Sec+ · CEH"],
]
# show "selected writing" from posts with `featured = true` under [extra]; falls back to the latest posts
featured_fallback = 3

# toolkit chips — [group, [items]], shown in this order
toolkit = [
  ["wireless",   ["802.11", "WPA2 / WPA3", "hcxtools", "Aircrack-ng", "Hashcat", "Wireshark"]],
  ["offensive",  ["Nmap", "Metasploit", "Burp Suite", "Gobuster", "Hydra", "Netcat"]],
  ["techniques", ["wireless assessment", "enumeration", "OSINT", "privilege escalation", "vulnerability assessment", "log analysis"]],
  ["languages",  ["Python", "Bash", "Rust", "C / C++"]],
  ["data & cloud", ["AWS Lambda", "AWS Glue", "S3", "Athena", "ingestion pipelines", "web scraping", "LLM tooling", "SQL"]],
  ["systems",    ["Linux (NixOS, Arch, Debian)", "Proxmox", "Git", "SSH", "systemd", "tmux"]],
]
+++

Security researcher working mostly on my own projects, with a focus on wireless protocols — where 802.11 authentication breaks down, and how practical those breaks are outside a paper. I write tooling in Python, Bash and Rust, and run a multi-machine lab for testing it.

## research

### WPA3 transition-mode vulnerabilities
*independent research · in progress · aiming for publication*

Continuing my dissertation work on networks running WPA2 and WPA3 side by side. Looking at downgrade paths and authentication weaknesses that exist only during coexistence, and demonstrating them practically in an isolated lab with hcxtools, Hashcat, Aircrack-ng and Wireshark.

### wireless network vulnerabilities
*dissertation · BSc (Hons) Digital Technologies*

An analysis of weaknesses in WPA2 and WPA3 transition mode, with practical exploitation demonstrated end to end.

### the lab
*ongoing*

A multi-machine Linux environment — desktop, laptop, a Proxmox server and throwaway VMs — declared in NixOS so it can be rebuilt from scratch. Used for isolated vulnerability research and tool testing; it also hosts some of this site's services.

## experience

### data engineer
*contract · current*

- Design and build serverless data ingestion pipelines on AWS (Lambda, Glue, S3, Athena)
- Built large-scale, AI-powered web scrapers in Python, deployed on Lambda
- Integrate AI-driven tooling and workflows into the pipeline

### IT security intern
*previous*

- Built and maintained Python and Bash tooling for internal IT and security workflows
- Wrote technical security documentation: specifications, policy write-ups and internal reference material
- First-line IT support across hardware, software and connectivity

### administration & data
*previous*

- Managed and analysed large datasets for CRM updates and reporting, including material presented at national level
- Configured and administered a CRM system and large-scale email distribution

## education

### BSc (Hons) Digital Technologies
*graduated*

Modules including security and countermeasures, operating systems and platforms, and databases. Dissertation on wireless network vulnerabilities (above).

### certifications
*in progress*

- CompTIA Security+ — exam pending
- Certified Ethical Hacker (CEH) — studying
