# Shadin K V — Hacker-Themed Cybersecurity Portfolio

A custom, dependency-free cybersecurity portfolio built for **Shadin K V**.

## Highlights

- hacker / SOC-console visual language without using a generic template
- animated boot sequence
- subtle Matrix-style background
- responsive glitch hero section
- project cards for VAPT, AppSec/DevSecOps, SOC/cloud and detection engineering work
- capability matrix without fake percentage bars
- experience + education timeline
- fully interactive terminal at the bottom of the site
- terminal command history, autocomplete and keyboard shortcuts
- contact/social information exposed through terminal commands such as `contact`, `socials`, `github`, `linkedin`, `tryhackme` and `email`
- zero JavaScript frameworks or build step
- deploys directly to GitHub Pages

## Terminal commands

```text
help
about
whoami
skills
projects
contact
socials
education
experience
github
linkedin
tryhackme
email
resume
banner
clear
open github
open linkedin
```

Keyboard features:

```text
Up / Down   command history
Tab         command autocomplete
Ctrl + L    clear terminal
```

## Run locally

You can open `index.html` directly, or serve the directory locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

The included workflow deploys the static site from the repository root using GitHub Pages.

In GitHub:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions**.
3. Push to `main`.

## Main project references

- [VAPTForge](https://github.com/simplyy-shadin/vaptforge)
- [SecureFlow DevSecOps](https://github.com/simplyy-shadin/secureflow-devsecops)
- [Cloud SOC on AWS](https://github.com/simplyy-shadin/cloud-soc-on-aws)
- [File Integrity + Jira Automation](https://github.com/simplyy-shadin/file-integrity-jira-automation)
- [Network Packet Visualizer](https://github.com/simplyy-shadin/network-packet-visualizer)

## Customize

- `index.html` — content and project cards
- `styles.css` — visual system and responsive behavior
- `script.js` — boot animation, Matrix effect and terminal commands

The `resume` terminal command intentionally contains a placeholder message until final CV PDFs are published in the repository.
