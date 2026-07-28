#!/usr/bin/env bash
# Installs interpreters/compilers for PLInt's server-executed languages.
#
# Every language degrades gracefully when its tool isn't installed (PLInt
# just tells you what to install), so you never have to run this whole
# script — install only what you'll actually use. It's split into tiers
# by disk/RAM cost since this is meant to run on modest hardware, not a
# build server.
#
# Usage:
#   bash scripts/install-interpreters.sh            # tier 1 only (default)
#   bash scripts/install-interpreters.sh --tier2     # tier 1 + 2
#   bash scripts/install-interpreters.sh --list      # show what's covered, don't install
set -euo pipefail

TIER2=false
LIST_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --tier2) TIER2=true ;;
    --list) LIST_ONLY=true ;;
  esac
done

# ---------------------------------------------------------------------------
# Tier 1 — small, fast, broadly useful. Roughly a few hundred MB combined.
# ---------------------------------------------------------------------------
TIER1_APT=(
  perl gawk make cmake            # scripting / build-script languages
  gcc g++ gfortran                # C, C++, Fortran
  wabt                            # WebAssembly Text (wat2wasm)
)

# ---------------------------------------------------------------------------
# Tier 2 — heavier or more niche. Each of these is roughly 100-500MB;
# install only the ones you actually plan to use. A JDK in particular is
# shared by Java, Kotlin, Groovy, Scala, and Clojure, so it's worth it if
# you want any of those.
# ---------------------------------------------------------------------------
TIER2_APT=(
  default-jdk                     # Java, and a dependency for Kotlin/Groovy/Scala/Clojure below
  r-base-core                     # R
  octave                          # MATLAB-compatible (octave-cli)
  fpc                             # Pascal
  gnat                            # Ada
  gnu-smalltalk                   # Smalltalk (gst)
  clisp                           # Common Lisp
  gnucobol4                       # COBOL (falls back to `gnucobol` on older repos)
  mono-mcs mono-runtime           # C# (mcs + mono)
  groovy                          # Groovy (needs default-jdk)
  elixir erlang                   # Elixir / Erlang
  ocaml                           # OCaml
  golang-go                       # Go
  nim                             # Nim
  clojure                         # Clojure (needs default-jdk)
)

# ---------------------------------------------------------------------------
# Not covered by apt at all — install manually only if you need them.
# These either need a vendor installer/curl script, or are too heavy/
# fragile for a general-purpose personal server by default.
# ---------------------------------------------------------------------------
MANUAL_NOTES="
  rust       -> https://rustup.rs (curl script; ~1-2GB with toolchain)
  swift      -> https://swift.org/install (large, official tarball)
  dart       -> https://dart.dev/get-dart
  crystal    -> https://crystal-lang.org/install
  zig        -> https://ziglang.org/download (single static binary, actually light)
  vlang      -> https://vlang.io (git clone + make, light)
  julia      -> https://julialang.org/downloads
  scala      -> via coursier/sdkman, needs a JDK
  kotlin     -> via sdkman, needs a JDK
  dotnet     -> apt install dotnet-sdk-8.0 (Microsoft's apt repo, ~500MB — for F#)
  gleam      -> https://gleam.run/getting-started
  llvm       -> apt install llvm (for LLVM IR / \`lli\` — quite large, several hundred MB)
  mono-devel -> apt install mono-devel (adds \`ilasm\` for CIL/MSIL, on top of mono-runtime above)
  jasmin     -> download jasmin.jar, set JASMIN_JAR in .env (see .env.example)
  mojo       -> https://www.modular.com/mojo (multi-GB toolchain — skip unless you really need it)
  gnustep    -> apt install gnustep-base-runtime gobjc (Objective-C / Objective-C++)
"

if $LIST_ONLY; then
  echo "Tier 1 (installed by default): ${TIER1_APT[*]}"
  echo
  echo "Tier 2 (--tier2 flag): ${TIER2_APT[*]}"
  echo
  echo "Manual / not via apt:$MANUAL_NOTES"
  exit 0
fi

echo "== Updating apt package lists =="
sudo apt-get update

echo "== Installing Tier 1 interpreters/compilers =="
sudo apt-get install -y "${TIER1_APT[@]}"

if $TIER2; then
  echo "== Installing Tier 2 interpreters/compilers =="
  sudo apt-get install -y "${TIER2_APT[@]}"
else
  echo
  echo "Skipped Tier 2 (heavier/more niche languages). Run with --tier2 to include them,"
  echo "or install individual packages later — see: bash $0 --list"
fi

echo
echo "Languages with no apt package (Rust, Swift, Dart, Julia, .NET, etc.) need a manual"
echo "install — run: bash $0 --list"
echo
echo "Done. PLInt picks up newly installed interpreters automatically — no restart needed"
echo "for the interpreter itself, though a PM2 restart doesn't hurt if something seems stale:"
echo "  pm2 restart plint"
