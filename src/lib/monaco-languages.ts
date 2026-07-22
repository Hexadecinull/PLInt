// Register Monarch tokenizers for languages Monaco doesn't ship out of the box:
// Haxe, Zig, Nim, Nix, Brainfuck, LOLCODE, Shakespeare, Malbolge, Smali, Svelte.
// Registration is idempotent — called from EditorPane's beforeMount hook.

type Monaco = typeof import("monaco-editor");

let registered = false;

export function registerCustomLanguages(monaco: Monaco) {
  if (registered) return;
  registered = true;

  const langs = monaco.languages.getLanguages().map((l) => l.id);
  const has = (id: string) => langs.includes(id);

  if (!has("haxe")) {
    monaco.languages.register({ id: "haxe" });
    monaco.languages.setMonarchTokensProvider("haxe", {
      defaultToken: "",
      keywords: [
        "abstract","break","case","cast","catch","class","continue","default","do","dynamic",
        "else","enum","extends","extern","false","final","for","function","if","implements",
        "import","in","inline","interface","macro","new","null","operator","overload","override",
        "package","private","public","return","static","super","switch","this","throw","true",
        "try","typedef","untyped","using","var","while",
      ],
      tokenizer: {
        root: [
          [/\/\/.*$/, "comment"],
          [/\/\*/, "comment", "@comment"],
          [/'([^'\\]|\\.)*'/, "string"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/\b\d+(\.\d+)?\b/, "number"],
          [/[A-Z][\w$]*/, "type"],
          [/[a-z_$][\w$]*/, {
            cases: { "@keywords": "keyword", "@default": "identifier" },
          }],
          [/[{}()\[\]]/, "@brackets"],
          [/[<>=!+\-*/%&|^~?:.]+/, "operator"],
        ],
        comment: [
          [/[^*/]+/, "comment"],
          [/\*\//, "comment", "@pop"],
          [/./, "comment"],
        ],
      },
    });
  }

  if (!has("zig")) {
    monaco.languages.register({ id: "zig" });
    monaco.languages.setMonarchTokensProvider("zig", {
      defaultToken: "",
      keywords: [
        "align","allowzero","and","anyframe","anytype","asm","async","await","break","catch",
        "comptime","const","continue","defer","else","enum","errdefer","error","export","extern",
        "fn","for","if","inline","noalias","or","orelse","packed","pub","resume","return",
        "linksection","struct","suspend","switch","test","threadlocal","try","undefined",
        "union","unreachable","usingnamespace","var","volatile","while",
      ],
      typeKeywords: [
        "bool","void","noreturn","type","anyerror","comptime_int","comptime_float",
        "u8","u16","u32","u64","u128","usize","i8","i16","i32","i64","i128","isize",
        "f16","f32","f64","f128",
      ],
      tokenizer: {
        root: [
          [/\/\/.*$/, "comment"],
          [/\\\\.*$/, "string"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/'([^'\\]|\\.)*'/, "string"],
          [/@[a-zA-Z_][\w]*/, "keyword.directive"],
          [/\b\d[\d_]*(\.\d[\d_]*)?\b/, "number"],
          [/[a-zA-Z_][\w]*/, {
            cases: { "@keywords": "keyword", "@typeKeywords": "type", "@default": "identifier" },
          }],
          [/[{}()\[\]]/, "@brackets"],
          [/[<>=!+\-*/%&|^~?:.]+/, "operator"],
        ],
      },
    });
  }

  if (!has("nim")) {
    monaco.languages.register({ id: "nim" });
    monaco.languages.setMonarchTokensProvider("nim", {
      defaultToken: "",
      keywords: [
        "addr","and","as","asm","bind","block","break","case","cast","concept","const","continue",
        "converter","defer","discard","distinct","div","do","elif","else","end","enum","except",
        "export","finally","for","from","func","if","import","in","include","interface","is","isnot",
        "iterator","let","macro","method","mixin","mod","nil","not","notin","object","of","or","out",
        "proc","ptr","raise","ref","return","shl","shr","static","template","try","tuple","type",
        "using","var","when","while","xor","yield","echo",
      ],
      tokenizer: {
        root: [
          [/#.*$/, "comment"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/'([^'\\]|\\.)*'/, "string"],
          [/\b\d+(\.\d+)?\b/, "number"],
          [/[a-zA-Z_][\w]*/, {
            cases: { "@keywords": "keyword", "@default": "identifier" },
          }],
          [/[{}()\[\]]/, "@brackets"],
          [/[<>=!+\-*/%&|^~?:.]+/, "operator"],
        ],
      },
    });
  }

  if (!has("nix")) {
    monaco.languages.register({ id: "nix" });
    monaco.languages.setMonarchTokensProvider("nix", {
      defaultToken: "",
      keywords: [
        "if","then","else","assert","with","let","in","rec","inherit","or","true","false","null",
      ],
      tokenizer: {
        root: [
          [/#.*$/, "comment"],
          [/\/\*/, "comment", "@comment"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/''/, "string", "@mstr"],
          [/\b\d+(\.\d+)?\b/, "number"],
          [/[a-zA-Z_][\w'-]*/, {
            cases: { "@keywords": "keyword", "@default": "identifier" },
          }],
          [/[{}()\[\]]/, "@brackets"],
          [/[=:;,.]/, "delimiter"],
          [/[<>+\-*/!?&|]+/, "operator"],
        ],
        comment: [
          [/[^*/]+/, "comment"],
          [/\*\//, "comment", "@pop"],
          [/./, "comment"],
        ],
        mstr: [
          [/[^']+/, "string"],
          [/''/, "string", "@pop"],
          [/'/, "string"],
        ],
      },
    });
  }

  if (!has("brainfuck")) {
    monaco.languages.register({ id: "brainfuck" });
    monaco.languages.setMonarchTokensProvider("brainfuck", {
      defaultToken: "comment",
      tokenizer: {
        root: [
          [/[+\-]/, "number"],
          [/[<>]/, "type"],
          [/[.,]/, "string"],
          [/[\[\]]/, "keyword"],
        ],
      },
    });
  }

  if (!has("lolcode")) {
    monaco.languages.register({ id: "lolcode" });
    monaco.languages.setMonarchTokensProvider("lolcode", {
      defaultToken: "",
      ignoreCase: false,
      keywords: [
        "HAI","KTHXBYE","I","HAS","A","ITZ","VISIBLE","GIMMEH","BTW","OBTW","TLDR",
        "IM","IN","YR","LOOP","OUTTA","UPPIN","NERFIN","WILE","TIL","BOTH","SAEM",
        "SMALLR","OF","BIGGR","AN","MKAY","O","RLY","YA","NO","WAI","OIC","SUM","DIFF",
        "PRODUKT","QUOSHUNT","MOD","HOW","IZ","IF","U","SAY","SO","FOUND","GTFO","MEBBE",
      ],
      tokenizer: {
        root: [
          [/BTW.*$/, "comment"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/\b\d+\b/, "number"],
          [/[A-Z][A-Z0-9?]*/, {
            cases: { "@keywords": "keyword", "@default": "type" },
          }],
          [/[a-zA-Z_][\w]*/, "identifier"],
        ],
      },
    });
  }

  if (!has("shakespeare")) {
    monaco.languages.register({ id: "shakespeare" });
    monaco.languages.setMonarchTokensProvider("shakespeare", {
      defaultToken: "",
      tokenizer: {
        root: [
          [/\[.*?\]/, "comment"],
          [/Act\s+[IVX]+.*$/, "keyword"],
          [/Scene\s+[IVX]+.*$/, "keyword"],
          [/^[A-Z][a-z]+:/, "type"],
          [/[.!?]/, "delimiter"],
        ],
      },
    });
  }

  if (!has("malbolge")) {
    monaco.languages.register({ id: "malbolge" });
    monaco.languages.setMonarchTokensProvider("malbolge", {
      defaultToken: "string",
      tokenizer: { root: [[/\s+/, "white"]] },
    });
  }

  if (!has("smali")) {
    monaco.languages.register({ id: "smali" });
    monaco.languages.setMonarchTokensProvider("smali", {
      defaultToken: "",
      keywords: [
        ".class",".super",".implements",".source",".field",".method",".end",".registers",
        ".locals",".param",".line",".annotation",".subannotation",".enum",".array-data",
        ".packed-switch",".sparse-switch","public","private","protected","static","final",
        "abstract","synthetic","volatile","interface","native","synchronized","bridge",
        "constructor","varargs","transient","void","return","return-void","move","move-result",
        "move-exception","goto","invoke-virtual","invoke-static","invoke-direct","invoke-super",
        "invoke-interface","if-eq","if-ne","if-lt","if-ge","if-gt","if-le","if-eqz","if-nez",
        "if-ltz","if-gez","if-gtz","if-lez","const","const-string","const-class","new-instance",
        "new-array","sget","sput","iget","iput","aget","aput","add-int","sub-int","mul-int",
        "div-int",
      ],
      tokenizer: {
        root: [
          [/#.*$/, "comment"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/L[\w/$]+;/, "type"],
          [/[vp]\d+/, "variable"],
          [/[.a-zA-Z_-]+/, {
            cases: { "@keywords": "keyword", "@default": "identifier" },
          }],
          [/\b0x[0-9a-fA-F]+\b|\b\d+\b/, "number"],
          [/[{}(),:;]/, "delimiter"],
        ],
      },
    });
  }

  if (!has("svelte")) {
    monaco.languages.register({ id: "svelte" });
    // Reuse HTML tokenizer as a best-effort baseline.
    monaco.languages.setMonarchTokensProvider("svelte", {
      defaultToken: "",
      tokenizer: {
        root: [
          [/<!--/, "comment", "@comment"],
          [/<script/, "keyword", "@script"],
          [/<style/, "keyword", "@style"],
          [/<\/?[a-zA-Z][\w-]*/, "type"],
          [/\{[#/:@][a-z]+/, "keyword"],
          [/[{}]/, "delimiter.bracket"],
          [/"([^"\\]|\\.)*"/, "string"],
        ],
        comment: [[/-->/, "comment", "@pop"], [/./, "comment"]],
        script: [[/<\/script>/, "keyword", "@pop"], [/./, "source"]],
        style: [[/<\/style>/, "keyword", "@pop"], [/./, "source"]],
      },
    });
  }
}
