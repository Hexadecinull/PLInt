# Terms of Service

These are template terms for anyone operating a PLInt instance. If you're
using someone else's instance, the operator may present their own terms - these are meant as a reasonable default, not a binding agreement from the
PLInt project itself (which doesn't operate a public instance).

## 1. What this is

PLInt is a code-execution playground. By using an instance, you agree to
use it responsibly and understand that you're running your own code on
someone else's server.

## 2. Acceptable use

Don't use a PLInt instance to:

- Run code intended to attack, disrupt, or gain unauthorized access to
  the host server, other systems, or third parties (malware, exploits,
  denial-of-service attempts, port scanning, cryptomining without the
  operator's permission, etc.).
- Attempt to break out of, disable, or circumvent the execution
  sandboxing described in [SECURITY.md](SECURITY.md).
- Store, transmit, or process illegal content.
- Abuse the "submit an assembly variant" feature to submit spam, abuse, or
  anything other than a genuine assembly-language name.
- Consume resources at a scale that degrades the service for others,
  intentionally or through obvious negligence (e.g., knowingly running
  fork bombs or infinite-output loops after being asked to stop).

## 3. No warranty

PLInt is provided "as is," without warranty of any kind. Code execution
results, especially for the esoteric and assembly-language interpreters
described in [ARCHITECTURE.md](ARCHITECTURE.md), are provided on a
best-effort basis and are **not** guaranteed to exactly match every edge
case of a language's formal specification. Don't rely on this tool for
anything safety-critical, and don't treat its output as authoritative for
languages explicitly documented as "best-effort" in
[USAGE.md](USAGE.md#esoteric-and-assembly-languages--what-to-expect).

## 4. No guarantee of availability

A personal or hobby PLInt instance may go offline, be rate-limited, or be
taken down at any time, for any reason, without notice. Files stored in
your browser's local storage aren't affected by server downtime, but
anything requiring server-side execution won't work while the server is
down.

## 5. Data

See [PRIVACY.md](PRIVACY.md) for what data is collected and stored. In
short: almost everything lives in your browser, and code you run
server-side isn't retained after the run completes.

## 6. Liability

The operator of a PLInt instance, and the PLInt project itself, are not
liable for any damages arising from use of the software, including but not
limited to data loss (e.g., clearing browser storage), service
interruption, or reliance on execution results.

## 7. Changes

An operator may update these terms at any time by editing this document in
their deployment. Continued use of an instance after changes constitutes
acceptance of the updated terms.

## 8. License

PLInt itself is open-source software licensed under AGPL-3.0 - see
[LICENSE](../LICENSE). These terms govern *use of a running instance*, not
your rights to the underlying source code, which are governed by the
license.

The AGPL's defining term (section 13) applies here specifically because
PLInt is network server software: if an operator modifies PLInt and lets
people use the modified version over a network, that operator must offer
those users the modified source code. Unmodified use of the stock project
doesn't trigger any extra obligation beyond what the license already
requires for any GPL-family license.
