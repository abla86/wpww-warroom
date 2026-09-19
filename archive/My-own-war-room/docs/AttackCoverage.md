# WPWW WarRoom — Attack Coverage

## Purpose

The attack simulator uses a unified catalog so that network, web, authentication, automated-abuse, DDoS/DoS, vulnerability, ransomware, supply-chain, ICS/OT and AI-agent threats can be exercised through the same defensive simulation interface.

The catalog is **simulation-only** for the new coverage packs: the added OAT/AI/TIP/MCP entries use inert synthetic markers rather than executable exploit instructions.

## Coverage added

### OWASP Automated Threats to Web Applications

All 21 OWASP Automated Threat (OAT) identifiers are represented:

- OAT-001 Carding
- OAT-002 Token Cracking
- OAT-003 Cost-Inflation Fraud
- OAT-004 Fingerprinting
- OAT-005 Scalping
- OAT-006 Expediting
- OAT-007 Credential Cracking / Brute Force
- OAT-008 Credential Stuffing
- OAT-009 CAPTCHA Defeat
- OAT-010 Card Cracking
- OAT-011 Scraping
- OAT-012 Cashing Out
- OAT-013 Sniping
- OAT-014 Vulnerability Scanning
- OAT-015 Denial of Service
- OAT-016 Skewing
- OAT-017 Spamming
- OAT-018 Footprinting
- OAT-019 Account Creation
- OAT-020 Account Aggregation
- OAT-021 Denial of Inventory

### AI / LLM / agent security

The catalog also covers the OWASP 2025 LLM Top 10 classes:

- LLM01 Prompt Injection — direct and indirect
- LLM02 Sensitive Information Disclosure
- LLM03 Supply Chain
- LLM04 Data and Model Poisoning
- LLM05 Improper Output Handling
- LLM06 Excessive Agency
- LLM07 System Prompt Leakage
- LLM08 Vector and Embedding Weaknesses
- LLM09 Misinformation
- LLM10 Unbounded Consumption

Additional AI-agent coverage:

- Task-in-Prompt (TIP) attack
- MCP Tool Poisoning
- MCP Rug Pull / Tool Definition Drift

### Existing WarRoom coverage retained

The original catalog remains available, including:

- reconnaissance and footprinting
- SQL injection and XSS
- RCE and command/control
- zero-day/high-entropy simulation
- classic DoS
- TCP SYN, UDP amplification, Slowloris, HTTP flood, botnet and ICMP DDoS
- Log4Shell, EternalBlue, WannaCry/LockBit, Heartbleed
- supply-chain compromise
- Spring4Shell, ZeroLogon, Shellshock
- JWT authentication bypass
- BOLA/IDOR and GraphQL abuse
- ICS/SCADA
- DNS cache poisoning
- local privilege escalation
- SSRF
- package typosquatting
- Kerberoasting / Pass-the-Hash
- C2 beaconing

## Defensive mapping

Each vector can carry:

- OWASP classification
- MITRE ATT&CK / ATLAS mapping where applicable
- protocol or attack surface
- risk level
- defensive countermeasure
- recommended mitigation
- safe simulation marker
- optional references

The UI exposes the new automated-abuse and AI/TIP/MCP groups as filters in the Attack Simulator.

## Source basis

- OWASP Automated Threats to Web Applications
- OWASP Top 10:2025
- OWASP GenAI LLM Top 10:2025
- OWASP MCP Security guidance
- MITRE ATT&CK / ATT&CK for Enterprise
- MITRE ATLAS for AI/ML threats
- Task-in-Prompt (TIP), ACL 2025

The catalog is a defensive test taxonomy, not a claim that every possible attack or every CVE in existence is enumerated.
