# Security Policy

## Reporting a vulnerability

If you find a security issue in PLInt itself (not in a specific
self-hosted instance someone else runs), please open a private report via
GitHub's "Report a vulnerability" button on the repository's Security tab,
rather than a public issue. If that's not available, open an issue with
minimal detail asking for a private contact channel.

Please include:

- What you found and why it's a security issue.
- Steps to reproduce.
- The version/commit you tested against.

There's no bug bounty - this is a hobby/personal project - but reports are
taken seriously and credited in release notes unless you'd rather stay
anonymous.

## The execution-sandboxing model, and what it means for you

PLInt runs arbitrary user-submitted code. That's the entire point of the
app, and it comes with real security implications you should understand
before exposing an instance to anyone you don't trust.

### What protection exists

Every server-side execution (see [ARCHITECTURE.md](ARCHITECTURE.md)):

- Runs in a freshly created, isolated temp directory that's deleted
  afterward.
- Is run under `nice` (low CPU priority) with a `ulimit -v` memory ceiling.
- Has a hard timeout, after which it's forcibly killed.
- Has output size capped, so runaway output can't exhaust memory.

### What protection does *not* exist

This is **process-level resource limiting**, not a hardened sandbox. There
is no:

- Container or VM isolation
- Filesystem restriction beyond normal OS file permissions
- Network namespace isolation (code can make outbound network requests)
- seccomp / syscall filtering

In practice: code executed through PLInt runs as whatever OS user the
Node process runs as, with that user's permissions. It is **not** safe to
expose a PLInt instance to the general public / untrusted strangers without
adding real sandboxing (containers, gVisor, Firecracker, or similar) in
front of the execution backend.

### Recommendations if you self-host

- **Run PLInt as a dedicated, unprivileged system user** - never as root,
  and ideally not as your everyday login user. `ecosystem.config.cjs`
  doesn't set a user for you; configure that at the OS/systemd level if
  you want PM2 itself to run under a restricted account.
- **Treat it like you'd treat SSH access** - only give the URL to people
  you'd trust with a shell on the box, unless you've added your own
  container-level sandboxing on top.
- **Keep the server patched.** This is a general Linux server, not a
  black box - normal `apt upgrade` hygiene applies.
- **The GitHub webhook secret is a real credential.** Treat
  `GITHUB_WEBHOOK_SECRET` like a password; anyone who has it (and access to
  your webhook endpoint) can trigger a redeploy from an arbitrary commit on
  your configured branch.
- **`assembly-submissions.txt`** is plain, unauthenticated user input
  written to disk. It's never executed or rendered back to any user, but
  treat its contents as untrusted text if you ever script something around
  it.

## Dependency updates

The lint CI workflow doesn't currently include automated dependency
vulnerability scanning. If you'd like to add Dependabot or a similar tool,
pull requests are welcome - see [CONTRIBUTING.md](CONTRIBUTING.md).
