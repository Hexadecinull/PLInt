# Privacy Policy

This document describes what data PLInt itself collects and stores. If
you're using someone else's PLInt instance, this describes the software's
behavior - the operator of that specific instance is responsible for how
they run it, and may have their own policy on top of this one.

## Short version

PLInt stores almost everything in your own browser. The only data that
reaches the server is the code you actively choose to run, and the
occasional assembly-variant name you choose to submit. There's no account
system, no analytics, and no tracking.

## What's stored in your browser (local storage)

- **Saved files** you create in the file manager.
- **Settings**: theme, accent color, editor preferences, workspace
  preferences.
- **Secret menu state**: which language groups you've unlocked.
- **Your last-active language and unsaved buffer**, so refreshing the page
  doesn't lose your work.

None of this is sent anywhere unless you explicitly export/download it, or
run a language that requires server-side execution (in which case only the
code buffer for that run is sent - see below). Clearing your browser's
site data for this domain removes all of it, and there's no server-side
copy to recover it from.

## What's sent to the server

- **Code you run**, for any language whose execution happens server-side
  (see [ARCHITECTURE.md](ARCHITECTURE.md) for which languages those are).
  This is sent to run it and is not persisted afterward - each run happens
  in a fresh temporary directory that's deleted immediately after.
- **Assembly variant names** you submit via the "Don't see your Assembly?"
  form. These are appended to a server-side text file that only the
  instance operator can read from their own terminal - see
  [USAGE.md](USAGE.md) and [DEPLOY.md](DEPLOY.md). Submit only the name of
  the variant; don't include anything you wouldn't want the operator to
  read.

## What PLInt does *not* do

- No account creation, login, or user tracking of any kind.
- No analytics or telemetry (this fork removed the Lovable-platform
  telemetry hook that shipped in early prototypes of this project).
- No cookies used for tracking.
- No third-party ad networks.
- No sale or sharing of any data, because there isn't a backend database
  collecting it in the first place.

## Third-party requests

Browser-executed languages (Python, Lua, SQL, TypeScript, CoffeeScript,
Markdown) load their runtime from a public CDN (esm.sh / jsDelivr) the
first time you use that language in a session. That's a request to a
third-party CDN, not to any server operated by this project - see that
CDN's own privacy policy if this matters to you. No code you write is sent
to the CDN; only the runtime library itself is downloaded from it.

## Server logs

Standard web server / reverse proxy access logs (IP address, timestamp,
requested path) may exist at the infrastructure level depending on how a
given instance is deployed (e.g., nginx or Cloudflare logs). PLInt itself
doesn't add any additional logging of user activity beyond what
`scripts/deploy/webhook-server.js` logs for deploy triggers.

## Changes to this policy

If you fork or modify PLInt in ways that change this behavior (adding
analytics, an account system, etc.), please update this document
accordingly for your deployment.
